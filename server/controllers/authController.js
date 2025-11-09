// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 辅助函数：生成 JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
};

// 辅助函数：发送邮件
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"${options.subject}" <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

// @desc    注册新用户
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { email, password, referralCode } = req.body;

    // 1. 检查用户是否存在
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // 2. 查找推荐人 (如果提供了推荐码)
    let referredBy = null;
    if (referralCode) {
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (referrer) {
            referredBy = referrer._id;
        } else {
            console.warn(`Referral code ${referralCode} not found.`);
        }
    }

    // 3. 生成唯一的推荐码和验证 Token
    const userReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // 4. 创建用户
    const user = await User.create({
        email,
        password,
        referralCode: userReferralCode,
        referredBy: referredBy,
        emailVerificationToken: emailVerificationToken,
        verificationTokenExpires: Date.now() + 3600000, // 1小时过期
    });

    if (user) {
        // 5. 发送邮件验证链接
        const verificationURL = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
        const emailHTML = `
            <h2>欢迎注册 ${process.env.CLIENT_URL}</h2>
            <p>请点击下面的链接验证您的邮箱地址：</p>
            <a href="${verificationURL}">点击验证邮箱</a>
            <p>如果链接无效，请复制此地址到浏览器中打开：${verificationURL}</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: '邮箱验证 / Email Verification',
                html: emailHTML,
            });

            // 6. 返回成功响应 (不返回 JWT，因为邮箱未验证)
            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
            });
        } catch (err) {
            console.error('Email sending failed:', err);
            // 即使邮件发送失败，也创建用户，但在日志中记录错误
            user.isEmailVerified = false;
            await user.save();
            res.status(201).json({
                message: 'Registration successful, but verification email failed to send. Please contact support.',
            });
        }
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};


// @desc    验证邮箱
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    const { token } = req.body;

    const user = await User.findOne({
        emailVerificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }, // 确保 token 未过期
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // 清除 token
    user.verificationTokenExpires = undefined; // 清除过期时间
    await user.save();

    // 验证成功后，直接登录并返回 JWT
    res.json({
        message: 'Email successfully verified. You are now logged in.',
        token: generateToken(user._id),
    });
};


// @desc    用户登录 & 获取 Token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. 查找用户 (需要显式选择 password 字段)
    const user = await User.findOne({ email }).select('+password');

    // 2. 检查用户存在且密码匹配
    if (user && (await user.matchPassword(password))) {
        // 3. 检查邮箱是否已验证
        if (!user.isEmailVerified) {
             return res.status(401).json({ 
                message: 'Please verify your email address before logging in.', 
                code: 'EMAIL_UNVERIFIED' 
            });
        }

        // 4. 返回用户数据和 JWT
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            vipStatus: user.vipStatus,
            points: user.points,
            commissionBalance: user.commissionBalance,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    获取用户个人资料 (使用 JWT 保护)
// @route   GET /api/user/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    // req.user 由 protect 中间件设置
    const user = req.user; 
    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            vipStatus: user.vipStatus,
            points: user.points,
            commissionBalance: user.commissionBalance,
            referralCode: user.referralCode,
            // 其它需要的资料
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};