import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  Plus, MessageSquare, Clock, CheckCircle, XCircle,
  Send, Search, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
  attachments?: string[];
}

export const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [newTicketData, setNewTicketData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high',
    content: ''
  });

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/tickets?status=' + (filterStatus === 'all' ? '' : filterStatus), {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // 转换数据结构以匹配前端接口
        const transformedTickets = (data.data.tickets || []).map((ticket: any) => ({
          ...ticket,
          id: ticket._id,
          messages: ticket.messages.map((msg: any) => ({
            ...msg,
            id: msg._id
          }))
        }));
        setTickets(transformedTickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('加载工单失败');
    }
  };

  const loadTicketsOld = () => {
    // 模拟数据（备用）
    const mockTickets: Ticket[] = [
      {
        id: '1',
        subject: '账户充值问题',
        category: 'billing',
        priority: 'high',
        status: 'open',
        createdAt: '2024-10-19T10:30:00Z',
        updatedAt: '2024-10-19T10:30:00Z',
        messages: [
          {
            id: 'm1',
            content: '我充值了100元，但是余额没有到账，请帮忙查看一下。订单号：20241019001',
            isAdmin: false,
            createdAt: '2024-10-19T10:30:00Z'
          }
        ]
      },
      {
        id: '2',
        subject: '搜索功能使用咨询',
        category: 'support',
        priority: 'medium',
        status: 'replied',
        createdAt: '2024-10-18T15:20:00Z',
        updatedAt: '2024-10-19T09:15:00Z',
        messages: [
          {
            id: 'm2',
            content: '请问如何使用手机号搜索功能？',
            isAdmin: false,
            createdAt: '2024-10-18T15:20:00Z'
          },
          {
            id: 'm3',
            content: '您好！使用手机号搜索很简单：\n1. 进入搜索页面\n2. 选择"手机号"搜索类型\n3. 输入要查询的手机号\n4. 点击搜索按钮\n\n如有其他问题，欢迎随时咨询！',
            isAdmin: true,
            createdAt: '2024-10-19T09:15:00Z'
          }
        ]
      },
      {
        id: '3',
        subject: 'VIP会员权益咨询',
        category: 'general',
        priority: 'low',
        status: 'closed',
        createdAt: '2024-10-17T14:00:00Z',
        updatedAt: '2024-10-18T10:00:00Z',
        messages: [
          {
            id: 'm4',
            content: 'VIP会员有哪些特权？',
            isAdmin: false,
            createdAt: '2024-10-17T14:00:00Z'
          },
          {
            id: 'm5',
            content: 'VIP会员享有以下特权：\n1. 搜索次数无限制\n2. 专属客服支持\n3. 优先数据更新\n4. 更多积分奖励\n5. 专属VIP标识\n\n详情请查看VIP页面。',
            isAdmin: true,
            createdAt: '2024-10-17T16:30:00Z'
          },
          {
            id: 'm6',
            content: '明白了，谢谢！',
            isAdmin: false,
            createdAt: '2024-10-18T10:00:00Z'
          }
        ]
      }
    ];
    setTickets(mockTickets);
  };

  const handleCreateTicket = async () => {
    if (!newTicketData.subject || !newTicketData.content) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify(newTicketData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('工单已创建');
        setShowNewTicket(false);
        setNewTicketData({
          subject: '',
          category: 'general',
          priority: 'medium',
          content: ''
        });
        // 重新加载工单列表
        loadTickets();
      } else {
        toast.error(data.message || '创建工单失败');
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      toast.error('创建工单失败');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      const data = await response.json();

      if (data.success) {
        // 转换数据结构
        const transformedTicket = {
          ...data.data,
          id: data.data._id,
          messages: data.data.messages.map((msg: any) => ({
            ...msg,
            id: msg._id
          }))
        };
        setTickets(tickets.map(t => t.id === selectedTicket.id ? transformedTicket : t));
        setSelectedTicket(transformedTicket);
        setNewMessage('');
        toast.success('消息已发送');
      } else {
        toast.error(data.message || '发送失败');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('发送失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: '待处理' },
      replied: { color: 'bg-green-100 text-green-800', icon: MessageSquare, label: '已回复' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: '已关闭' }
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: '低',
      medium: '中',
      high: '高'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[priority as keyof typeof badges]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: '一般咨询',
      billing: '账户充值',
      support: '技术支持',
      complaint: '投诉建议'
    };
    return labels[category] || category;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout showSidebar>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">在线工单</h1>
            <p className="text-gray-600 mt-1">提交问题或查看工单状态</p>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            新建工单
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
                placeholder="搜索工单..."
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">全部状态</option>
              <option value="open">待处理</option>
              <option value="replied">已回复</option>
              <option value="closed">已关闭</option>
            </select>
          </div>
        </div>

        {/* 工单列表 - 单列布局 */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="card text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无工单</p>
              <button
                onClick={() => setShowNewTicket(true)}
                className="btn-primary mt-4"
              >
                创建第一个工单
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="card cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{ticket.subject}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {ticket.messages.length} 条消息
                      </span>
                      <span>{getCategoryLabel(ticket.category)}</span>
                      <span>更新于 {new Date(ticket.updatedAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>

                {/* 最新消息预览 */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {ticket.messages[ticket.messages.length - 1].content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 工单详情模态框 */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <span>分类：{getCategoryLabel(selectedTicket.category)}</span>
                    <span>•</span>
                    <span>创建时间：{new Date(selectedTicket.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              <div className="p-6">
                {/* 消息列表 */}
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.isAdmin
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium">
                            {message.isAdmin ? '客服' : '我'}
                          </span>
                          <span className={`text-xs ml-2 ${message.isAdmin ? 'text-gray-500' : 'text-blue-100'}`}>
                            {new Date(message.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 回复输入框 */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="input-field resize-none"
                          rows={3}
                          placeholder="输入回复内容..."
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="btn-primary flex items-center"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        发送
                      </button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === 'closed' && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">此工单已关闭</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn-secondary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新建工单模态框 */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-900">新建工单</h2>
              </div>
              <div className="p-6">

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      工单标题 *
                    </label>
                    <input
                      type="text"
                      value={newTicketData.subject}
                      onChange={(e) => setNewTicketData({ ...newTicketData, subject: e.target.value })}
                      className="input-field"
                      placeholder="简要描述您的问题"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        问题分类 *
                      </label>
                      <select
                        value={newTicketData.category}
                        onChange={(e) => setNewTicketData({ ...newTicketData, category: e.target.value })}
                        className="input-field"
                      >
                        <option value="general">一般咨询</option>
                        <option value="billing">账户充值</option>
                        <option value="support">技术支持</option>
                        <option value="complaint">投诉建议</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        优先级 *
                      </label>
                      <select
                        value={newTicketData.priority}
                        onChange={(e) => setNewTicketData({ ...newTicketData, priority: e.target.value as any })}
                        className="input-field"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      问题描述 *
                    </label>
                    <textarea
                      value={newTicketData.content}
                      onChange={(e) => setNewTicketData({ ...newTicketData, content: e.target.value })}
                      className="input-field"
                      rows={6}
                      placeholder="请详细描述您遇到的问题..."
                    />
                  </div>
                </div>

              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex justify-end space-x-4">
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="btn-primary"
                >
                  提交工单
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
