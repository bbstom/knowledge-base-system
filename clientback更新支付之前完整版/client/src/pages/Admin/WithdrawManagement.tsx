import React, { useState, useEffect } from 'react';
import { DollarSign, Check, X, Clock, Search, Filter, Eye } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import toast from 'react-hot-toast';

interface WithdrawRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  usdtAmount: number;
  usdtAddress: string;
  fee: number;
  actualAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectReason?: string;
  txHash?: string;
}

export const WithdrawManagement: React.FC = () => {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WithdrawRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    loadWithdrawRequests();
    // 模拟实时更新
    const interval = setInterval(loadWithdrawRequests, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [withdrawRequests, statusFilter, searchTerm]);

  const loadWithdrawRequests = async () => {
    // 模拟加载提现申请
    const mockData: WithdrawRequest[] = [
      {
        id: 'wd001',
        userId: 'user001',
        username: 'testuser',
        amount: 100,
        usdtAmount: 13.3,
        usdtAddress: 'TXxx1234567890abcdefghijklmnopqrst',
        fee: 5,
        actualAmount: 95,
        status: 'pending',
        createdAt: '2024-10-19T10:30:00Z'
      },
      {
        id: 'wd002',
        userId: 'user002',
        username: 'user123',
        amount: 200,
        usdtAmount: 26.6,
        usdtAddress: 'TYyy9876543210zyxwvutsrqponmlkjihg',
        fee: 10,
        actualAmount: 190,
        status: 'approved',
        createdAt: '2024-10-19T09:15:00Z',
        processedAt: '2024-10-19T09:30:00Z',
        processedBy: 'admin'
      },
      {
        id: 'wd003',
        userId: 'user003',
        username: 'newuser',
        amount: 50,
        usdtAmount: 6.65,
        usdtAddress: 'TZzz5555555555aaaabbbbccccddddeeee',
        fee: 2.5,
        actualAmount: 47.5,
        status: 'completed',
        createdAt: '2024-10-18T16:45:00Z',
        processedAt: '2024-10-18T17:00:00Z',
        processedBy: 'admin',
        txHash: '0x1234567890abcdef...'
      }
    ];
    setWithdrawRequests(mockData);
  };

  const filterRequests = () => {
    let filtered = withdrawRequests;

    // 状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // 搜索筛选
    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.usdtAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (request: WithdrawRequest) => {
    if (!confirm(`确定批准用户 ${request.username} 的提现申请吗？\n金额：${request.amount}元 (${request.usdtAmount} USDT)`)) {
      return;
    }

    // 模拟批准操作
    const updatedRequests = withdrawRequests.map(req =>
      req.id === request.id
        ? {
            ...req,
            status: 'approved' as const,
            processedAt: new Date().toISOString(),
            processedBy: 'admin'
          }
        : req
    );
    setWithdrawRequests(updatedRequests);
    toast.success('提现申请已批准');
    setShowDetailModal(false);
  };

  const handleReject = async (request: WithdrawRequest) => {
    if (!rejectReason.trim()) {
      toast.error('请输入拒绝原因');
      return;
    }

    if (!confirm(`确定拒绝用户 ${request.username} 的提现申请吗？`)) {
      return;
    }

    // 模拟拒绝操作
    const updatedRequests = withdrawRequests.map(req =>
      req.id === request.id
        ? {
            ...req,
            status: 'rejected' as const,
            processedAt: new Date().toISOString(),
            processedBy: 'admin',
            rejectReason
          }
        : req
    );
    setWithdrawRequests(updatedRequests);
    toast.success('提现申请已拒绝');
    setShowDetailModal(false);
    setRejectReason('');
  };

  const handleComplete = async (request: WithdrawRequest) => {
    if (!txHash.trim()) {
      toast.error('请输入交易哈希');
      return;
    }

    if (!confirm(`确定标记为已完成吗？\n请确保已经发送USDT到用户钱包`)) {
      return;
    }

    // 模拟完成操作
    const updatedRequests = withdrawRequests.map(req =>
      req.id === request.id
        ? {
            ...req,
            status: 'completed' as const,
            txHash
          }
        : req
    );
    setWithdrawRequests(updatedRequests);
    toast.success('提现已标记为完成');
    setShowDetailModal(false);
    setTxHash('');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: '待审核',
      approved: '已批准',
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
    <Layout>
      <div className="p-6">
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
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.username}</h3>
                    {getStatusBadge(request.status)}
                    <span className="text-sm text-gray-500">#{request.id}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">提现金额：</span>
                      <span className="font-medium text-gray-900">¥{request.amount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">USDT数量：</span>
                      <span className="font-medium text-gray-900">{request.usdtAmount} USDT</span>
                    </div>
                    <div>
                      <span className="text-gray-600">手续费：</span>
                      <span className="font-medium text-gray-900">¥{request.fee}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">实际到账：</span>
                      <span className="font-medium text-green-600">{request.usdtAmount} USDT</span>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <div>钱包地址：<span className="font-mono">{request.usdtAddress}</span></div>
                    <div>申请时间：{formatDate(request.createdAt)}</div>
                    {request.processedAt && (
                      <div>处理时间：{formatDate(request.processedAt)}</div>
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
                    <p className="font-medium">{selectedRequest.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">用户名</label>
                    <p className="font-medium">{selectedRequest.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">提现金额</label>
                    <p className="font-medium">¥{selectedRequest.amount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">手续费</label>
                    <p className="font-medium">¥{selectedRequest.fee}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">USDT数量</label>
                    <p className="font-medium text-green-600">{selectedRequest.usdtAmount} USDT</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">状态</label>
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">USDT钱包地址</label>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
                    {selectedRequest.usdtAddress}
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

                {selectedRequest.rejectReason && (
                  <div>
                    <label className="text-sm text-gray-600">拒绝原因</label>
                    <p className="text-red-600">{selectedRequest.rejectReason}</p>
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
                        className="btn-primary flex items-center"
                      >
                        <Check className="h-5 w-5 mr-2" />
                        批准提现
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                      >
                        <X className="h-5 w-5 mr-2" />
                        拒绝提现
                      </button>
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'approved' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        交易哈希（完成后填写）
                      </label>
                      <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="input-field"
                        placeholder="输入USDT转账的交易哈希..."
                      />
                    </div>
                    <button
                      onClick={() => handleComplete(selectedRequest)}
                      className="btn-primary"
                    >
                      标记为已完成
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
