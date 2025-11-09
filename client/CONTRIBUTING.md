# 贡献指南

感谢你考虑为知识库管理系统做出贡献！

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试要求](#测试要求)

## 行为准则

我们致力于为所有人提供一个友好、安全和欢迎的环境。请遵守以下准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请创建一个 Issue 并包含以下信息：

- 清晰的标题和描述
- 重现步骤
- 预期行为和实际行为
- 截图（如适用）
- 环境信息（操作系统、Node.js 版本等）

### 提出新功能

如果你有新功能的想法：

1. 先检查是否已有相关 Issue
2. 创建一个 Feature Request Issue
3. 详细描述功能和使用场景
4. 等待维护者反馈

### 提交代码

1. **Fork 仓库**
   ```bash
   # 在 GitHub 上点击 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/knowledge-base-system.git
   cd knowledge-base-system
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **安装依赖**
   ```bash
   npm run install-all
   ```

5. **进行修改**
   - 遵循代码规范
   - 添加必要的测试
   - 更新相关文档

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

7. **推送到你的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

## 开发流程

### 环境设置

1. **安装依赖**
   ```bash
   npm run install-all
   ```

2. **配置环境变量**
   ```bash
   cp server/.env.example server/.env
   # 编辑 .env 文件
   ```

3. **启动开发服务器**
   ```bash
   # 后端
   cd server
   npm run dev

   # 前端（新终端）
   cd client
   npm run dev
   ```

### 项目结构

```
knowledge-base-system/
├── client/              # 前端代码
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/      # 页面组件
│   │   ├── contexts/   # Context API
│   │   └── utils/      # 工具函数
│   └── package.json
├── server/             # 后端代码
│   ├── config/        # 配置文件
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── services/      # 业务逻辑
│   ├── middleware/    # 中间件
│   └── scripts/       # 工具脚本
└── docs/              # 文档
```

## 代码规范

### JavaScript/TypeScript

- 使用 2 空格缩进
- 使用单引号
- 使用分号
- 使用 camelCase 命名变量和函数
- 使用 PascalCase 命名类和组件
- 添加必要的注释

**示例：**

```typescript
// Good
const getUserData = async (userId: string): Promise<User> => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Bad
const get_user_data = async (userId) => {
  const user = await User.findById(userId)
  return user
}
```

### React 组件

- 使用函数组件和 Hooks
- 组件文件使用 PascalCase
- 一个文件一个组件
- 使用 TypeScript 类型定义

**示例：**

```typescript
import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  return (
    <div className="user-profile">
      {/* 组件内容 */}
    </div>
  );
};

export default UserProfile;
```

### CSS/Tailwind

- 优先使用 Tailwind CSS 类
- 自定义样式使用 CSS Modules
- 保持类名语义化

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复 Bug）
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例：**

```bash
feat(auth): add password reset functionality

- Add forgot password page
- Implement email verification
- Add reset password API endpoint

Closes #123
```

### 提交消息规则

- 使用现在时态："add feature" 而不是 "added feature"
- 使用祈使语气："move cursor to..." 而不是 "moves cursor to..."
- 首字母小写
- 结尾不加句号
- 主题行不超过 50 个字符
- 正文每行不超过 72 个字符

## 测试要求

### 运行测试

```bash
# 运行所有测试
cd server
npm test

# 运行特定测试
node scripts/testSpecificFeature.js
```

### 测试覆盖

- 新功能必须包含测试
- Bug 修复应包含回归测试
- 保持测试覆盖率在 80% 以上

### 测试类型

1. **单元测试** - 测试单个函数或组件
2. **集成测试** - 测试多个模块的交互
3. **端到端测试** - 测试完整的用户流程

## Pull Request 流程

### PR 检查清单

提交 PR 前，请确保：

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交消息符合规范
- [ ] 没有合并冲突
- [ ] 代码已经过自我审查

### 代码审查

- 所有 PR 需要至少一个维护者的审查
- 积极响应审查意见
- 及时更新代码
- 保持讨论专业和友好

### 合并要求

- 所有 CI 检查通过
- 至少一个批准
- 没有未解决的讨论
- 代码冲突已解决

## 文档贡献

文档同样重要！你可以：

- 修正拼写或语法错误
- 改进现有文档的清晰度
- 添加示例和教程
- 翻译文档

## 问题和讨论

- **Bug 报告**: 使用 GitHub Issues
- **功能请求**: 使用 GitHub Issues
- **问题讨论**: 使用 GitHub Discussions
- **安全问题**: 发送邮件到 security@example.com

## 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

## 联系方式

- 项目维护者：[Your Name]
- 邮箱：support@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

**感谢你的贡献！** 🎉

每一个贡献，无论大小，都让这个项目变得更好。
