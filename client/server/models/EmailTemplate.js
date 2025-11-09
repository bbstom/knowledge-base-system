const mongoose = require('mongoose');
const { userConnection } = require('../config/database');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['verification_code', 'password_reset_success', 'welcome', 'notification']
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String
  },
  variables: [{
    name: String,
    description: String,
    example: String
  }],
  language: {
    type: String,
    default: 'zh-CN'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时间戳
emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 渲染模板（替换变量）
emailTemplateSchema.methods.render = function(variables) {
  let html = this.htmlContent;
  let text = this.textContent || '';
  let subject = this.subject;

  // 替换变量
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, variables[key]);
    text = text.replace(regex, variables[key]);
    subject = subject.replace(regex, variables[key]);
  });

  return { html, text, subject };
};

// 获取默认模板
emailTemplateSchema.statics.getDefaultTemplates = function() {
  return [
    {
      name: 'verification_code',
      subject: '密码重置验证码 - {{siteName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 密码重置验证码</h1>
            </div>
            <div class="content">
              <p>您好，</p>
              <p>您正在申请重置密码。请使用以下验证码完成验证：</p>
              
              <div class="code-box">
                <div class="code">{{code}}</div>
                <p style="margin-top: 10px; color: #6b7280;">验证码有效期：{{expireMinutes}}分钟</p>
              </div>

              <div class="warning">
                <strong>⚠️ 安全提示：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>如果这不是您本人的操作，请忽略此邮件</li>
                  <li>请勿将验证码告诉任何人</li>
                  <li>验证码仅用于密码重置，其他用途均为诈骗</li>
                </ul>
              </div>

              <p style="margin-top: 20px;">如有疑问，请联系我们的客服团队。</p>
            </div>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复</p>
              <p>&copy; {{year}} {{siteName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: [
        { name: 'code', description: '验证码', example: '123456' },
        { name: 'expireMinutes', description: '过期时间（分钟）', example: '10' },
        { name: 'siteName', description: '网站名称', example: '信息查询系统' },
        { name: 'year', description: '年份', example: '2024' }
      ]
    },
    {
      name: 'password_reset_success',
      subject: '密码重置成功通知 - {{siteName}}',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>密码重置成功</h1>
            </div>
            <div class="content">
              <p>尊敬的 {{username}}，</p>
              <p>您的账户密码已成功重置。</p>
              
              <div class="warning">
                <strong>⚠️ 安全提示：</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>如果这不是您本人的操作，请立即联系客服</li>
                  <li>建议定期更换密码以保护账户安全</li>
                  <li>不要使用简单或常见的密码</li>
                </ul>
              </div>

              <p style="margin-top: 20px;">
                重置时间：{{resetTime}}
              </p>
            </div>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复</p>
              <p>&copy; {{year}} {{siteName}}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      variables: [
        { name: 'username', description: '用户名', example: 'testuser' },
        { name: 'resetTime', description: '重置时间', example: '2024-10-23 14:30:00' },
        { name: 'siteName', description: '网站名称', example: '信息查询系统' },
        { name: 'year', description: '年份', example: '2024' }
      ]
    }
  ];
};

const EmailTemplate = userConnection.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplate;
