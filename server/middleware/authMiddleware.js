// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // 从请求头中获取 Token: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 验证 Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 查找用户 (排除密码) 并存储在 req.user 中
            req.user = await User.findById(decoded.id).select('-password');
            
            // 检查邮箱是否已验证（强限制）
            if (!req.user.isEmailVerified) {
                return res.status(401).json({ 
                    message: 'Access denied. Please verify your email first.', 
                    code: 'EMAIL_UNVERIFIED' 
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };