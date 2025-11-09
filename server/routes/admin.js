// routes/admin.js
const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getAdminConfig, 
    updateConfig, 
    getVipPackages, 
    updateVipPackage 
} = require('../controllers/configController');
// ⚠️ TODO: 管理员仪表盘、用户状态管理、数据分析等其他功能将添加到这里。

const router = express.Router();

// 所有路由都要求 JWT 保护，并且用户角色必须是 'admin'
router.use(protect);
router.use(admin); // 只有 admin 才能访问这些路由

// ----------------------------------------
// --- 系统配置管理
// ----------------------------------------
router.get('/config', getAdminConfig);
router.put('/config', updateConfig);

// ----------------------------------------
// --- VIP 套餐管理
// ----------------------------------------
router.get('/vip-packages', getVipPackages);
router.post('/vip-packages', updateVipPackage); 

module.exports = router;