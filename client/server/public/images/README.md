# 图片存储目录使用说明

## 📁 目录说明

这个目录用于存储网站使用的静态图片文件。

## 🚀 使用方法

### 1. 添加图片
将图片文件直接复制到此目录：
```
server/public/images/
├── login-bg.jpg          # 登录页背景图
├── logo.png              # 网站Logo
├── banner-1.jpg          # 轮播图1
├── banner-2.jpg          # 轮播图2
└── ...
```

### 2. 访问图片

#### 开发环境
```
http://localhost:3001/images/login-bg.jpg
http://localhost:3001/images/logo.png
```

#### 生产环境
```
http://your-domain.com/images/login-bg.jpg
http://your-domain.com/images/logo.png
```

### 3. 在配置中使用

#### 方式1：使用相对路径（推荐）
```
/images/login-bg.jpg
```

#### 方式2：使用完整URL
```
http://localhost:3001/images/login-bg.jpg
```

## 📝 配置示例

### 登录页背景图配置
在后台管理 → 登录注册页配置中：
```
右侧展示图片: /images/login-bg.jpg
```

### 轮播广告图片配置
在后台管理 → 广告管理中：
```
图片URL: /images/banner-1.jpg
```

## 🖼️ 支持的图片格式

- **JPG/JPEG** - 适合照片、复杂图像
- **PNG** - 适合Logo、图标、需要透明背景的图片
- **GIF** - 适合简单动画
- **WebP** - 现代格式，体积小质量高
- **SVG** - 矢量图，适合图标和Logo

## 📐 推荐图片尺寸

### 登录页背景图
- 尺寸：1200x1600px 或更大
- 格式：JPG
- 大小：< 500KB

### 轮播广告图
- 尺寸：1920x600px
- 格式：JPG/PNG
- 大小：< 300KB

### Logo
- 尺寸：200x200px
- 格式：PNG（透明背景）
- 大小：< 50KB

## 🔧 图片优化建议

### 1. 压缩图片
使用在线工具压缩图片：
- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app
- Compressor.io: https://compressor.io

### 2. 选择合适的格式
- 照片 → JPG
- Logo/图标 → PNG
- 简单图形 → SVG

### 3. 控制文件大小
- 背景图 < 500KB
- 轮播图 < 300KB
- Logo < 50KB

## 📂 目录结构建议

```
server/public/images/
├── auth/                 # 登录注册相关
│   ├── login-bg.jpg
│   └── register-bg.jpg
├── banners/             # 轮播图
│   ├── banner-1.jpg
│   ├── banner-2.jpg
│   └── banner-3.jpg
├── logos/               # Logo相关
│   ├── logo.png
│   └── favicon.ico
└── misc/                # 其他图片
    └── placeholder.jpg
```

## 🔒 安全注意事项

1. **不要上传敏感信息**
   - 不要上传包含个人信息的图片
   - 不要上传版权受保护的图片

2. **文件命名规范**
   - 使用英文和数字
   - 使用连字符 `-` 而不是空格
   - 小写字母
   - 例如：`login-background-2024.jpg`

3. **定期清理**
   - 删除不再使用的图片
   - 避免占用过多存储空间

## 🌐 CDN加速（可选）

如果网站访问量大，建议使用CDN：

1. 将图片上传到CDN服务商
2. 在配置中使用CDN URL
3. 常见CDN服务：
   - 阿里云OSS
   - 腾讯云COS
   - 七牛云
   - 又拍云

## 📞 技术支持

如有问题，请查看主项目文档或联系技术支持。
