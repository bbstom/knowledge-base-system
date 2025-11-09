import React, { useState, useEffect } from 'react';
import { DollarSign, Check, X, Clock, Search, Filter, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/Layout/AdminLayout';
import { adminApi } from '../../utils/realApi';
import toast from 'react-hot-toast';

interface WithdrawRequest {
  _id: string;
  orderNo: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  type: 'balance' | 'commission';
  amount: number;
  fee: number;
  actualAmount: number;
  walletAddress: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  remark?: string;
  txHash?: string;
}

export const WithdrawManagement: React.FC = () => {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WithdrawRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [txHash, setTxHash] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    loadWithdrawRequests();
  }, [currentPage, statusFilter, typeFilter]);

  useEffect(() => {
    filterRequests();
  }, [withdrawRequests, searchTerm]);

  const loadWithdrawRequests = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getWithdrawals(currentPage, 20, statusFilter, typeFilter);
      if (response?.success) {
        setWithdrawRequests(response.data.withdrawals || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setStats(response.data.stats || []);
      }
    } catch (error: any) {
      console.error('Failed to load withdraw requests:', error);
      toast.error(error.message || '加载提现申请失败');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = withdrawRequests;

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.userId.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (request: WithdrawRequest) => {
    if (!txHash.trim()) {
      toast.error('请输入交易哈希');
      return;
    }

    if (!confirm(`确定批准用户 ${request.userId.username} 的提现申请吗？\n金额：$${request.amount}`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await adminApi.approveWithdrawal(request._id, txHash, remark);
      if (response?.success) {
        toast.success('提现申请已审批通过');
        setShowDetailModal(false);
        setTxHash('');
        setRemark('');
        loadWithdrawRequests();
      }
    } catch (error: any) {
      toast.error(error.message || '审批失败');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request: WithdrawRequest) => {
    if (!rejectReason.trim()) {
      toast.error('请输入拒绝原因');
      return;
    }

    if (!confirm(`确定拒绝用户 ${request.userId.username} 的提现申请吗？`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await adminApi.rejectWithdrawal(request._id, rejectReason);
      if (response?.success) {
        toast.success('提现申请已拒绝，佣金已退还');
        setShowDetailModal(false);
        setRejectReason('');
        loadWithdrawRequests();
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: '待审核',
      rejected: '已拒绝',
      completed: '已完成'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const pendingCount = withdrawRequests.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">提现管理</h1>
              <p className="text-gray-600">处理用户提现申请</p>
            </div>
            {pendingCount > 0 && (
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className="font-semibold">{pendingCount} 个待处理</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索用户名、订单号、钱包地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已批准</option>
                <option value="rejected">已拒绝</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <div key={request._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.userId.username}</h3>
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">#{request.orderNo}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">提现金额：</span>
                      <span className="font-medium text-gray-900">${request.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">类型：</span>
                      <span className="font-medium text-gray-900">{request.type === 'commission' ? '佣金' : '余额'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">手续费：</span>
                      <span className="font-medium text-gray-900">${request.fee}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">实际到账：</span>
                      <span className="font-medium text-green-600">${request.actualAmount}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <div>钱包地址：<span className="font-mono">{request.walletAddress}</span></div>
                    <div>申请时间：{formatDate(request.createdAt)}</div>
                    {request.processedAt && (
                      <div>处理时间：{formatDate(request.processedAt)}</div>
                    )}
                    {request.txHash && (
                      <div>交易哈希：<span className="font-mono text-xs">{request.txHash}</span></div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="查看详情"
                  >
                    <Eye className="h-5 w-5" />
                  </button>

                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                        title="批准"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="拒绝"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无提现申请
              </h3>
              <p className="text-gray-600">
                {statusFilter !== 'all' ? '当前筛选条件下没有记录' : '还没有用户提交提现申请'}
              </p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">提现详情</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setRejectReason('');
                    setTxHash('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">订单号</label>
                    <p className="font-medium">{selectedRequest.orderNo}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">用户名</label>
                    <p className="font-medium">{selectedRequest.userId.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">用户邮箱</label>
                    <p className="font-medium">{selectedRequest.userId.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">提现类型</label>
                    <p className="font-medium">{selectedRequest.type === 'commission' ? '佣金' : '余额'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">提现金额</label>
                    <p className="font-medium">${selectedRequest.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">手续费</label>
                    <p className="font-medium">${selectedRequest.fee}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">实际到账</label>
                    <p className="font-medium text-green-600">${selectedRequest.actualAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">状态</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">钱包地址</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                    {selectedRequest.walletAddress}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">申请时间</label>
                  <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                </div>

                {selectedRequest.processedAt && (
                  <div>
                    <label className="text-sm text-gray-600">处理时间</label>
                    <p className="font-medium">{formatDate(selectedRequest.processedAt)}</p>
                  </div>
                )}

                {selectedRequest.remark && (
                  <div>
                    <label className="text-sm text-gray-600">备注</label>
                    <p className="text-gray-700">{selectedRequest.remark}</p>
                  </div>
                )}

                {selectedRequest.txHash && (
                  <div>
                    <label className="text-sm text-gray-600">交易哈希</label>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                      {selectedRequest.txHash}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        交易哈希 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="input-field"
                        placeholder="请输入区块链交易哈希..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        备注（可选）
                      </label>
                      <textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="input-field"
                        rows={2}
                        placeholder="可选备注信息..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        拒绝原因（如需拒绝）
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="input-field"
                        rows={3}
                        placeholder="请输入拒绝原因..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedRequest)}
                        disabled={processing}
                        className="btn-primary flex items-center disabled:opacity-50"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        {processing ? '处理中...' : '批准提现'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest)}
                        disabled={processing}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50"
                      >
                        <X className="h-5 w-5 mr-2" />
                        {processing ? '处理中...' : '拒绝提现'}
                      </button>
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'completed' && selectedRequest.txHash && (
                  <div className="pt-4 border-t">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium">✓ 提现已完成</p>
                      <p className="text-sm text-green-600 mt-1">交易哈希：{selectedRequest.txHash}</p>
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'rejected' && selectedRequest.remark && (
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-800 font-medium">✗ 提现已拒绝</p>
                      <p className="text-sm text-red-600 mt-1">原因：{selectedRequest.remark}</p>
                    </div>
                  </div>
                )}


              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
