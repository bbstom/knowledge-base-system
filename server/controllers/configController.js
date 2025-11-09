// controllers/configController.js
const Config = require('../models/Config');
const VIPPackage = require('../models/VIPPackage');

// @desc    获取系统配置 (供前端和用户查看)
// @route   GET /api/config
// @access  Public
exports.getPublicConfig = async (req, res) => {
    try {
        const config = await Config.findOne({ configId: 'SYSTEM_CONFIG' }).select('-websiteSettings -dailyClaim.lastClaimDate');

        if (!config) {
            // 如果配置不存在，创建一个默认配置
            const defaultConfig = await Config.create({});
            return res.json(defaultConfig);
        }

        // 返回公共配置，排除敏感的管理员设置
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving system configuration.' });
    }
};

// @desc    获取全部系统配置 (供管理员查看)
// @route   GET /api/admin/config
// @access  Private/Admin
exports.getAdminConfig = async (req, res) => {
    try {
        const config = await Config.findOne({ configId: 'SYSTEM_CONFIG' });
        res.json(config || await Config.create({})); // 如果不存在则创建并返回
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving admin configuration.' });
    }
};

// @desc    更新系统配置
// @route   PUT /api/admin/config
// @access  Private/Admin
exports.updateConfig = async (req, res) => {
    try {
        // 查找并更新配置，使用 { new: true, upsert: true } 确保如果文档不存在就创建它
        const updatedConfig = await Config.findOneAndUpdate(
            { configId: 'SYSTEM_CONFIG' },
            { $set: req.body }, // $set 只更新传入的字段
            { new: true, upsert: true, runValidators: true } 
        );
        
        res.json({ message: 'System configuration updated successfully.', config: updatedConfig });
    } catch (error) {
        res.status(500).json({ message: 'Error updating system configuration.', error: error.message });
    }
};

// @desc    获取所有 VIP 套餐
// @route   GET /api/admin/vip-packages
// @access  Private/Admin
exports.getVipPackages = async (req, res) => {
    try {
        const packages = await VIPPackage.find({});
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving VIP packages.' });
    }
};

// @desc    创建或更新 VIP 套餐
// @route   POST /api/admin/vip-packages
// @access  Private/Admin
exports.updateVipPackage = async (req, res) => {
    const { _id, ...updateData } = req.body;

    try {
        if (_id) {
            // 更新现有套餐
            const updatedPackage = await VIPPackage.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });
            if (!updatedPackage) {
                return res.status(404).json({ message: 'VIP package not found.' });
            }
            res.json({ message: 'VIP package updated successfully.', package: updatedPackage });
        } else {
            // 创建新套餐
            const newPackage = await VIPPackage.create(updateData);
            res.status(201).json({ message: 'VIP package created successfully.', package: newPackage });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error processing VIP package.', error: error.message });
    }
};