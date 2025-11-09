const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');
const SystemConfig = require('../models/SystemConfig');
const SiteConfig = require('../models/SiteConfig');
const { decrypt } = require('../utils/encryption');

// 创建邮件传输器
const createTransporter = async () => {
  try {
    // 优先从数据库读取配置
    const config = await SystemConfig.findOne();
    
    if (config && config.email && config.email.smtpHost) {
      // 使用数据库配置
      const smtpPassword = config.email.smtpPassword 
        ? decrypt(config.email.smtpPassword) 
        : '';
      
      return nodemailer.createTransport({
        host: config.email.smtpHost,
        port: config.email.smtpPort || 587,
        secure: config.email.smtpSecure || false,
        auth: {
          user: config.email.smtpUser,
          pass: smtpPassword
        }
      });
    }
    
    // 降级到环境变量配置
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    
    throw new Error('SMTP配置未找到，请在管理后台配置邮件服务');
  } catch (error) {
    console.error('Create transporter error:', error);
    throw error;
  }
};

// 发送验证码邮件
const sendVerificationCode = async (email, code, username = null) => {
  try {
    const transporter = await createTransporter();

    // 从数据库获取网站配置
    const siteConfig = await SiteConfig.getConfig();
    const siteName = siteConfig.siteName || process.env.SITE_NAME || '信息查询系统';
    const siteUrl = siteConfig.siteUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    const logoUrl = siteConfig.logoUrl || `${siteUrl}/logo.png`;

    // 尝试从数据库获取模板
    let template = await EmailTemplate.findOne({ 
      name: 'verification_code', 
      isActive: true 
    });

    let mailOptions;

    if (template) {
      // 使用数据库模板
      const rendered = template.render({
        code,
        username: username || email.split('@')[0], // 使用真实用户名或从邮箱提取
        email,
        expireMinutes: '10',
        siteName,
        siteUrl,
        logoUrl,
        year: new Date().getFullYear()
      });

      mailOptions = {
        from: `"${siteName}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text
      };
    } else {
      // 使用默认模板
      mailOptions = {
        from: `"${siteName}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '密码重置验证码',
        html: `
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
                <div class="code">${code}</div>
                <p style="margin-top: 10px; color: #6b7280;">验证码有效期：10分钟</p>
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
              <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
      };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// 发送密码重置成功通知
const sendPasswordResetNotification = async (email, username) => {
  try {
    const transporter = await createTransporter();

    // 从数据库获取网站配置
    const siteConfig = await SiteConfig.getConfig();
    const siteName = siteConfig.siteName || process.env.SITE_NAME || '信息查询系统';

    const mailOptions = {
      from: `"${siteName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '密码重置成功通知',
      html: `
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
              <p>尊敬的 ${username}，</p>
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
                重置时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
              </p>
            </div>
            <div class="footer">
              <p>此邮件由系统自动发送，请勿直接回复</p>
              <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset notification sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetNotification
};
