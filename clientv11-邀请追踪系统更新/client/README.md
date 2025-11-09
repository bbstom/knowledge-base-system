# 信息搜索平台 InfoSearch Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

一个功能完整的信息搜索平台管理系统，包含前台用户界面和后台管理系统

[功能特点](#-功能特点) • [快速开始](#-快速开始) • [文档](#-文档) • [技术栈](#-技术栈)

</div>

---

## 📋 项目简介

InfoSearch Platform 是一个现代化的信息搜索平台，提供完整的用户管理、积分系统、推荐系统、佣金系统和USDT提现功能。系统采用前后端分离架构，所有功能都可以在后台灵活配置，无需修改代码。

### 核心特性

- 🔍 **多种搜索类型** - 支持身份证、手机号、姓名、QQ、微博、微信、邮箱等多种搜索
- 💰 **完整积分系统** - 注册奖励、每日签到、连续签到、推荐奖励
- 🎁 **推荐系统** - 多种推荐链接格式，完整的推荐关系追踪
- 💵 **佣金系统** - 多级佣金、灵活结算、USDT提现
- 👥 **用户管理** - 完整的用户信息、推荐关系、积分佣金管理
- ⚙️ **系统配置** - 搜索类型、数据库、邮件、积分、佣金全面配置
- 📱 **响应式设计** - 完美适配桌面端、平板端、移动端
- 🌍 **多语言支持** - 中英文切换

---

## ✨ 功能特点

### 用户端功能

- ✅ 用户注册登录（支持推荐码）
- ✅ 多种类型信息搜索
- ✅ 每日签到获取积分
- ✅ 推荐好友获得奖励
- ✅ 佣金管理和USDT提现
- ✅ 搜索历史查询
- ✅ 个人信息管理

### 管理端功能

- ✅ 用户管理（查看、搜索、详情）
- ✅ 提现管理（审核、批准、拒绝、完成）
- ✅ 系统配置（搜索类型、数据库、邮件、积分、佣金）
- ✅ 内容管理（数据库列表、FAQ、话题、广告）
- ✅ 数据统计（用户、积分、佣金、提现）

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 访问应用

打开浏览器访问：http://localhost:5173

### 默认账户

**管理员账户：**
- 邮箱：`admin@infosearch.com`
- 密码：`admin123`

**测试用户：**
- 邮箱：`user@example.com`
- 密码：`user123`

---

## 📚 文档

### 快速指南
- [快速启动指南](./QUICK_START.md) - 快速上手项目
- [项目完整总结](./PROJECT_COMPLETE_SUMMARY.md) - 完整的项目文档

### 管理指南
- [管理后台使用指南](./ADMIN_GUIDE.md) - 管理后台功能说明
- [系统配置指南](./SYSTEM_CONFIG_GUIDE.md) - 系统配置详细说明
- [用户管理指南](./FINAL_SUMMARY.md#3-用户管理模块-adminusers) - 用户管理功能

### 功能指南
- [积分系统配置指南](./POINTS_SYSTEM_GUIDE.md) - 积分系统配置
- [佣金系统配置指南](./COMMISSION_SYSTEM_GUIDE.md) - 佣金系统配置
- [提现管理指南](./WITHDRAW_MANAGEMENT_GUIDE.md) - 提现管理流程

### 其他文档
- [功能总结](./FEATURES_SUMMARY.md) - 功能列表
- [更新说明](./UPDATE_NOTES.md) - 版本更新记录
- [测试指南](./TEST_GUIDE.md) - 测试说明

---

## 🛠️ 技术栈

### 前端框架
- **React 19.1.1** - UI框架
- **TypeScript 5.9.3** - 类型安全
- **Vite 7.1.14** - 构建工具

### UI和样式
- **Tailwind CSS v4** - 样式框架
- **Lucide React** - 图标库
- **React Hot Toast** - 通知提示

### 路由和状态
- **React Router v6.28** - 路由管理
- **TanStack Query** - 数据获取和缓存

### 表单和验证
- **React Hook Form** - 表单管理
- **Zod** - 数据验证

### HTTP和工具
- **Axios** - HTTP客户端
- **js-cookie** - Cookie管理

---

## 📁 项目结构

```
client/
├── src/
│   ├── components/          # 组件
│   │   └── Layout/         # 布局组件
│   ├── contexts/           # 上下文
│   ├── data/               # 模拟数据
│   ├── pages/              # 页面
│   │   ├── Admin/         # 管理后台
│   │   ├── Auth/          # 认证
│   │   └── Dashboard/     # 用户仪表盘
│   ├── styles/            # 样式
│   ├── utils/             # 工具
│   ├── App.tsx            # 应用入口
│   └── main.tsx           # 主文件
├── public/                # 静态资源
├── docs/                  # 文档
├── package.json          # 依赖配置
└── README.md             # 项目说明
```

---

## 🎯 核心功能

### 1. 搜索系统
- 多种搜索类型支持
- 自定义搜索类型配置
- 搜索历史记录
- 积分消耗机制

### 2. 积分系统
- 注册奖励
- 每日签到
- 连续签到奖励
- 推荐奖励
- 搜索消耗

### 3. 推荐系统
- 推荐码生成
- 多种推荐链接格式
- 推荐关系追踪
- 自动奖励发放

### 4. 佣金系统
- 多级佣金（一级、二级、三级）
- 灵活结算方式
- USDT提现支持
- 完整的记录追踪

### 5. 提现系统
- USDT (TRC20) 提现
- 自动/人工审核
- 提现状态追踪
- 交易哈希记录

---

## 🔐 安全特性

- ✅ JWT Token认证
- ✅ 密码加密存储
- ✅ 权限验证
- ✅ 输入数据验证
- ✅ XSS防护
- ✅ CSRF防护
- ✅ TRC20地址验证

---

## 📊 数据流转

```
用户注册 → 获取奖励 → 每日签到 → 搜索信息 → 推荐好友 → 获得佣金 → 提现USDT
```

---

## 🎨 界面预览

### 前台界面
- 首页 - 平台介绍和快速搜索
- 搜索页面 - 多种搜索类型选择
- 数据库列表 - 可用数据库展示
- 用户仪表盘 - 个人信息管理

### 后台界面
- 管理仪表盘 - 数据统计概览
- 用户管理 - 用户信息和关系
- 提现管理 - 提现申请处理
- 系统配置 - 全面的系统设置

---

## 🚧 开发计划

### 待实现功能
- [ ] 后端API集成
- [ ] 真实数据库连接
- [ ] 支付系统集成
- [ ] 数据统计报表
- [ ] API接口管理
- [ ] 日志审计系统

### 优化改进
- [ ] 性能优化
- [ ] SEO优化
- [ ] PWA支持
- [ ] 更多语言支持

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写清晰的注释

---

## 📄 许可证

本项目仅供学习和参考使用。

---

## 📞 联系方式

- 邮箱：support@infosearch.com
- 技术支持：tech@infosearch.com

---

<div align="center">

**[⬆ 回到顶部](#信息搜索平台-infosearch-platform)**

Made with ❤️ by InfoSearch Team

</div>
