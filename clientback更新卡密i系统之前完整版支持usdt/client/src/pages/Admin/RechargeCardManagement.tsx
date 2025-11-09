import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import {
  CreditCard, Plus, Trash2, Search,
  RefreshCw, Copy, DollarSign,
  Gift, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RechargeCard {
  _id: string;
  code: string;
  type: 'balance' | 'points' | 'vip';
  amount: number;
  points: number;
  vipDays: number;
  vipPackageName: string;
  status: 'unused' | 'used' | 'expired' | 'disabled';
  usedBy?: {
    username: string;
    email: string;
  };
  usedAt?: string;
  expiresAt?: string;
  batchNumber: string;
  note: string;
  createdAt: string;
}

export const RechargeCardManagement: React.FC = () => {
  const [cards, setCards] = useState<RechargeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // 筛选条件
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  // 生成卡密表单
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'balance',
    amount: '',
    points: '',
    vipDays: '',
    vipPackageName: '',
    quantity: '10',
    expiresAt: '',
    note: ''
  });

  // 统计信息
  const [statistics, setStatistics] = useState<any>(null);

  // 选中的卡密
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    loadCards();
    loadStatistics();
  }, [page, filters]);

  const loadCards = async () => {
    setLoading(true);
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });

      const response = await fetch(`/api/recharge-card/admin/list?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCards(data.cards);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (error) {
      console.error('加载卡密列表失败:', error);
      toast.error('加载卡密列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/recharge-card/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  };

  const handleGenerateCards = async () => {
    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];

      const requestData: any = {
        type: generateForm.type,
        quantity: parseInt(generateForm.quantity)
      };

      if (generateForm.type === 'balance') {
        requestData.amount = parseFloat(generateForm.amount);
      } else if (generateForm.type === 'points') {
        requestData.points = parseInt(generateForm.points);
      } else if (generateForm.type === 'vip') {
        requestData.vipDays = parseInt(generateForm.vipDays);
        requestData.vipPackageName = generateForm.vipPackageName;
      }

      if (generateForm.expiresAt) {
        requestData.expiresAt = generateForm.expiresAt;
      }

      if (generateForm.note) {
        requestData.note = generateForm.note;
      }

      const response = await fetch('/api/recharge-card/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setShowGenerateModal(false);
        loadCards();
        loadStatistics();

        // 下载卡密
        downloadCards(data.cards);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('生成卡密失败:', error);
      toast.error('生成卡密失败');
    }
  };

  const downloadCards = (cards: any[]) => {
    let content = '卡密码\t类型\t金额/积分/天数\t过期时间\t备注\n';
    
    cards.forEach(card => {
      let value = '';
      if (card.type === 'balance') value = `$${card.amount}`;
      else if (card.type === 'points') value = `${card.points}积分`;
      else if (card.type === 'vip') value = `${card.vipDays}天`;

      content += `${card.code}\t${card.type}\t${value}\t${card.expiresAt || '永久'}\t${card.note || ''}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `卡密_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('卡密已复制');
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('确定要删除这张卡密吗？')) return;

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch(`/api/recharge-card/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('删除成功');
        loadCards();
        loadStatistics();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('删除卡密失败:', error);
      toast.error('删除卡密失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedCards.length === 0) {
      toast.error('请选择要删除的卡密');
      return;
    }

    if (!confirm(`确定要删除选中的${selectedCards.length}张卡密吗？`)) return;

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/recharge-card/admin/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedCards })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setSelectedCards([]);
        loadCards();
        loadStatistics();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      unused: { color: 'bg-green-100 text-green-800', label: '未使用' },
      used: { color: 'bg-gray-100 text-gray-800', label: '已使用' },
      expired: { color: 'bg-red-100 text-red-800', label: '已过期' },
      disabled: { color: 'bg-yellow-100 text-yellow-800', label: '已禁用' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    if (type === 'balance') return <DollarSign className="h-4 w-4" />;
    if (type === 'points') return <Gift className="h-4 w-4" />;
    if (type === 'vip') return <Crown className="h-4 w-4" />;
    return null;
  };

  const getTypeLabel = (type: string) => {
    if (type === 'balance') return '余额';
    if (type === 'points') return '积分';
    if (type === 'vip') return 'VIP';
    return type;
  };

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* 页头 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CreditCard className="h-8 w-8 mr-3 text-blue-600" />
            卡密管理
          </h1>
          <p className="text-gray-600 mt-1">生成和管理充值卡密</p>
        </div>

        {/* 统计卡片 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="card">
              <div className="text-sm text-gray-600">总卡密数</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.total}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">未使用</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {statistics.unused}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">已使用</div>
              <div className="text-2xl font-bold text-gray-600 mt-1">
                {statistics.used}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">已过期</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {statistics.expired}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">已禁用</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {statistics.disabled}
              </div>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                生成卡密
              </button>
              
              {selectedCards.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="btn-secondary flex items-center text-red-600"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  批量删除 ({selectedCards.length})
                </button>
              )}

              <button
                onClick={loadCards}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                刷新
              </button>
            </div>

            {/* 筛选 */}
            <div className="flex items-center space-x-3">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input-field"
              >
                <option value="">全部类型</option>
                <option value="balance">余额</option>
                <option value="points">积分</option>
                <option value="vip">VIP</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">全部状态</option>
                <option value="unused">未使用</option>
                <option value="used">已使用</option>
                <option value="expired">已过期</option>
                <option value="disabled">已禁用</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="搜索卡密或备注"
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 卡密列表 */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">暂无卡密</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCards.length === cards.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCards(cards.map(c => c._id));
                            } else {
                              setSelectedCards([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        卡密码
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        价值
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        状态
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        使用信息
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        过期时间
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cards.map((card) => (
                      <tr key={card._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedCards.includes(card._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCards([...selectedCards, card._id]);
                              } else {
                                setSelectedCards(selectedCards.filter(id => id !== card._id));
                              }
                            }}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {card.code}
                            </code>
                            <button
                              onClick={() => handleCopyCode(card.code)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(card.type)}
                            <span>{getTypeLabel(card.type)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {card.type === 'balance' && `$${card.amount}`}
                          {card.type === 'points' && `${card.points}积分`}
                          {card.type === 'vip' && `${card.vipDays}天`}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(card.status)}
                        </td>
                        <td className="px-4 py-3">
                          {card.usedBy ? (
                            <div className="text-sm">
                              <div className="text-gray-900">{card.usedBy.username}</div>
                              <div className="text-gray-500 text-xs">
                                {new Date(card.usedAt!).toLocaleString('zh-CN')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {card.expiresAt ? (
                            <div className="text-sm text-gray-600">
                              {new Date(card.expiresAt).toLocaleDateString('zh-CN')}
                            </div>
                          ) : (
                            <span className="text-gray-400">永久</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCard(card._id)}
                            disabled={card.status === 'used'}
                            className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    共 {total} 张卡密，第 {page} / {pages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="btn-secondary disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pages}
                      className="btn-secondary disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 生成卡密模态框 */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                生成充值卡密
              </h3>

              <div className="space-y-4">
                {/* 卡密类型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    卡密类型
                  </label>
                  <select
                    value={generateForm.type}
                    onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="balance">余额充值</option>
                    <option value="points">积分充值</option>
                    <option value="vip">VIP充值</option>
                  </select>
                </div>

                {/* 根据类型显示不同字段 */}
                {generateForm.type === 'balance' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      充值金额 ($)
                    </label>
                    <input
                      type="number"
                      value={generateForm.amount}
                      onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
                      className="input-field"
                      placeholder="例如: 10"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                )}

                {generateForm.type === 'points' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      积分数量
                    </label>
                    <input
                      type="number"
                      value={generateForm.points}
                      onChange={(e) => setGenerateForm({ ...generateForm, points: e.target.value })}
                      className="input-field"
                      placeholder="例如: 100"
                      min="1"
                    />
                  </div>
                )}

                {generateForm.type === 'vip' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VIP天数
                      </label>
                      <input
                        type="number"
                        value={generateForm.vipDays}
                        onChange={(e) => setGenerateForm({ ...generateForm, vipDays: e.target.value })}
                        className="input-field"
                        placeholder="例如: 30"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        套餐名称（可选）
                      </label>
                      <input
                        type="text"
                        value={generateForm.vipPackageName}
                        onChange={(e) => setGenerateForm({ ...generateForm, vipPackageName: e.target.value })}
                        className="input-field"
                        placeholder="例如: 月度VIP"
                      />
                    </div>
                  </>
                )}

                {/* 生成数量 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生成数量（1-1000）
                  </label>
                  <input
                    type="number"
                    value={generateForm.quantity}
                    onChange={(e) => setGenerateForm({ ...generateForm, quantity: e.target.value })}
                    className="input-field"
                    min="1"
                    max="1000"
                  />
                </div>

                {/* 过期时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    过期时间（可选）
                  </label>
                  <input
                    type="date"
                    value={generateForm.expiresAt}
                    onChange={(e) => setGenerateForm({ ...generateForm, expiresAt: e.target.value })}
                    className="input-field"
                  />
                </div>

                {/* 备注 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注（可选）
                  </label>
                  <input
                    type="text"
                    value={generateForm.note}
                    onChange={(e) => setGenerateForm({ ...generateForm, note: e.target.value })}
                    className="input-field"
                    placeholder="例如: 活动赠送"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleGenerateCards}
                  className="btn-primary flex-1"
                >
                  生成卡密
                </button>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
