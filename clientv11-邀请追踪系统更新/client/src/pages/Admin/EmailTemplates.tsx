import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { Mail, Plus, Edit, Trash2, Eye, Save, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: TemplateVariable[];
  isActive: boolean;
  description: string;
}

const templateTypes = [
  { value: 'verification_code', label: '验证码邮件', description: '用于发送验证码' },
  { value: 'password_reset_success', label: '密码重置成功', description: '密码重置成功通知' },
  { value: 'welcome', label: '欢迎邮件', description: '新用户注册欢迎' },
  { value: 'notification', label: '通知邮件', description: '系统通知' },
];

export const EmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/email-templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
      } else {
        console.error('Invalid data format:', data);
        setTemplates([]);
      }
    } catch (error) {
      console.error('Load templates error:', error);
      toast.error('加载模板失败');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleCreate = () => {
    setEditingTemplate({
      _id: '',
      name: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      variables: [],
      isActive: true,
      description: ''
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;

    if (!editingTemplate.name || !editingTemplate.subject) {
      toast.error('请填写模板名称和主题');
      return;
    }

    if (!editingTemplate.htmlContent) {
      toast.error('请填写HTML内容');
      return;
    }

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      
      console.log('Saving template:', editingTemplate);
      
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingTemplate)
      });

      const data = await response.json();
      
      console.log('Save response:', data);
      
      if (data.success) {
        toast.success(editingTemplate._id ? '更新成功' : '创建成功');
        setShowEditor(false);
        setEditingTemplate(null);
        // 重新加载模板列表
        await loadTemplates();
      } else {
        toast.error(data.message || '保存失败');
        console.error('Save failed:', data);
      }
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm('确定要删除这个模板吗？')) return;

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch(`/api/email-templates/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('删除成功');
        loadTemplates();
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('Delete template error:', error);
      toast.error('删除失败');
    }
  };

  const handlePreview = async () => {
    if (!editingTemplate) return;

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch(`/api/email-templates/${editingTemplate.name}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          variables: {
            code: '123456',
            username: '测试用户',
            email: 'test@example.com',
            siteName: '信息查询系统',
            siteUrl: window.location.origin,
            logoUrl: `${window.location.origin}/logo.png`,
            expireMinutes: '10',
            year: new Date().getFullYear()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        // rendered 是一个对象 { html, text, subject }，需要提取 html 属性
        const htmlContent = data.data.rendered?.html || data.data.rendered || data.data.html;
        setPreviewHtml(htmlContent);
        setShowPreview(true);
      } else {
        toast.error(data.message || '预览失败');
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('预览失败');
    }
  };

  const initDefaults = async () => {
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/email-templates/init-defaults', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('默认模板初始化成功');
        loadTemplates();
      } else {
        toast.error(data.message || '初始化失败');
      }
    } catch (error) {
      console.error('Init defaults error:', error);
      toast.error('初始化失败');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">邮件模板管理</h1>
            <p className="text-gray-600">自定义系统邮件模板</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={initDefaults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              初始化默认模板
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              创建模板
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">还没有邮件模板</p>
            <button
              onClick={initDefaults}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              初始化默认模板
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => {
              const typeInfo = templateTypes.find(t => t.value === template.name);
              return (
                <div key={template._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {typeInfo?.label || template.name}
                        </h3>
                        {template.isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            启用
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <p className="text-sm text-gray-500">主题: {template.subject}</p>
                    </div>
                  </div>

                  {template.variables && template.variables.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">可用变量:</p>
                      <div className="flex flex-wrap gap-2">
                        {template.variables.map((variable, index) => (
                          <code key={`${template._id}-${variable.name}-${index}`} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {`{{${variable.name}}}`}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(template.name)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 编辑器模态框 */}
        {showEditor && editingTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTemplate._id ? '编辑模板' : '创建模板'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingTemplate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 模板类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模板类型 *
                  </label>
                  <select
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="input-field"
                    disabled={!!editingTemplate._id}
                  >
                    <option value="">选择模板类型</option>
                    {templateTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 主题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮件主题 *
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    className="input-field"
                    placeholder="例如: 验证码邮件"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                    className="input-field"
                    placeholder="模板用途说明"
                  />
                </div>

                {/* HTML内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML 内容
                  </label>
                  <textarea
                    value={editingTemplate.htmlContent}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                    className="input-field font-mono text-sm"
                    rows={12}
                    placeholder="HTML 邮件内容，可使用 {{variable}} 作为变量"
                  />
                </div>

                {/* 纯文本内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    纯文本内容（可选）
                  </label>
                  <textarea
                    value={editingTemplate.textContent}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, textContent: e.target.value })}
                    className="input-field"
                    rows={6}
                    placeholder="纯文本版本，用于不支持HTML的邮件客户端"
                  />
                </div>

                {/* 变量说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-2">可用变量</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><code className="bg-blue-100 px-1 rounded">{`{{code}}`}</code> - 验证码</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{username}}`}</code> - 用户名</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{email}}`}</code> - 邮箱地址</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{siteName}}`}</code> - 网站名称</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{siteUrl}}`}</code> - 网站主页URL</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{logoUrl}}`}</code> - 网站Logo URL</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{expireMinutes}}`}</code> - 过期时间（分钟）</p>
                        <p><code className="bg-blue-100 px-1 rounded">{`{{year}}`}</code> - 当前年份</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>示例：</strong> 在模板中使用 <code className="bg-blue-100 px-1 rounded">{`<a href="{{siteUrl}}"><img src="{{logoUrl}}" alt="{{siteName}}"></a>`}</code> 创建可点击的Logo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 启用状态 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingTemplate.isActive}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    启用此模板
                  </label>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                <button
                  onClick={handlePreview}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  预览
                </button>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 预览模态框 */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">邮件预览</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div 
                  className="border rounded-lg p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
