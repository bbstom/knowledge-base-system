# 数据库配置安全升级方案

## 📋 需求说明

将数据库配置从 `.env` 文件迁移到管理员后台，提高安全性：

- **用户数据库**: 只有一个，存储所有网站数据（用户、订单、配置等）
- **查询数据库**: 可以有多个，用于数据查询功能
- **安全性**: 密码加密存储，只有管理员可以配置

---

## 🏗️ 架构设计

### 1. 数据存储

```javascript
// SystemConfig 模型扩展
{
  databases: {
    // 用户数据库（必需，唯一）
    user: {
      name: String,           // 数据库名称
      type: String,           // 类型: mongodb
      host: String,           // 主机地址
      port: Number,           // 端口
      username: String,       // 用户名
      password: String,       // 密码（加密存储）
      database: String,       // 数据库名
      connectionPool: Number, // 连接池大小
      timeout: Number,        // 超时时间
      enabled: Boolean        // 是否启用
    },
    
    // 查询数据库（可选，多个）
    query: [{
      id: String,             // 唯一标识
      name: String,           // 显示名称
      type: String,           // 类型: mongodb/mysql
      host: String,
      port: Number,
      username: String,
      password: String,       // 加密存储
      database: String,
      connectionPool: Number,
      timeout: Number,
      enabled: Boolean,
      description: String     // 描述
    }]
  }
}
```

### 2. 初始化流程

```
服务器启动
    ↓
检查 SystemConfig 是否存在数据库配置
    ↓
    ├─ 存在 → 从数据库读取配置（解密密码）
    │         ↓
    │         建立数据库连接
    │         ↓
    │         启动服务器
    │
    └─ 不存在 → 使用 .env 默认配置
              ↓
              建立数据库连接
              ↓
              创建初始 SystemConfig
              ↓
              启动服务器
```

### 3. 配置更新流程

```
管理员修改数据库配置
    ↓
验证配置（测试连接）
    ↓
加密密码
    ↓
保存到 SystemConfig
    ↓
重新建立数据库连接
    ↓
返回成功/失败
```

---

## 💻 实现代码

### 1. 加密工具增强

```javascript
// server/utils/encryption.js
const crypto = require('crypto');

// 使用环境变量中的密钥（这个可以保留在 .env 中）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * 加密数据库密码
 */
function encryptPassword(password) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 解密数据库密码
 */
function decryptPassword(encryptedPassword) {
  const parts = encryptedPassword.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = {
  encryptPassword,
  decryptPassword
};
```

### 2. 数据库连接管理器

```javascript
// server/config/databaseManager.js
const mongoose = require('mongoose');
const { encryptPassword, decryptPassword } = require('../utils/encryption');

class DatabaseManager {
  constructor() {
    this.userConnection = null;
    this.queryConnections = new Map();
    this.connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      bufferCommands: false,
    };
  }

  /**
   * 构建 MongoDB 连接字符串
   */
  buildMongoURI(config) {
    const { host, port, username, password, database } = config;
    const decryptedPassword = password.includes(':') 
      ? decryptPassword(password) 
      : password;
    
    if (username && decryptedPassword) {
      return `mongodb://${username}:${encodeURIComponent(decryptedPassword)}@${host}:${port}/${database}`;
    }
    return `mongodb://${host}:${port}/${database}`;
  }

  /**
   * 连接用户数据库
   */
  async connectUserDatabase(config) {
    try {
      if (this.userConnection) {
        await this.userConnection.close();
      }

      const uri = this.buildMongoURI(config);
      this.userConnection = mongoose.createConnection(uri, this.connectionOptions);

      await new Promise((resolve, reject) => {
        this.userConnection.once('connected', resolve);
        this.userConnection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      console.log('✅ 用户数据库连接成功');
      return { success: true };
    } catch (error) {
      console.error('❌ 用户数据库连接失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 连接查询数据库
   */
  async connectQueryDatabase(config) {
    try {
      const existingConn = this.queryConnections.get(config.id);
      if (existingConn) {
        await existingConn.close();
      }

      const uri = this.buildMongoURI(config);
      const connection = mongoose.createConnection(uri, this.connectionOptions);

      await new Promise((resolve, reject) => {
        connection.once('connected', resolve);
        connection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      this.queryConnections.set(config.id, connection);
      console.log(`✅ 查询数据库 [${config.name}] 连接成功`);
      return { success: true };
    } catch (error) {
      console.error(`❌ 查询数据库 [${config.name}] 连接失败:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 测试数据库连接
   */
  async testConnection(config) {
    try {
      const uri = this.buildMongoURI(config);
      const testConn = mongoose.createConnection(uri, {
        ...this.connectionOptions,
        serverSelectionTimeoutMS: 10000
      });

      await new Promise((resolve, reject) => {
        testConn.once('connected', resolve);
        testConn.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 10000);
      });

      await testConn.close();
      return { success: true, message: '连接测试成功' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * 从 SystemConfig 初始化所有连接
   */
  async initializeFromConfig() {
    try {
      // 首先使用 .env 连接到用户数据库以读取配置
      const defaultURI = process.env.USER_MONGO_URI;
      if (!defaultURI) {
        throw new Error('USER_MONGO_URI 未在 .env 中配置');
      }

      this.userConnection = mongoose.createConnection(defaultURI, this.connectionOptions);
      await new Promise((resolve, reject) => {
        this.userConnection.once('connected', resolve);
        this.userConnection.once('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 30000);
      });

      console.log('✅ 使用默认配置连接用户数据库成功');

      // 尝试读取 SystemConfig
      const SystemConfig = this.userConnection.model('SystemConfig', require('../models/SystemConfig').schema);
      const config = await SystemConfig.findOne();

      if (config && config.databases) {
        // 如果有配置的用户数据库，重新连接
        if (config.databases.user && config.databases.user.enabled) {
          console.log('📝 发现数据库配置，重新连接...');
          await this.connectUserDatabase(config.databases.user);
        }

        // 连接所有启用的查询数据库
        if (config.databases.query && Array.isArray(config.databases.query)) {
          for (const queryDB of config.databases.query) {
            if (queryDB.enabled) {
              await this.connectQueryDatabase(queryDB);
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取用户数据库连接
   */
  getUserConnection() {
    if (!this.userConnection) {
      throw new Error('用户数据库未连接');
    }
    return this.userConnection;
  }

  /**
   * 获取查询数据库连接
   */
  getQueryConnection(id) {
    const connection = this.queryConnections.get(id);
    if (!connection) {
      throw new Error(`查询数据库 [${id}] 未连接`);
    }
    return connection;
  }

  /**
   * 获取所有查询数据库连接
   */
  getAllQueryConnections() {
    return Array.from(this.queryConnections.values());
  }
}

// 单例模式
const dbManager = new DatabaseManager();

module.exports = dbManager;
```

### 3. 更新 server.js

```javascript
// server/server.js
const express = require('express');
const dbManager = require('./config/databaseManager');

async function startServer() {
  try {
    // 初始化数据库连接
    console.log('🔄 正在初始化数据库连接...');
    const result = await dbManager.initializeFromConfig();
    
    if (!result.success) {
      console.error('❌ 数据库初始化失败，服务器无法启动');
      process.exit(1);
    }

    // 创建 Express 应用
    const app = express();
    
    // ... 其他中间件和路由配置 ...

    // 启动服务器
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ 服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
```

### 4. 更新模型文件

```javascript
// server/models/User.js
const mongoose = require('mongoose');
const dbManager = require('../config/databaseManager');

const userSchema = new mongoose.Schema({
  // ... schema 定义 ...
});

// 使用 dbManager 获取连接
const User = dbManager.getUserConnection().model('User', userSchema);

module.exports = User;
```

### 5. API 路由

```javascript
// server/routes/systemConfig.js

/**
 * PUT /api/system-config/databases
 * 更新数据库配置
 */
router.put('/databases', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { user, query } = req.body;
    const dbManager = require('../config/databaseManager');
    const { encryptPassword } = require('../utils/encryption');

    // 验证用户数据库配置
    if (user) {
      // 加密密码
      if (user.password && !user.password.includes(':')) {
        user.password = encryptPassword(user.password);
      }

      // 测试连接
      const testResult = await dbManager.testConnection(user);
      if (!testResult.success) {
        return res.json({
          success: false,
          message: `用户数据库连接测试失败: ${testResult.message}`
        });
      }
    }

    // 验证查询数据库配置
    if (query && Array.isArray(query)) {
      for (const db of query) {
        // 加密密码
        if (db.password && !db.password.includes(':')) {
          db.password = encryptPassword(db.password);
        }

        // 如果启用，测试连接
        if (db.enabled) {
          const testResult = await dbManager.testConnection(db);
          if (!testResult.success) {
            return res.json({
              success: false,
              message: `查询数据库 [${db.name}] 连接测试失败: ${testResult.message}`
            });
          }
        }
      }
    }

    // 保存配置
    const config = await SystemConfig.getConfig();
    config.databases = { user, query };
    await config.save();

    // 重新建立连接
    if (user && user.enabled) {
      await dbManager.connectUserDatabase(user);
    }

    if (query && Array.isArray(query)) {
      for (const db of query) {
        if (db.enabled) {
          await dbManager.connectQueryDatabase(db);
        }
      }
    }

    res.json({
      success: true,
      message: '数据库配置已更新并重新连接'
    });
  } catch (error) {
    console.error('更新数据库配置失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /api/system-config/databases/test
 * 测试数据库连接
 */
router.post('/databases/test', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = req.body;
    const dbManager = require('../config/databaseManager');
    
    const result = await dbManager.testConnection(config);
    res.json(result);
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 🎨 前端界面更新

### DatabaseConfig 组件增强

```typescript
// src/pages/Admin/DatabaseConfig.tsx

export const DatabaseConfig: React.FC<Props> = ({
  userDatabase,
  queryDatabases,
  onUpdateUserDatabase,
  onUpdateQueryDatabases,
  onSave
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestConnection = async (config: any) => {
    setTesting(true);
    setTestResult(null);

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/system-config/databases/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast.success('连接测试成功！');
      } else {
        toast.error(`连接测试失败: ${result.message}`);
      }
    } catch (error: any) {
      toast.error('测试失败: ' + error.message);
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 用户数据库配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">用户数据库配置</h3>
        <p className="text-sm text-gray-600 mb-4">
          用户数据库存储所有网站数据（用户、订单、配置等），只能配置一个
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">主机地址</label>
              <input
                type="text"
                value={userDatabase.host || ''}
                onChange={(e) => onUpdateUserDatabase({ ...userDatabase, host: e.target.value })}
                className="input-field"
                placeholder="localhost"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">端口</label>
              <input
                type="number"
                value={userDatabase.port || 27017}
                onChange={(e) => onUpdateUserDatabase({ ...userDatabase, port: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">用户名</label>
              <input
                type="text"
                value={userDatabase.username || ''}
                onChange={(e) => onUpdateUserDatabase({ ...userDatabase, username: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">密码</label>
              <input
                type="password"
                value={userDatabase.password || ''}
                onChange={(e) => onUpdateUserDatabase({ ...userDatabase, password: e.target.value })}
                className="input-field"
                placeholder="数据库密码（加密存储）"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">数据库名</label>
            <input
              type="text"
              value={userDatabase.database || ''}
              onChange={(e) => onUpdateUserDatabase({ ...userDatabase, database: e.target.value })}
              className="input-field"
              placeholder="infosearch"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={userDatabase.enabled !== false}
              onChange={(e) => onUpdateUserDatabase({ ...userDatabase, enabled: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium">启用此数据库</label>
          </div>

          <button
            onClick={() => handleTestConnection(userDatabase)}
            disabled={testing}
            className="btn-secondary"
          >
            {testing ? '测试中...' : '测试连接'}
          </button>

          {testResult && (
            <div className={`p-3 rounded ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* 查询数据库配置 */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">查询数据库配置</h3>
        <p className="text-sm text-gray-600 mb-4">
          查询数据库用于数据查询功能，可以配置多个
        </p>

        {/* 查询数据库列表 */}
        {queryDatabases.map((db, index) => (
          <div key={db.id} className="border rounded p-4 mb-4">
            {/* 类似的表单字段 */}
          </div>
        ))}

        <button
          onClick={() => {
            const newDB = {
              id: `query_${Date.now()}`,
              name: '新查询数据库',
              type: 'mongodb',
              host: 'localhost',
              port: 27017,
              enabled: false
            };
            onUpdateQueryDatabases([...queryDatabases, newDB]);
          }}
          className="btn-secondary"
        >
          添加查询数据库
        </button>
      </div>

      {/* 保存按钮 */}
      <button
        onClick={() => onSave({ user: userDatabase, query: queryDatabases })}
        className="btn-primary"
      >
        保存配置
      </button>
    </div>
  );
};
```

---

## 🔒 安全注意事项

### 1. 加密密钥管理
```bash
# .env 文件（这个密钥必须保密）
ENCRYPTION_KEY=your-very-secure-32-char-key-here
```

### 2. 权限控制
- 只有管理员可以查看和修改数据库配置
- 密码在前端显示时用 `******` 遮盖
- API 响应中不返回明文密码

### 3. 连接测试
- 保存前必须测试连接
- 测试失败不允许保存
- 提供详细的错误信息

### 4. 备份建议
- 修改配置前备份当前配置
- 提供配置导出/导入功能
- 记录配置变更日志

---

## 📝 迁移步骤

### 1. 首次部署
```bash
# 1. 在 .env 中保留默认配置（用于首次启动）
USER_MONGO_URI=mongodb://localhost:27017/infosearch
ENCRYPTION_KEY=your-32-char-secret-key

# 2. 启动服务器
npm run dev

# 3. 登录管理后台，配置数据库
# 4. 测试连接成功后保存
# 5. 重启服务器（自动使用新配置）
```

### 2. 从 .env 迁移
```bash
# 1. 备份当前 .env 文件
cp .env .env.backup

# 2. 在管理后台输入数据库配置
# 3. 测试连接
# 4. 保存配置
# 5. 重启服务器
# 6. 验证功能正常
# 7. 从 .env 中删除数据库配置（可选）
```

---

## ✅ 优势

1. **安全性提升** - 密码加密存储，不在代码仓库中
2. **灵活性** - 可以在运行时修改配置
3. **多数据库支持** - 轻松管理多个查询数据库
4. **易于维护** - 通过界面管理，无需修改文件
5. **测试功能** - 保存前测试连接，避免配置错误

---

## 🎯 总结

这个方案实现了：
- ✅ 数据库配置存储在 SystemConfig 中
- ✅ 密码加密存储
- ✅ 支持一个用户数据库 + 多个查询数据库
- ✅ 管理员后台可视化配置
- ✅ 连接测试功能
- ✅ 动态重连功能
- ✅ 不依赖 .env 文件（首次启动除外）

需要我帮你实现这些代码吗？
