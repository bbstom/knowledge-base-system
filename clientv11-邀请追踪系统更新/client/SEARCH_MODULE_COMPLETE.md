# 搜索模块开发完成

## 功能特性

### 1. 模糊匹配搜索
- 支持正则表达式模糊匹配
- 不区分大小写
- 可以搜索部分关键词

### 2. 多字段搜索
支持以下搜索类型：
- 身份证 (idcard)
- 手机号 (phone)
- 姓名 (name)
- QQ号 (qq)
- 微信号 (wechat)
- 邮箱 (email)
- 地址 (address)
- 公司 (company)

### 3. 完整数据展示
- 搜索结果显示数据库中该条记录的所有字段
- 以表格形式展示，清晰易读
- 匹配字段高亮显示（黄色背景）

### 4. 数据库集成
- 从Database集合获取可用数据库列表
- 从SearchData集合查询实际数据
- 支持指定数据库搜索或自动搜索所有数据库

### 5. 积分系统
- 每次搜索消耗10积分
- 搜索前检查用户积分余额
- 搜索后自动扣除积分并记录日志
- 显示剩余积分

## 数据模型

### SearchData 模型
```javascript
{
  databaseId: ObjectId,        // 所属数据库
  data: Map<String, String>,   // 完整数据（所有字段）
  searchableFields: {          // 可搜索字段（建立索引）
    idcard: String,
    phone: String,
    name: String,
    qq: String,
    wechat: String,
    email: String,
    address: String,
    company: String
  },
  isActive: Boolean,           // 是否启用
  timestamps: true             // 创建和更新时间
}
```

## API接口

### 1. 执行搜索
```
POST /api/search
Authorization: Bearer {token}

Request Body:
{
  "type": "phone",           // 搜索类型
  "query": "138",            // 搜索关键词
  "databaseId": "auto"       // 数据库ID或"auto"
}

Response:
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "...",
        "database": {
          "id": "...",
          "name": "数据库名称",
          "description": "数据库描述"
        },
        "data": {
          "姓名": "张三",
          "手机号": "13800138000",
          ...
        },
        "matchedField": "phone",
        "matchedValue": "13800138000"
      }
    ],
    "total": 1,
    "query": "138",
    "type": "phone",
    "cost": 10,
    "remainingBalance": 90
  }
}
```

### 2. 获取数据库列表
```
GET /api/search/databases

Response:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "数据库名称",
      "description": "数据库描述",
      "recordCount": 1000,
      "supportedTypes": ["phone", "name", "idcard"],
      "lastUpdated": "2024-01-01"
    }
  ]
}
```

## 测试数据

### 添加测试数据
```bash
cd server
node scripts/addTestSearchData.js
```

这将添加5条测试数据，包含：
- 张三 (13800138000)
- 李四 (13900139000)
- 王五 (13700137000)
- 赵六 (13600136000)
- 孙七 (13500135000)

### 测试搜索示例
1. 搜索手机号：输入 "138" 可以找到张三
2. 搜索姓名：输入 "张" 可以找到张三
3. 搜索身份证：输入 "110101" 可以找到所有人
4. 搜索QQ号：输入 "123456789" 可以找到张三

## 前端界面

### 搜索结果展示
- 结果摘要卡片：显示找到的结果数量、消耗积分、剩余积分
- 结果列表：每条结果显示：
  - 数据库名称和描述
  - 匹配标记
  - 完整数据表格（所有字段）
  - 匹配字段高亮显示

### 空结果提示
- 友好的空状态提示
- 建议用户尝试其他关键词

## 使用流程

1. 用户登录系统
2. 进入搜索页面
3. 选择搜索类型（手机号、姓名等）
4. 输入搜索关键词
5. 点击搜索按钮
6. 系统检查积分余额
7. 执行模糊匹配搜索
8. 扣除积分并记录日志
9. 显示搜索结果（完整数据）

## 注意事项

1. **积分不足**：搜索前会检查用户积分，不足时提示充值
2. **搜索成本**：每次搜索消耗10积分（可在代码中调整）
3. **结果限制**：单次搜索最多返回100条结果
4. **模糊匹配**：使用正则表达式，支持部分匹配
5. **数据安全**：需要登录才能搜索，所有操作都有日志记录

## 后续优化建议

1. 添加搜索历史记录
2. 支持高级搜索（多条件组合）
3. 添加搜索结果导出功能
4. 优化大数据量搜索性能
5. 添加搜索结果缓存
6. 支持自定义搜索字段
7. 添加搜索统计和分析

## 文件清单

### 后端
- `server/models/SearchData.js` - 搜索数据模型
- `server/routes/search.js` - 搜索路由（已更新）
- `server/scripts/addTestSearchData.js` - 测试数据脚本

### 前端
- `src/pages/Search.tsx` - 搜索页面（已更新）
- `src/utils/api.ts` - API类型定义（已更新）
- `src/utils/realApi.ts` - API实现（已更新）

## 完成状态

✅ 搜索数据模型创建
✅ 模糊匹配搜索实现
✅ 完整数据展示
✅ 数据库集成
✅ 积分系统集成
✅ 前端界面优化
✅ 测试数据脚本
✅ API接口完善

搜索模块开发完成，可以正常使用！
