// controllers/userController.js
const SearchHistory = require('../models/SearchHistory');
const User = require('../models/User'); // 引入 User 模型，用于更新用户积分等
const CommissionHistory = require('../models/CommissionHistory'); // 新增
const PointHistory = require('..//models/PointHistory'); // 新增

// 引入 mongoose 以便使用 ObjectId，但在这里，req.user._id已经是ObjectId类型
// const mongoose = require('mongoose'); 


// @desc    获取用户的佣金详情（总览和历史记录）
// @route   GET /api/user/commission
// @access  Private
exports.getCommissionDetails = async (req, res) => {
    const userId = req.user._id;

    try {
        // 1. 获取用户总览数据（从 User 模型中获取实时余额）
        const user = await req.user; 
        
        // 2. 获取佣金历史记录
        // 查找与该用户相关的所有收入和支出记录，按时间倒序
        const history = await CommissionHistory.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(200);

        res.json({
            // 总览数据
            totalEarned: user.totalCommissionEarned, // 历史总收入
            availableBalance: user.commissionBalance, // 可用余额
            
            // 历史记录
            history: history,
        });

    } catch (error) {
        console.error("Error fetching commission details:", error);
        res.status(500).json({ message: 'Error retrieving commission details.', error: error.message });
    }
};

// @desc    提交提现请求
// @route   POST /api/user/withdraw
// @access  Private
exports.submitWithdrawal = async (req, res) => {
    const userId = req.user._id;
    const { amount, usdtWalletAddress } = req.body;
    const user = req.user;

    // 1. 验证输入和钱包地址
    if (!amount || amount <= 0 || !usdtWalletAddress) {
        return res.status(400).json({ message: 'Invalid amount or missing USDT wallet address.' });
    }
    if (amount > user.commissionBalance) {
        return res.status(402).json({ message: 'Requested amount exceeds available balance.' });
    }

    try {
        // 2. 扣除余额并创建提现流水
        
        // 使用 $inc 原子操作扣除余额
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $inc: { commissionBalance: -amount }, // 扣除可用余额
                // 如果用户没有设置钱包地址，则在这里更新
                usdtWalletAddress: usdtWalletAddress 
            },
            { new: true }
        );

        // 创建提现记录 (状态为 pending)
        await CommissionHistory.create({
            userId: userId,
            type: 'withdrawal_pending',
            amount: amount,
            source: usdtWalletAddress,
            status: 'pending',
            adminNotes: 'New withdrawal request submitted.'
        });

        // 3. 返回成功响应
        res.status(201).json({ 
            message: 'Withdrawal request submitted successfully and awaiting review.',
            newBalance: updatedUser.commissionBalance
        });

    } catch (error) {
        console.error("Error submitting withdrawal request:", error);
        res.status(500).json({ message: 'Error processing withdrawal request.', error: error.message });
    }
};

// @desc    获取用户的积分详情（总览和历史记录）
// @route   GET /api/user/points
// @access  Private
exports.getPointDetails = async (req, res) => {
    const userId = req.user._id;

    try {
        // 1. 获取用户总积分（从 User 模型中获取实时余额）
        const user = req.user; 
        
        // 2. 获取积分历史记录
        // 查找与该用户相关的所有积分变动记录，按时间倒序
        const history = await PointHistory.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(200);

        res.json({
            // 总览数据
            totalPoints: user.points, 
            
            // 历史记录
            history: history,
        });

    } catch (error) {
        console.error("Error fetching point details:", error);
        res.status(500).json({ message: 'Error retrieving point details.', error: error.message });
    }
};


// @desc    获取用户的搜索历史记录
// @route   GET /api/user/search-history
// @access  Private (需要 JWT)
exports.getSearchHistory = async (req, res) => {
    // req.user 由 protect 中间件提供，是已认证的用户对象
    const userId = req.user._id;

    try {
        // 从查询数据库中查找当前用户的搜索历史
        // 按创建时间倒序排序 (最新记录在前)
        const history = await SearchHistory.find({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(100); // 限制返回数量，防止数据过多影响性能

        // 格式化输出，确保返回的字段与前端app.js中的预期一致
        const formattedHistory = history.map(item => ({
            id: item._id, // 用于前端 key
            queryText: item.queryText,
            queryType: item.queryType,
            cost: item.cost,
            isSuccess: item.isSuccess,
            // 注意：MongoDB 的 createdAt 字段就是我们需要的 timestamp
            timestamp: item.createdAt, 
        }));

        res.json(formattedHistory);

    } catch (error) {
        console.error("Error fetching search history:", error);
        res.status(500).json({ message: 'Error retrieving search history.', error: error.message });
    }
};


// @desc    模拟执行一次搜索，并记录历史、扣除积分
// @route   POST /api/user/search
// @access  Private (需要 JWT)
exports.recordSearch = async (req, res) => {
    const userId = req.user._id;
    const { queryText, queryType } = req.body;
    
    // ⚠️ 实际应用中，搜索成本应该从配置表中获取，而不是硬编码
    // 这里我们先使用一个默认值进行模拟
    const SEARCH_COST = 5; 
    
    if (!queryText || !queryType) {
        return res.status(400).json({ message: 'Missing search query or type.' });
    }

    // 1. 检查用户积分/余额
    const user = req.user; 
    if (user.points < SEARCH_COST) {
        return res.status(402).json({ 
            message: 'Insufficient points to perform the search.',
            code: 'INSUFFICIENT_POINTS'
        });
    }

    let isSearchSuccessful = true; // 假设搜索操作总是成功 (实际应根据外部API调用结果)

    try {
        // 2. 扣除用户积分 (在用户数据库中操作)
        // 使用 findByIdAndUpdate 并使用 $inc 来确保原子操作，防止并发问题
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { points: -SEARCH_COST } }, // 扣除积分
            { new: true } // 返回更新后的文档
        );

        if (!updatedUser) {
            // 如果在扣款时用户找不到了，需要回滚或记录错误
            throw new Error("User not found during point deduction.");
        }

        // 3. 创建新的搜索记录 (在查询数据库中操作)
        const newRecord = new SearchHistory({
            userId: userId,
            queryText: queryText,
            queryType: queryType,
            cost: SEARCH_COST,
            isSuccess: isSearchSuccessful,
        });

        await newRecord.save();

        // 4. 返回成功响应
        res.status(201).json({ 
            message: 'Search successful and recorded.',
            cost: SEARCH_COST,
            remainingPoints: updatedUser.points // 返回剩余积分
        });

    } catch (error) {
        console.error("Error recording search or deducting points:", error);
        
        // 实际生产环境中，如果扣款成功但记录失败，需要复杂的事务回滚逻辑。
        // 简化处理：返回服务器错误
        res.status(500).json({ message: 'Internal server error during search process.', error: error.message });
    }
};

// @desc    获取用户的推荐详情：推荐码和推荐用户列表
// @route   GET /api/user/referral
// @access  Private
exports.getReferralDetails = async (req, res) => {
    const userId = req.user._id;
    const user = req.user;

    try {
        // 1. 获取用户使用其推荐码邀请的所有用户
        // 查找 referredBy 字段等于当前用户ID 的所有用户
        const referredUsers = await User.find({ referredBy: userId })
            .select('email username createdAt vipStatus');
            
        // 2. 汇总推荐用户产生的佣金（可以优化为一次聚合查询）
        const commissionDetails = await CommissionHistory.aggregate([
            { $match: { userId: userId, type: 'earned', relatedUserId: { $ne: null } } },
            { $group: {
                _id: '$relatedUserId', // 按产生佣金的用户ID分组
                totalCommission: { $sum: '$amount' }
            }}
        ]);
        
        // 将佣金详情映射到推荐用户列表
        const referredUsersWithCommission = referredUsers.map(referredUser => {
            const commissionInfo = commissionDetails.find(c => c._id.equals(referredUser._id));
            return {
                _id: referredUser._id,
                email: referredUser.email,
                username: referredUser.username,
                createdAt: referredUser.createdAt,
                vipStatus: referredUser.vipStatus,
                totalCommissionFromThisUser: commissionInfo ? commissionInfo.totalCommission : 0,
            };
        });

        res.json({
            referralCode: user.referralCode, // 用户的推荐码
            totalReferredUsers: referredUsers.length,
            referredUsers: referredUsersWithCommission, // 包含佣金详情的推荐用户列表
        });

    } catch (error) {
        console.error("Error fetching referral details:", error);
        res.status(500).json({ message: 'Error retrieving referral details.', error: error.message });
    }
};


// 导出其他用户相关的函数 (如获取个人资料，我们在 authController 中定义了)
// 也可以将所有用户相关函数（包括个人资料）转移到这里，保持 controllers 职责清晰
// exports.getUserProfile = ...