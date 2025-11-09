import React, { useState } from 'react';
import { Mail, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailConfigProps {
  emailConfig: any;
  emailTemplates: any[];
  onUpdateEmailConfig: (config: any) => void;
  onUpdateEmailTemplates: (templates: any[]) => void;
}

export const EmailConfig: React.FC<EmailConfigProps> = ({
  emailConfig,
  emailTemplates,
  onUpdateEmailConfig,
  onUpdateEmailTemplates
}) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSaveEmailConfig = () => {
    toast.success('邮件配置已保存');
  };

  const handleSaveEmailTemplate = () => {
    if (!editingItem) return;
    if (isAdding) {
      onUpdateEmailTemplates([...emailTemplates, { ...editingItem, id: editingItem.id || `tpl_${Date.now()}` }]);
    } else {
      onUpdateEmailTemplates(emailTemplates.map(tpl => tpl.id === editingItem.id ? editingItem : tpl));
    }
    toast.success(isAdding ? '添加成功' : '保存成功');
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleDeleteEmailTemplate = (id: string) => {
    if (!confirm('确定要删除吗？')) return;
    onUpdateEmailTemplates(emailTemplates.filter(tpl => tpl.id !== id));
    toast.success('删除成功');
  };

  const handleAddEmailTemplate = () => {
    setIsAdding(true);
    setEditingItem({
      id: '',
      name: '',
      subject: '',
      content: '',
      enabled: true
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">邮件配置</h2>
        <p className="text-gray-600 text-sm mt-1">配置SMTP服务器和邮件模板</p>
      </div>

      {/* SMTP配置 */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP服务器配置</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP主机</label>
              <input
                type="text"
                value={emailConfig.smtpHost}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                className="input-field"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP端口</label>
              <input
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP用户名</label>
              <input
                type="text"
                value={emailConfig.smtpUser}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP密码</label>
              <input
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发件人名称</label>
              <input
                type="text"
                value={emailConfig.fromName}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, fromName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">发件人邮箱</label>
              <input
                type="email"
                value={emailConfig.fromEmail}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={emailConfig.smtpSecure}
                onChange={(e) => onUpdateEmailConfig({ ...emailConfig, smtpSecure: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">使用SSL/TLS加密</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleSaveEmailConfig} className="btn-primary flex items-center">
              <Save className="h-5 w-5 mr-2" />
              保存配置
            </button>
            <button className="btn-secondary">发送测试邮件</button>
          </div>
        </div>
      </div>

      {/* 邮件模板 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">邮件模板</h3>
          {!editingItem && (
            <button onClick={handleAddEmailTemplate} className="btn-primary flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              添加模板
            </button>
          )}
        </div>

        {editingItem && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{isAdding ? '添加' : '编辑'}邮件模板</h3>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板ID</label>
                <input
                  type="text"
                  value={editingItem?.id || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, id: e.target.value })}
                  className="input-field"
                  placeholder="例如: welcome"
                  disabled={!isAdding}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
                <input
                  type="text"
                  value={editingItem?.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮件主题</label>
                <input
                  type="text"
                  value={editingItem?.subject || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, subject: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮件内容（HTML）</label>
                <textarea
                  value={editingItem?.content || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  className="input-field font-mono text-sm"
                  rows={10}
                  placeholder="支持HTML和变量: {{username}}, {{email}}, {{verify_link}}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">预览</label>
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: editingItem?.content || '' }}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingItem?.enabled || false}
                    onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">启用</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEmailTemplate} className="btn-primary flex items-center">
                <Save className="h-5 w-5 mr-2" />
                保存
              </button>
              <button onClick={() => { setEditingItem(null); setIsAdding(false); }} className="btn-secondary">
                取消
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {emailTemplates.map(template => (
            <div key={template.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">ID: {template.id}</p>
                  <p className="text-gray-600 text-sm">主题: {template.subject}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.enabled ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingItem(template)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteEmailTemplate(template.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
