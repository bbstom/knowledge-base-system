# 时区配置快速参考

## 🚀 快速开始

### 1. 访问时区配置
```
管理后台 → 系统设置 → 时区配置标签
```

### 2. 同步本地时区（推荐）
1. 查看"您的本地时间"卡片
2. 点击"同步此时区"按钮
3. 点击"保存配置"
4. 重启服务器

### 3. 手动修改时区
1. 选择目标时区
2. 选择时间格式
3. 点击"保存配置"
4. 重启服务器

### 3. 环境变量
```env
# server/.env
TZ=Asia/Shanghai
```

## 📍 常用时区

| 地区 | 时区值 | 偏移 |
|------|--------|------|
| 中国 | `Asia/Shanghai` | UTC+8 |
| 日本 | `Asia/Tokyo` | UTC+9 |
| 美国东部 | `America/New_York` | UTC-5 |
| 英国 | `Europe/London` | UTC+0 |

## 🔧 API 快速调用

### 获取配置
```bash
curl -X GET http://localhost:3001/api/system-config/timezone \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 更新配置
```bash
curl -X PUT http://localhost:3001/api/system-config/timezone \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "Asia/Tokyo",
    "displayFormat": "YYYY-MM-DD HH:mm:ss",
    "enabled": true
  }'
```

## 🧪 测试
```bash
cd server
node scripts/testTimezoneConfig.js
```

## ⚠️ 重要提示
- 修改后需重启服务器
- 已存储数据不会自动转换
- 建议在维护期间调整

## 📚 完整文档
详见 [TIMEZONE_CONFIG_GUIDE.md](./TIMEZONE_CONFIG_GUIDE.md)
