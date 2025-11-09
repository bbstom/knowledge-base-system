const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * 获取所有邮件模板
 * GET /api/email-templates
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ name: 1 });
    
    res.json({
      success: true,
      data: templates  // 直接返回数组，不包装在对象中
    });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({
      success: false,
      message: '获取邮件模板失败'
    });
  }
});

/**
 * 获取单个邮件模板
 * GET /api/email-templates/:name
 */
router.get('/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ name: req.params.name });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({
      success: false,
      message: '获取邮件模板失败'
    });
  }
});

/**
 * 创建或更新邮件模板
 * POST /api/email-templates
 */
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, variables, language, isActive } = req.body;

    if (!name || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的模板信息'
      });
    }

    // 查找或创建模板
    let template = await EmailTemplate.findOne({ name });

    if (template) {
      // 更新现有模板
      template.subject = subject;
      template.htmlContent = htmlContent;
      template.textContent = textContent;
      if (variables) template.variables = variables;
      if (language) template.language = language;
      if (typeof isActive !== 'undefined') template.isActive = isActive;
      await template.save();
    } else {
      // 创建新模板
      template = new EmailTemplate({
        name,
        subject,
        htmlContent,
        textContent,
        variables,
        language,
        isActive
      });
      await template.save();
    }

    res.json({
      success: true,
      message: '邮件模板保存成功',
      data: { template }
    });
  } catch (error) {
    console.error('Save email template error:', error);
    res.status(500).json({
      success: false,
      message: '保存邮件模板失败'
    });
  }
});

/**
 * 删除邮件模板
 * DELETE /api/email-templates/:name
 */
router.delete('/:name', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndDelete({ name: req.params.name });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      message: '邮件模板已删除'
    });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({
      success: false,
      message: '删除邮件模板失败'
    });
  }
});

/**
 * 初始化默认模板
 * POST /api/email-templates/init-defaults
 */
router.post('/init-defaults', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const defaultTemplates = EmailTemplate.getDefaultTemplates();
    
    for (const templateData of defaultTemplates) {
      const existing = await EmailTemplate.findOne({ name: templateData.name });
      if (!existing) {
        const template = new EmailTemplate(templateData);
        await template.save();
      }
    }
    
    res.json({
      success: true,
      message: '默认模板初始化成功'
    });
  } catch (error) {
    console.error('Init default templates error:', error);
    res.status(500).json({
      success: false,
      message: '初始化默认模板失败'
    });
  }
});

/**
 * 预览邮件模板
 * POST /api/email-templates/:name/preview
 */
router.post('/:name/preview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ name: req.params.name });
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: '模板不存在'
      });
    }

    // 使用前端提供的变量或示例数据渲染
    let sampleData = req.body.variables || {};
    
    // 如果前端没有提供变量，使用模板中定义的示例数据
    if (Object.keys(sampleData).length === 0) {
      template.variables.forEach(v => {
        sampleData[v.name] = v.example || `[${v.name}]`;
      });
    }

    const rendered = template.render(sampleData);
    
    res.json({
      success: true,
      data: { rendered }
    });
  } catch (error) {
    console.error('Preview email template error:', error);
    res.status(500).json({
      success: false,
      message: '预览邮件模板失败'
    });
  }
});

module.exports = router;
