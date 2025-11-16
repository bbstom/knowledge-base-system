# 图片使用快速参考

## 📍 存储位置
```
server/public/images/
```

## 🔗 访问URL

### 开发环境
```
http://localhost:3001/images/your-image.jpg
```

### 生产环境
```
http://your-domain.com/images/your-image.jpg
```

## 📝 配置中使用

### 相对路径（推荐）
```
/images/login-bg.jpg
```

### 完整URL
```
http://localhost:3001/images/login-bg.jpg
```

## 🎯 常用场景

| 场景 | 配置位置 | 示例路径 |
|------|---------|---------|
| 登录页背景 | 后台 → 登录注册页配置 | `/images/login-bg.jpg` |
| 轮播广告 | 后台 → 广告管理 | `/images/banner-1.jpg` |
| Logo | 后台 → 网站配置 | `/images/logo.png` |

## ⚡ 快速测试

1. 放一张图片到 `server/public/images/test.jpg`
2. 访问 `http://localhost:3001/images/test.jpg`
3. 看到图片 = 成功！

## 🔧 测试页面

打开浏览器访问：
```
file:///path/to/test-image-access.html
```

---

**详细文档**: IMAGE_STORAGE_GUIDE.md
