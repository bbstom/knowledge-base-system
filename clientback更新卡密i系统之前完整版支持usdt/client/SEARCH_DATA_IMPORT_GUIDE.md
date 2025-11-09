# 搜索数据导入指南

## 问题诊断

如果搜索时出现500错误，可能是以下原因：

1. **数据结构不匹配** - 手动添加的数据结构与模型不一致
2. **data字段类型错误** - data字段必须是Map类型
3. **缺少searchableFields** - 没有正确设置可搜索字段
4. **数据库关联错误** - databaseId不存在或无效

## 检查现有数据

运行检查脚本查看数据状态：

```bash
cd server
node scripts/checkSearchData.js
```

这将显示：
- 所有数据库及其记录数
- 示例数据的结构
- data字段的类型
- 是否有孤立数据

## 清除错误数据

如果发现数据有问题，可以清除并重新导入：

```bash
# 进入MongoDB shell
mongosh

# 切换到数据库
use knowbase

# 删除所有搜索数据
db.searchdatas.deleteMany({})

# 退出
exit
```

## 方法1: 使用测试数据脚本

最简单的方法，添加5条测试数据：

```bash
cd server
node scripts/addTestSearchData.js
```

## 方法2: 从文件导入

### 准备数据文件

#### JSON格式 (推荐)
```json
[
  {
    "姓名": "张三",
    "身份证": "110101199001011234",
    "手机号": "13800138000",
    "QQ号": "123456789",
    "微信号": "zhangsan123",
    "邮箱": "zhangsan@example.com",
    "地址": "北京市朝阳区某某街道",
    "公司": "某某科技有限公司"
  }
]
```

#### CSV格式
```csv
姓名,身份证,手机号,QQ号,微信号,邮箱,地址,公司
张三,110101199001011234,13800138000,123456789,zhangsan123,zhangsan@example.com,北京市朝阳区某某街道,某某科技有限公司
```

### 获取数据库ID

首先需要知道目标数据库的ID：

```bash
# 进入MongoDB shell
mongosh

# 切换到数据库
use knowbase

# 查看所有数据库
db.databases.find({}, {name: 1, _id: 1})

# 复制你要使用的数据库的_id
```

### 执行导入

```bash
cd server

# 导入JSON文件
node scripts/importSearchData.js data/sample-data.json <数据库ID>

# 导入CSV文件
node scripts/importSearchData.js data/sample-data.csv <数据库ID>

# 示例（替换为实际的数据库ID）
node scripts/importSearchData.js data/sample-data.json 507f1f77bcf86cd799439011
```

## 方法3: 使用MongoDB Compass导入

1. 打开MongoDB Compass
2. 连接到数据库
3. 选择 `knowbase` 数据库
4. 选择 `searchdatas` 集合
5. 点击 "ADD DATA" → "Import File"
6. 选择JSON或CSV文件
7. 确保字段映射正确

**重要**: 使用Compass导入时，需要手动确保：
- `databaseId` 字段是有效的ObjectId
- `data` 字段是对象格式
- `searchableFields` 包含所有可搜索字段
- `isActive` 设置为 true

## 数据结构说明

### 正确的数据结构

```javascript
{
  databaseId: ObjectId("507f1f77bcf86cd799439011"),
  data: {
    "姓名": "张三",
    "身份证": "110101199001011234",
    "手机号": "13800138000",
    // ... 其他字段
  },
  searchableFields: {
    name: "张三",
    idcard: "110101199001011234",
    phone: "13800138000",
    qq: "123456789",
    wechat: "zhangsan123",
    email: "zhangsan@example.com",
    address: "北京市朝阳区某某街道",
    company: "某某科技有限公司"
  },
  isActive: true,
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2024-01-01T00:00:00.000Z")
}
```

### 字段说明

- **databaseId**: 必须是有效的数据库ObjectId
- **data**: 存储完整的数据行（所有字段），用于显示
- **searchableFields**: 用于搜索的字段，必须使用英文字段名
- **isActive**: 是否启用，必须为true才能被搜索到

### 字段映射

| 中文字段 | 英文字段 | searchableFields中的键 |
|---------|---------|----------------------|
| 姓名 | name | name |
| 身份证 | idcard | idcard |
| 手机号 | phone | phone |
| QQ号 | qq | qq |
| 微信号 | wechat | wechat |
| 邮箱 | email | email |
| 地址 | address | address |
| 公司 | company | company |

## 常见问题

### Q: 导入后搜索不到数据？

A: 检查以下几点：
1. `isActive` 是否为 true
2. `searchableFields` 是否正确设置
3. `databaseId` 是否有效
4. 搜索的字段类型是否匹配

### Q: 500错误怎么办？

A: 
1. 运行 `node scripts/checkSearchData.js` 检查数据
2. 查看服务器控制台的错误日志
3. 确认data字段的类型
4. 尝试清除数据后重新导入

### Q: 如何批量导入大量数据？

A: 
1. 准备JSON或CSV文件
2. 使用 `importSearchData.js` 脚本
3. 脚本会自动处理字段映射和数据转换
4. 每100条会显示进度

### Q: 可以自定义字段吗？

A: 可以！
- `data` 字段可以包含任意字段
- 但只有在 `searchableFields` 中的字段才能被搜索
- 目前支持的搜索字段：name, idcard, phone, qq, wechat, email, address, company

## 示例文件

项目中已包含示例文件：
- `server/data/sample-data.json` - JSON格式示例
- `server/data/sample-data.csv` - CSV格式示例

可以直接使用这些文件进行测试。

## 验证导入

导入完成后，可以：

1. 运行检查脚本：
```bash
node scripts/checkSearchData.js
```

2. 在前端搜索页面测试搜索功能

3. 检查数据库记录数是否正确更新

## 需要帮助？

如果遇到问题：
1. 查看服务器控制台的详细错误信息
2. 运行检查脚本诊断数据
3. 确认数据结构是否符合要求
4. 检查数据库连接是否正常
