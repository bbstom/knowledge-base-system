# 充值功能设置指南

## 🎯 快速开始

### 1. 配置环境变量

在项目根目录创建或编辑 `.env` 文件：

```env
# BEpusdt支付配置
REACT_APP_BEPUSDT_URL=https://your-bepusdt-domain.com
REACT_APP_BEPUSDT_API_KEY=your-api-key
REACT_APP_BEPUSDT_MERCHANT_ID=your-merchant-id
```

### 2. 部署BEpusdt服务

如果还没有部署BEpusdt服务，请按照以下步骤：

```bash
# 克隆BEpusdt项目
git clone https://github.com/v03413/BEpusdt.git
cd BEpusdt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库和TRC20相关信息

# 使用Docker启动服务
docker-compose up -d
```

### 3. 获取API密钥

1. 访问BEpusdt管理后台
2. 进入"设置"页面
3. 生成新的API密钥
4. 复制API密钥和商户ID到项目的 `.env` 文件

### 4. 测试充值功能

1. 启动前端项目：`npm start`
2. 登录系统
3. 访问"账户充值"页面：`/dashboard/recharge`
4. 选择充值金额和币种
5. 创建测试订单

---

## 📁 相关文件

### 前端文件
- `src/pages/Dashboard/Recharge.tsx` - 充值页面组件
- `src/utils/bepusdt.ts` - BEpusdt API工具类
- `src/App.tsx` - 路由配置
- `src/components/Layout/Sidebar.tsx` - 侧边栏导航

### 文档文件
- `BEPUSDT_INTEGRATION_GUIDE.md` - 完整集成指南
- `RECHARGE_SETUP.md` - 本文件（快速设置指南）

---

## 🔧 功能说明

### 支持的币种
- **USDT (TRC20)** - 泰达币，稳定币
- **TRX (TRC20)** - 波场币

### 充值流程
1. 用户选择充值金额（预设或自定义）
2. 选择支付币种（USDT或TRX）
3. 系统显示实时汇率和需支付的加密货币数量
4. 创建订单后显示收款地址和二维码
5. 用户使用钱包转账
6. 系统自动检测到账并更新余额

### 预设金额
- ¥10
- ¥50
- ¥100
- ¥200
- ¥500
- ¥1000
- 自定义金额（最低¥10）

---

## 🔐 安全提示

1. **保护API密钥**
   - 不要将API密钥提交到代码仓库
   - 使用环境变量存储敏感信息
   - 定期更换API密钥

2. **验证Webhook签名**
   - 后端必须验证所有webhook通知的签名
   - 防止伪造的支付通知

3. **设置金额限制**
   - 建议设置单笔充值上限
   - 监控异常充值行为

---

## 🐛 常见问题

### Q: 创建订单失败？
**A:** 检查以下几点：
- BEpusdt服务是否正常运行
- API密钥是否正确配置
- 网络连接是否正常
- 查看浏览器控制台的错误信息

### Q: 支付后余额没有更新？
**A:** 可能的原因：
- Webhook通知URL配置错误
- 后端没有正确处理webhook通知
- 订单状态查询失败
- 检查后端日志

### Q: 如何测试充值功能？
**A:** 
1. 使用测试网络（Nile测试网）
2. 获取测试TRX和USDT
3. 创建小额订单进行测试
4. 验证整个流程是否正常

---

## 📞 获取帮助

- **BEpusdt项目：** https://github.com/v03413/BEpusdt
- **完整文档：** 查看 `BEPUSDT_INTEGRATION_GUIDE.md`
- **问题反馈：** https://github.com/v03413/BEpusdt/issues

---

## ✅ 检查清单

部署前请确认：

- [ ] BEpusdt服务已部署并运行
- [ ] 环境变量已正确配置
- [ ] API密钥已获取并配置
- [ ] Webhook URL已配置
- [ ] 测试订单创建成功
- [ ] 测试支付流程完整
- [ ] 余额更新正常
- [ ] 充值记录显示正常

---

祝您使用愉快！如有问题，请查看完整文档或提交Issue。
