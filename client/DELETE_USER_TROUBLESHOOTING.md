# 删除用户功能故障排查

## 问题描述
删除用户时提示"删除用户失败"

## 排查步骤

### 1. 检查服务器是否已重启

删除用户API是新添加的功能，需要重启服务器才能生效。

**开发环境：**
```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
cd server
npm run dev
```

**生产环境：**
```bash
pm2 restart all
# 或
pm2 restart server
```

### 2. 检查浏览器控制台错误

打开浏览器开发者工具（F12），查看Console标签页：

1. 尝试删除用户
2. 查看控制台输出的错误信息
3. 特别注意：
   - HTTP状态码（404, 403, 500等）
   - 错误消息内容
   - 网络请求是否成功发送

**常见错误：**

#### 404 Not Found
```
删除失败，状态码: 404
```
**原因：** 服务器未重启，API端点不存在  
**解决：** 重启服务器

#### 403 Forbidden
```
错误信息: { success: false, message: "不能删除管理员账户" }
```
**原因：** 尝试删除管理员账户  
**解决：** 只能删除普通用户，不能删除管理员

#### 401 Unauthorized
```
错误信息: { success: false, message: "未登录" }
```
**原因：** Token过期或无效  
**解决：** 重新登录

### 3. 检查服务器日志

查看服务器控制台输出：

**应该看到的日志：**
```
🗑️  管理员删除用户: 用户ID
  删除用户 用户名 的相关数据...
  - 删除 X 条搜索记录
  - 删除 X 条余额日志
  - 删除 X 条提现订单
  - 更新 X 个被推荐用户的推荐关系
✅ 用户 用户名 及其相关数据已删除
```

**如果看到错误：**
```
❌ 删除用户失败: Error: ...
```
记录完整的错误信息。

### 4. 检查网络请求

在浏览器开发者工具的Network标签页：

1. 尝试删除用户
2. 找到 `DELETE /api/admin/users/用户ID` 请求
3. 检查：
   - 请求方法：应该是 DELETE
   - 请求头：应该包含 Authorization: Bearer token
   - 响应状态码
   - 响应内容

### 5. 手动测试API

使用curl或Postman测试API：

```bash
# 替换 YOUR_TOKEN 和 USER_ID
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**成功响应：**
```json
{
  "success": true,
  "message": "用户删除成功"
}
```

**失败响应示例：**
```json
{
  "success": false,
  "message": "用户不存在"
}
```

## 常见问题解决

### 问题1: 服务器未重启

**症状：** 404 Not Found

**解决方案：**
```bash
# 开发环境
cd server
npm run dev

# 生产环境
pm2 restart all
```

### 问题2: 尝试删除管理员

**症状：** 403 Forbidden, "不能删除管理员账户"

**解决方案：** 这是正常的安全限制，不能删除管理员账户

### 问题3: Token过期

**症状：** 401 Unauthorized

**解决方案：** 重新登录获取新的token

### 问题4: 数据库连接问题

**症状：** 500 Internal Server Error

**解决方案：**
1. 检查数据库连接是否正常
2. 查看服务器日志的详细错误信息
3. 确认.env文件配置正确

### 问题5: 用户ID格式错误

**症状：** 500 Internal Server Error, "Cast to ObjectId failed"

**解决方案：** 确保传递的是有效的MongoDB ObjectId

## 验证修复

删除成功后应该看到：

1. **前端：**
   - 绿色成功提示："用户 XXX 已删除"
   - 用户列表自动刷新
   - 被删除的用户不再显示

2. **服务器日志：**
   - 显示删除过程的详细信息
   - 显示删除的记录数量
   - 显示成功消息

3. **数据库：**
   - 用户记录已删除
   - 相关的搜索记录已删除
   - 相关的余额日志已删除
   - 相关的提现订单已删除

## 调试技巧

### 启用详细日志

在前端代码中已添加console.error，删除时会输出详细信息：

```javascript
console.error('删除失败，状态码:', response.status);
console.error('错误信息:', data);
```

### 检查API端点

确认API路由已正确注册：

```javascript
// server/routes/admin.js 文件末尾应该有：
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  // ... 删除逻辑
});

module.exports = router;
```

### 检查中间件

确认authMiddleware和adminMiddleware正常工作：

```javascript
// 应该在文件顶部定义
const authMiddleware = async (req, res, next) => { ... };
const adminMiddleware = (req, res, next) => { ... };
```

## 需要提供的信息

如果问题仍然存在，请提供：

1. 浏览器控制台的完整错误信息
2. 服务器日志的完整错误信息
3. Network标签中DELETE请求的详细信息
4. 服务器是否已重启
5. 尝试删除的是什么类型的用户（普通用户/管理员）

---

**最可能的原因：** 服务器未重启，新的API端点还没有生效。

**快速解决：** 重启服务器后再试。
