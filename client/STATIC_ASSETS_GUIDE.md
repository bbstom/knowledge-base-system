# 静态资源存储方案指南

## 📊 混合存储方案（推荐）

### 方案概述

**前端静态资源** + **后端动态资源** = 最佳实践

```
前端 (public/)          →  固定不变的资源（Logo、Favicon、默认图）
后端 (server/public/)   →  动态可配置的资源（轮播图、广告图）
```

## 📁 目录结构

### 前端静态资源目录
```
public/
├── images/
│   ├── logo.png              # 网站Logo (160x32px)
│   ├── logo@2x.png          # 高清Logo (320x64px)
│   ├── logo-dark.png        # 深色版Logo
│   ├── logo-square.png      # 方形Logo (32x32px)
│   ├── default-avatar.png   # 默认头像
│   └── placeholder.jpg      # 占位图
├── favicon.ico              # 网站图标
└── robots.txt              # SEO配置
```

### 后端动态资源目录
```
server/public/
└── images/
    ├── banners/            # 轮播图
    │   ├── banner-1.jpg
    │   ├── banner-2.jpg
    │   └── banner-3.jpg
    ├── ads/                # 广告图
    │   └── ad-1.jpg
    └── auth/               # 登录注册页
        └── login-bg.jpg
```

## 🎯 资源分类规则

### 前端存储（推荐）

**适用场景：**
- ✅ Logo和品牌标识
- ✅ Favicon
- ✅ 默认图片（头像、占位图）
- ✅ 图标和UI元素
- ✅ 不经常更换的图片

**优点：**
- 加载速度快（CDN加速）
- 减少后端负载
- 构建时优化
- 不依赖后端服务器

**访问方式：**
```
/images/logo.png
/favicon.ico
```

### 后端存储

**适用场景：**
- ✅ 轮播广告图
- ✅ 可配置的背景图
- ✅ 用户上传的图片
- ✅ 经常更换的图片

**优点：**
- 可以在后台动态配置
- 不需要重新构建前端
- 灵活性高

**访问方式：**
```
http://localhost:3001/images/banner-1.jpg
```

## 🚀 使用指南

### 1. 前端Logo使用

#### 步骤1：准备Logo文件
```bash
# 准备以下文件
logo.png          # 160x32px
logo@2x.png      # 320x64px (高清版)
logo-dark.png    # 深色背景版本
favicon.ico      # 32x32px
```

#### 步骤2：放到前端目录
```bash
# 复制到前端public目录
cp logo.png public/images/
cp logo@2x.png public/images/
cp favicon.ico public/
```

#### 步骤3：在代码中使用
```tsx
// 直接使用相对路径
<img src="/images/logo.png" alt="Logo" className="h-8" />

// 或使用import（推荐）
import logo from '/images/logo.png';
<img src={logo} alt="Logo" className="h-8" />
```

#### 步骤4：配置Favicon
在 `index.html` 中：
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
```

### 2. 后端动态图片使用

#### 步骤1：上传图片
```bash
# 复制到后端目录
cp banner-1.jpg server/public/images/banners/
```

#### 步骤2：在后台配置
```
后台管理 → 广告管理
图片URL: /images/banners/banner-1.jpg
```

#### 步骤3：前端访问
```tsx
// 使用完整URL
<img src="http://localhost:3001/images/banners/banner-1.jpg" />

// 或配置API_BASE
<img src={`${API_BASE}/images/banners/banner-1.jpg`} />
```

## 📝 实际配置示例

### 示例1：Logo配置（前端）

**文件位置：**
```
public/images/logo.png
```

**代码使用：**
```tsx
// src/components/Layout/Header.tsx
<Link to="/" className="flex items-center">
  <img src="/images/logo.png" alt="网站Logo" className="h-8 w-auto" />
</Link>
```

**优点：**
- 不需要后端服务器
- 加载速度快
- 构建时优化

### 示例2：登录背景图（后端）

**文件位置：**
```
server/public/images/auth/login-bg.jpg
```

**后台配置：**
```
登录注册页配置 → 右侧展示图片
填写: /images/auth/login-bg.jpg
```

**优点：**
- 可以在后台随时更换
- 不需要重新构建前端

### 示例3：轮播图（后端）

**文件位置：**
```
server/public/images/banners/banner-1.jpg
server/public/images/banners/banner-2.jpg
server/public/images/banners/banner-3.jpg
```

**后台配置：**
```
广告管理 → 创建广告
图片URL: /images/banners/banner-1.jpg
```

## 🔧 Vite配置（前端）

确保 `vite.config.ts` 正确配置：

```typescript
export default defineConfig({
  publicDir: 'public',  // 静态资源目录
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
```

## 🌐 生产环境配置

### 前端（Nginx）

```nginx
# 静态资源
location /images/ {
    alias /var/www/frontend/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}

location /favicon.ico {
    alias /var/www/frontend/favicon.ico;
    expires 30d;
}
```

### 后端（Nginx代理）

```nginx
# 动态资源代理到后端
location /api/images/ {
    proxy_pass http://localhost:3001/images/;
    proxy_set_header Host $host;
}
```

## 📊 性能对比

| 指标 | 前端静态 | 后端动态 |
|------|---------|---------|
| 加载速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| CDN加速 | ✅ | ❌ |
| 灵活性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 服务器负载 | 无 | 有 |
| 更新便捷性 | ⭐⭐ | ⭐⭐⭐⭐⭐ |

## ✅ 推荐配置

### Logo和Favicon → 前端
```
public/
├── images/
│   ├── logo.png
│   └── logo@2x.png
└── favicon.ico
```

**理由：**
- 固定不变
- 加载速度快
- 减少后端负载

### 轮播图和广告 → 后端
```
server/public/images/
├── banners/
└── ads/
```

**理由：**
- 经常更换
- 需要后台配置
- 灵活性高

### 登录背景图 → 后端
```
server/public/images/auth/
└── login-bg.jpg
```

**理由：**
- 可能需要更换
- 后台可配置
- 不需要重新构建

## 🔄 迁移指南

### 从后端迁移到前端

**步骤：**
1. 复制图片文件
```bash
cp server/public/images/logo.png public/images/
```

2. 更新代码引用
```tsx
// 之前
<img src="http://localhost:3001/images/logo.png" />

// 之后
<img src="/images/logo.png" />
```

3. 删除后端文件（可选）
```bash
rm server/public/images/logo.png
```

## 📱 响应式图片

### 使用srcset（前端）

```tsx
<img 
  src="/images/logo.png"
  srcSet="/images/logo.png 1x, /images/logo@2x.png 2x"
  alt="Logo"
  className="h-8"
/>
```

### 使用picture（前端）

```tsx
<picture>
  <source media="(prefers-color-scheme: dark)" srcSet="/images/logo-dark.png" />
  <source media="(prefers-color-scheme: light)" srcSet="/images/logo.png" />
  <img src="/images/logo.png" alt="Logo" className="h-8" />
</picture>
```

## 🆘 常见问题

### Q: 前端图片404？
A: 检查：
1. 文件是否在 `public/` 目录
2. 路径是否以 `/` 开头
3. 文件名是否正确（区分大小写）

### Q: 后端图片404？
A: 检查：
1. 服务器是否运行
2. 文件是否在 `server/public/images/`
3. 路径是否正确

### Q: 如何选择存储位置？
A: 
- 固定不变 → 前端
- 经常更换 → 后端
- 需要配置 → 后端

### Q: 可以混合使用吗？
A: 可以！这就是推荐的方案

## 📞 快速参考

### 前端图片
```
位置: public/images/
访问: /images/logo.png
优点: 快速、CDN、不依赖后端
```

### 后端图片
```
位置: server/public/images/
访问: http://localhost:3001/images/banner.jpg
优点: 灵活、可配置、动态更新
```

---

**推荐方案**: Logo用前端，轮播图用后端
**更新时间**: 2025-11-16
