# Logo 尺寸使用指南

## 📐 推荐尺寸

根据项目中Logo的实际使用情况，推荐以下尺寸：

### 主Logo（导航栏）

**推荐尺寸：**
- **宽度**: 120-200px
- **高度**: 32-40px
- **比例**: 3:1 到 5:1（横向Logo）
- **格式**: PNG（透明背景）
- **文件大小**: < 50KB

**代码中的显示：**
```tsx
<img src={logoUrl} alt={siteName} className="h-8 w-auto" />
```
- `h-8` = 32px 高度
- `w-auto` = 宽度自适应

### 具体尺寸建议

| Logo类型 | 推荐尺寸 | 说明 |
|---------|---------|------|
| **横向Logo** | 160x32px | 最常用，适合导航栏 |
| **横向Logo（宽）** | 200x40px | 更宽的Logo |
| **方形Logo** | 32x32px | 图标式Logo |
| **高清版本** | 320x64px | 2倍分辨率（Retina屏） |

## 🎨 设计建议

### 1. Logo类型选择

#### 横向Logo（推荐）✅
```
┌─────────────────┐
│  [图标] 网站名称  │  160x32px
└─────────────────┘
```
- 适合导航栏
- 视觉平衡好
- 易于识别

#### 方形Logo
```
┌────┐
│图标│  32x32px
└────┘
```
- 简洁
- 适合小空间
- 需要配合文字

#### 纯文字Logo
```
网站名称  (使用特殊字体)
```
- 简单直接
- 无需图片
- 加载快

### 2. 设计要点

#### 清晰度
- ✅ 在32px高度下清晰可辨
- ✅ 细节不要太多
- ✅ 线条粗细适中（至少2px）

#### 颜色
- ✅ 使用品牌色
- ✅ 考虑深色/浅色背景
- ✅ 准备深色和浅色两个版本

#### 格式
- ✅ PNG格式（透明背景）
- ✅ 或SVG格式（矢量图）
- ❌ 避免JPG（有背景色）

## 📏 不同场景的Logo尺寸

### 1. 导航栏Logo（当前使用）
```
尺寸: 160x32px
位置: 页面顶部导航栏
显示: h-8 (32px高)
```

### 2. Favicon（浏览器标签图标）
```
尺寸: 32x32px 或 16x16px
格式: ICO 或 PNG
位置: 浏览器标签
```

### 3. 移动端Logo
```
尺寸: 120x24px
说明: 移动端导航栏空间较小
```

### 4. 登录页Logo（如需要）
```
尺寸: 200x200px（方形）
或: 300x60px（横向）
位置: 登录表单上方
```

### 5. 邮件Logo（如需要）
```
尺寸: 200x40px
位置: 邮件模板顶部
```

## 🎯 实际尺寸示例

### 示例1：横向Logo（推荐）
```
文件名: logo.png
尺寸: 160x32px
内容: [图标 20x20px] + [文字 "网站名称"]
背景: 透明
格式: PNG-24
大小: 约 15-30KB
```

### 示例2：高清Logo（Retina）
```
文件名: logo@2x.png
尺寸: 320x64px
说明: 2倍分辨率，用于高清屏幕
大小: 约 30-50KB
```

### 示例3：方形Logo
```
文件名: logo-square.png
尺寸: 32x32px
内容: 纯图标，无文字
用途: 小空间显示
```

## 🛠️ 制作工具

### 在线工具
1. **Canva** - https://www.canva.com
   - 模板丰富
   - 易于使用
   - 免费版够用

2. **Figma** - https://www.figma.com
   - 专业设计工具
   - 矢量编辑
   - 团队协作

3. **LogoMakr** - https://logomakr.com
   - 专门做Logo
   - 简单快速

### 桌面软件
- **Adobe Illustrator** - 专业矢量设计
- **Photoshop** - 位图编辑
- **GIMP** - 免费替代品
- **Inkscape** - 免费矢量工具

## 📦 Logo文件准备

### 需要准备的文件

```
logos/
├── logo.png              # 标准Logo (160x32px)
├── logo@2x.png          # 高清Logo (320x64px)
├── logo-dark.png        # 深色背景版本
├── logo-light.png       # 浅色背景版本
├── logo-square.png      # 方形Logo (32x32px)
└── favicon.ico          # 网站图标 (32x32px)
```

### 文件规格

| 文件 | 尺寸 | 格式 | 大小 |
|------|------|------|------|
| logo.png | 160x32px | PNG-24 | < 30KB |
| logo@2x.png | 320x64px | PNG-24 | < 50KB |
| logo-square.png | 32x32px | PNG-24 | < 10KB |
| favicon.ico | 32x32px | ICO | < 10KB |

## 💡 使用建议

### 1. 当前项目使用

**步骤：**
1. 准备Logo文件：`logo.png` (160x32px)
2. 放到：`server/public/images/logo.png`
3. 后台配置：`/images/logo.png`

**配置位置：**
- 后台管理 → 网站配置 → Logo URL

### 2. 响应式Logo

如果需要在不同设备显示不同Logo：

```tsx
// 桌面端
<img src="/images/logo.png" className="hidden md:block h-8" />

// 移动端
<img src="/images/logo-mobile.png" className="md:hidden h-6" />
```

### 3. 深色模式Logo

如果网站有深色模式：

```tsx
// 浅色模式
<img src="/images/logo-light.png" className="dark:hidden h-8" />

// 深色模式
<img src="/images/logo-dark.png" className="hidden dark:block h-8" />
```

## ✅ 检查清单

制作Logo前检查：

- [ ] 尺寸：160x32px（或类似比例）
- [ ] 格式：PNG，透明背景
- [ ] 清晰度：在32px高度下清晰
- [ ] 颜色：与品牌色一致
- [ ] 文件大小：< 50KB
- [ ] 命名：logo.png（小写，无空格）
- [ ] 测试：在白色和深色背景下都清晰

## 🎨 设计灵感

### Logo风格参考

1. **极简风格**
   - 简单图形 + 文字
   - 单色或双色
   - 例如：Stripe, Airbnb

2. **图标+文字**
   - 左侧图标 + 右侧文字
   - 平衡美观
   - 例如：GitHub, Twitter

3. **纯文字**
   - 特殊字体
   - 字母变形
   - 例如：Google, Facebook

4. **徽章风格**
   - 圆形或盾形
   - 复古感
   - 例如：Starbucks

## 📞 常见问题

### Q: Logo太大怎么办？
A: 使用在线压缩工具：
- TinyPNG: https://tinypng.com
- Squoosh: https://squoosh.app

### Q: 需要矢量版本吗？
A: 建议准备SVG版本，但PNG也够用

### Q: Logo在移动端太大？
A: 准备一个小尺寸版本（120x24px）

### Q: 如何制作Favicon？
A: 使用在线工具：
- Favicon.io: https://favicon.io
- RealFaviconGenerator: https://realfavicongenerator.net

## 🎯 快速开始

### 最简单的方案

1. **使用文字Logo**
   - 不需要设计图片
   - 直接在配置中填写网站名称
   - 系统自动显示文字

2. **使用免费Logo生成器**
   - Canva: 选择Logo模板
   - 修改文字和颜色
   - 导出为PNG (160x32px)

3. **找设计师**
   - Fiverr: $5起
   - 猪八戒网
   - 淘宝

---

**推荐尺寸总结**: 160x32px PNG格式，透明背景
**文件位置**: `server/public/images/logo.png`
**配置路径**: `/images/logo.png`
