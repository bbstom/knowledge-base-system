# 前端静态图片目录

## 📁 目录说明

这个目录存放**固定不变**的静态图片资源。

## 🎯 适合存放的图片

- ✅ Logo和品牌标识
- ✅ Favicon
- ✅ 默认头像
- ✅ 占位图
- ✅ UI图标
- ✅ 不经常更换的图片

## 🚀 使用方法

### 1. 添加图片
将图片文件直接放到此目录：
```
public/images/
├── logo.png
├── logo@2x.png
└── default-avatar.png
```

### 2. 在代码中使用
```tsx
// 方式1：直接使用路径
<img src="/images/logo.png" alt="Logo" />

// 方式2：使用import（推荐）
import logo from '/images/logo.png';
<img src={logo} alt="Logo" />
```

### 3. 访问URL
```
开发环境: http://localhost:5173/images/logo.png
生产环境: http://your-domain.com/images/logo.png
```

## 📏 推荐尺寸

| 图片类型 | 尺寸 | 格式 |
|---------|------|------|
| Logo | 160x32px | PNG |
| Logo高清 | 320x64px | PNG |
| Favicon | 32x32px | ICO/PNG |
| 默认头像 | 128x128px | PNG |
| 占位图 | 400x300px | JPG |

## ⚡ 优点

- 加载速度快（CDN加速）
- 不依赖后端服务器
- 构建时自动优化
- 减少服务器负载

## 🔄 vs 后端图片

### 前端图片（这里）
- 固定不变的资源
- 加载快
- 不需要后端

### 后端图片（server/public/images/）
- 动态可配置的资源
- 可以在后台更换
- 需要后端服务器

## 📝 示例

### Logo配置
```
文件: public/images/logo.png (160x32px)
代码: <img src="/images/logo.png" className="h-8" />
```

### Favicon配置
```
文件: public/favicon.ico (32x32px)
HTML: <link rel="icon" href="/favicon.ico">
```

## 🔧 构建说明

- 构建时，这些文件会被复制到 `dist/` 目录
- 路径保持不变：`/images/logo.png`
- 自动优化和压缩

## 📞 更多信息

查看完整指南：`STATIC_ASSETS_GUIDE.md`
