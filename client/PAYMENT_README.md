# 支付系统文档索引

## 🎉 支付系统已成功部署！

通过Webhook成功接收BEpusdt支付通知，系统运行正常。

## 📚 文档导航

### 核心文档

1. **[完整文档](./PAYMENT_SYSTEM_DOCUMENTATION.md)** ⭐
   - 系统概述和架构
   - 技术实现细节
   - API接口文档
   - 安全措施
   - 测试指南
   - 监控和维护
   - 常见问题

2. **[快速参考](./PAYMENT_QUICK_REFERENCE.md)** 🚀
   - 快速开始指南
   - API快速参考
   - 常用命令
   - 故障排查
   - 监控命令

### 配置文档

3. **[Webhook指南](./BEPUSDT_WEBHOOK_GUIDE.md)**
   - Webhook工作原理
   - 配置步骤
   - 测试方法
   - 常见问题

4. **[端口映射指南](./PORT_MAPPING_GUIDE.md)**
   - 端口映射配置
   - 路由器设置
   - 防火墙配置
   - 测试方法

5. **[网络访问指南](./NETWORK_ACCESS_GUIDE.md)**
   - 局域网访问配置
   - 公网访问配置
   - 内网穿透方案
   - 安全建议

6. **[查询问题解决方案](./BEPUSDT_QUERY_SOLUTION.md)**
   - BEpusdt不支持查询API的说明
   - Webhook回调机制
   - 前端轮询方案

## 🚀 快速开始

### 1. 环境配置

```env
# server/.env
BEPUSDT_URL=https://pay.vpno.eu.org
BEPUSDT_MERCHANT_ID=1000
BEPUSDT_SECRET_KEY=your_secret_key
BACKEND_URL=http://dc.obash.cc:3001
```

### 2. 启动服务器

```bash
cd server
npm start
```

### 3. 配置BEpusdt

在BEpusdt管理后台配置Webhook URL：
```
http://dc.obash.cc:3001/api/recharge/webhook
```

### 4. 测试支付

创建测试订单，使用小额支付测试。

## 📁 核心文件

### 后端代码

```
server/
├── services/
│   ├── bepusdtService.js      # BEpusdt服务
│   ├── rechargeService.js     # 充值服务
│   └── commissionService.js   # 佣金服务
├── routes/
│   └── recharge.js            # 充值路由（含Webhook）
├── models/
│   ├── RechargeOrder.js       # 订单模型
│   └── User.js                # 用户模型
└── scripts/
    ├── simulatePayment.js     # 模拟支付
    ├── manualUpdateOrder.js   # 手动更新订单
    ├── testBepusdtSignature.js # 测试签名
    └── showLocalIP.js         # 显示本机IP
```

### 前端代码

```
src/
├── pages/
│   └── Dashboard/
│       ├── Recharge.tsx       # 充值页面
│       ├── RechargeCenter.tsx # 充值中心
│       └── Orders.tsx         # 订单列表
└── utils/
    ├── api.ts                 # API工具
    └── bepusdt.ts             # BEpusdt工具
```

## 🔧 常用命令

### 查看本机IP

```bash
node server/scripts/showLocalIP.js
```

### 模拟支付

```bash
node server/scripts/simulatePayment.js ORDER123456
```

### 手动更新订单

```bash
node server/scripts/manualUpdateOrder.js ORDER123 paid TX_HASH
```

### 测试签名

```bash
node server/scripts/testBepusdtSignature.js
```

## 🔍 监控和调试

### 查看服务器日志

```bash
cd server
npm start

# 日志会显示：
# 📨 收到Webhook通知
# ✅ Webhook签名验证通过
# 💰 订单已支付，开始处理
# 🎉 订单处理完成
```

### 查看订单统计

```bash
# 待处理订单
mongo userdata --eval "db.rechargeorders.find({status:'pending'}).count()"

# 今日订单
mongo userdata --eval "db.rechargeorders.find({createdAt:{\$gte:new Date(new Date().setHours(0,0,0,0))}}).count()"

# 支付成功率
mongo userdata --eval "
  var total = db.rechargeorders.count();
  var paid = db.rechargeorders.find({status:'paid'}).count();
  print('成功率: ' + (paid/total*100).toFixed(2) + '%');
"
```

## ⚠️ 常见问题

### Webhook未收到通知

1. 检查BACKEND_URL配置
2. 检查端口映射
3. 检查防火墙
4. 查看BEpusdt管理后台日志

### 签名验证失败

1. 检查SECRET_KEY配置
2. 运行测试脚本：`node server/scripts/testBepusdtSignature.js`

### 订单一直pending

1. 检查用户是否真的支付了
2. 检查Webhook是否收到
3. 查看服务器日志

## 🔐 安全建议

1. ✅ 使用HTTPS（生产环境）
2. ✅ 验证所有Webhook签名
3. ✅ 防止订单重复处理
4. ✅ 记录所有操作日志
5. ✅ 定期备份数据库
6. ✅ 监控异常订单

## 📊 系统状态

### 当前配置

- **BEpusdt URL**: https://pay.vpno.eu.org
- **商户ID**: 1000
- **Webhook URL**: http://dc.obash.cc:3001/api/recharge/webhook
- **支持币种**: USDT (TRC20), TRX
- **支付类型**: 积分充值, VIP会员

### 功能状态

- ✅ 创建订单
- ✅ Webhook回调
- ✅ 签名验证
- ✅ 订单状态更新
- ✅ 积分充值
- ✅ VIP购买
- ✅ 佣金计算
- ✅ 订单过期清理

## 🎯 下一步

1. **生产环境部署**
   - 配置HTTPS
   - 使用Nginx反向代理
   - 配置域名SSL证书

2. **监控和告警**
   - 设置订单监控
   - 配置异常告警
   - 定期检查日志

3. **性能优化**
   - 添加数据库索引
   - 实现缓存机制
   - 优化查询性能

4. **功能扩展**
   - 支持更多币种
   - 添加退款功能
   - 实现订单导出

## 📞 技术支持

遇到问题？

1. 查看[完整文档](./PAYMENT_SYSTEM_DOCUMENTATION.md)
2. 查看[常见问题](./PAYMENT_SYSTEM_DOCUMENTATION.md#常见问题)
3. 查看服务器日志
4. 查看BEpusdt管理后台日志

## 📝 更新日志

### v1.0.0 (2025-01-21)

- ✅ 集成BEpusdt支付网关
- ✅ 实现Webhook回调机制
- ✅ 支持USDT和TRX支付
- ✅ 集成佣金系统
- ✅ 添加订单过期清理
- ✅ 完善日志和错误处理
- ✅ 创建完整文档

## 🎉 成功案例

**首次支付测试成功！**

- 订单号: ORDER1761006775605418
- 支付金额: 4.57 TRX
- 请求金额: 10 CNY (2.19 USDT等值)
- 交易类型: TRON.TRX
- 确认时间: 2025-01-21 00:34:24
- Webhook: 成功接收并处理

系统运行正常，支付流程完整！🎊
