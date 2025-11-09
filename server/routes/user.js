// routes/user.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
    getSearchHistory, 
    recordSearch,
    getCommissionDetails, // 新增
    submitWithdrawal,     // 新增
    getPointDetails       // 新增

} = require('../controllers/userController');
const { getUserProfile } = require('../controllers/authController'); // 引入个人资料获取
const { getPublicConfig } = require('../controllers/configController'); // 引入公共配置
const { getReferralDetails } = require('../controllers/userController'); // 引入推荐详情


const router = express.Router();

// ----------------------------------------
// --- 用户仪表盘/个人资料
// ----------------------------------------
// GET /api/user/profile - 获取个人资料 (Auth token needed)
router.get('/profile', protect, getUserProfile);


// ----------------------------------------
// --- 搜索历史模块
// ----------------------------------------
// GET /api/user/search-history - 获取所有搜索记录 (对应前端的 "搜索历史" 页面)
router.get('/search-history', protect, getSearchHistory);

// POST /api/user/search - 记录一次新的搜索 (对应前端的 "信息搜索" 按钮)
router.post('/search', protect, recordSearch); 


// ----------------------------------------
// --- 佣金与提现模块 (新增)
// ----------------------------------------
router.get('/commission', getCommissionDetails);
router.post('/withdraw', submitWithdrawal);

// ----------------------------------------
// --- 积分模块 (新增)
// ----------------------------------------
router.get('/points', getPointDetails);

// ⚠️ TODO: 后续其他路由（佣金、提现、积分、购买历史）将添加到这里。


// ----------------------------------------
// --- 公共配置（无需认证）
// ----------------------------------------
router.get('/config', getPublicConfig); // GET /api/user/config

// 所有后续路由都需要认证
router.use(protect);

// ... (保持 /profile, /search-history, /search, /commission, /withdraw, /points 路由不变)

// ----------------------------------------
// --- 推荐模块 (新增)
// ----------------------------------------
router.get('/referral', getReferralDetails); // GET /api/user/referral



module.exports = router;