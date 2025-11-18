# Logo 和 Favicon 设置指南

## 📁 文件位置

### 1. Favicon（标题栏图标）
将favicon文件放在 `public/` 目录：

```
public/
├── favicon.ico          # 主favicon（推荐使用.ico格式）
├── favicon-16x16.png    # 16x16像素
├── favicon-32x32.png    # 32x32像素
└── apple-touch-icon.png # 180x180像素（iOS设备）
```

### 2. Logo图片
将logo文件放在 `public/images/` 目录：

```
public/images/
├── logo.png             # 主logo（推荐尺寸：200x50px 或更大）
├── logo-light.png       # 浅色主题logo（可选）
└── logo-small.png       # 小尺寸logo（可选，用于移动端）
```

## 🔧 配置步骤

### 步骤1：准备图片文件

**Favicon要求：**
- 格式：.ico 或 .png
- 尺寸：16x16, 32x32, 或 48x48 像素
- 建议使用在线工具生成：https://favicon.io/

**Logo要求：**
- 格式：.png 或 .svg（推荐PNG，背景透明）
- 尺寸：建议宽度200-400px，高度50-100px
- 文件大小：< 100KB

### 步骤2：上传文件

1. 将 `favicon.ico` 放到 `public/` 目录
2. 将 `logo.png` 放到 `public/images/` 目录

### 步骤3：修改 index.html

编辑 `index.html` 文件，将：

```html
<link rel="icon" type="image/svg+xml" href="/vite.svg" />
```

改为：

```html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

### 步骤4：在管理后台设置Logo

1. 登录管理后台
2. 进入"系统配置" → "网站配置"
3. 在"网站Logo"字段输入：`/images/logo.png`
4. 保存配置

## 📝 使用示例

### 在代码中引用Logo

```tsx
// 方式1：直接使用public路径
<img src="/images/logo.png" alt="Logo" />

// 方式2：从系统配置获取
const { config } = useSiteConfig();
<img src={config?.siteLogo || '/images/logo.png'} alt="Logo" />
```

### 在CSS中使用

```css
.logo {
  background-image: url('/images/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

## 🎨 推荐的图片规格

| 类型 | 尺寸 | 格式 | 用途 |
|------|------|------|------|
| Favicon | 32x32px | .ico | 浏览器标签页图标 |
| Logo | 200x50px | .png | 网站主logo |
| Logo（大） | 400x100px | .png | 首页大logo |
| Apple Touch Icon | 180x180px | .png | iOS设备图标 |

## 🔄 更新后的操作

1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 刷新页面（Ctrl+F5）
3. 如果还看不到，等待几分钟让CDN更新

## 🛠️ 在线工具推荐

- **Favicon生成器**：https://favicon.io/
- **Logo制作**：https://www.canva.com/
- **图片压缩**：https://tinypng.com/
- **图片格式转换**：https://cloudconvert.com/

## ⚠️ 注意事项

1. **文件命名**：使用小写字母和连字符，避免空格和特殊字符
2. **文件大小**：尽量压缩图片，保持在100KB以下
3. **透明背景**：Logo建议使用透明背景的PNG格式
4. **版权**：确保使用的图片有合法使用权
5. **备份**：保留原始高清图片文件

## 📂 当前项目结构

```
项目根目录/
├── public/
│   ├── favicon.ico          # ← 放这里
│   ├── vite.svg             # 可以删除
│   └── images/
│       ├── logo.png         # ← 放这里
│       └── README.md
├── index.html               # ← 需要修改
└── src/
    └── ...
```

## 🚀 快速开始

1. 准备好你的logo和favicon文件
2. 将favicon.ico放到 `public/` 目录
3. 将logo.png放到 `public/images/` 目录
4. 修改 `index.html` 中的favicon链接
5. 在管理后台设置logo路径
6. 刷新浏览器查看效果

完成！你的网站现在有了自定义的logo和favicon。
