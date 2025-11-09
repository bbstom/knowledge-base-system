const crypto = require('crypto');

// 加密密钥（应该从环境变量读取，这里使用固定值作为示例）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // 必须是32字符
const IV_LENGTH = 16; // AES块大小

/**
 * 加密文本
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的文本（格式：iv:encryptedData）
 */
function encrypt(text) {
  if (!text) return '';
  
  try {
    // 确保密钥长度正确
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 返回 iv:encryptedData 格式
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('加密失败');
  }
}

/**
 * 解密文本
 * @param {string} text - 要解密的文本（格式：iv:encryptedData）
 * @returns {string} - 解密后的文本
 */
function decrypt(text) {
  if (!text) return '';
  
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('解密失败');
  }
}

/**
 * 测试加密解密
 */
function testEncryption() {
  const original = 'test-password-123';
  const encrypted = encrypt(original);
  const decrypted = decrypt(encrypted);
  
  console.log('Original:', original);
  console.log('Encrypted:', encrypted);
  console.log('Decrypted:', decrypted);
  console.log('Match:', original === decrypted);
}

module.exports = {
  encrypt,
  decrypt,
  testEncryption
};
