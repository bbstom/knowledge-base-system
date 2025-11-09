import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { 
  MessageSquare, Search, Clock, CheckCircle, 
  XCircle, Send, User
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  userId: string;
  username: string;
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
  adminName?: string;
  createdAt: string;
}

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    // 模拟数据 - 实际应该从API获取
    const mockTickets: Ticket[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'user123',
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
        userId: 'user2',
        username: 'newuser456',
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
            adminName: '客服小王',
            createdAt: '2024-10-19T09:15:00Z'
          }
        ]
      }
    ];
    setTickets(mockTickets);
  };

  const handleReply = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: `m${Date.now()}`,
          content: newMessage,
          isAdmin: true,
          adminName: '管理员',
          createdAt: new Date().toISOString()
        }
      ],
      status: 'replied' as const,
      updatedAt: new Date().toISOString()
    };

    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage('');
    toast.success('回复已发送');
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;

    if (window.confirm('确定要关闭此工单吗？')) {
      const updatedTicket = {
        ...selectedTicket,
        status: 'closed' as const,
        updatedAt: new Date().toISOString()
      };

      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      toast.success('工单已关闭');
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
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    replied: tickets.filter(t => t.status === 'replied').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">工单管理</h1>
          <p className="text-gray-600 mt-1">查看和处理用户工单</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总工单数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理</p>
                <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已回复</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已关闭</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 工单列表 */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* 搜索和筛选 */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-10"
                    placeholder="搜索工单或用户..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="open">待处理</option>
                    <option value="replied">已回复</option>
                    <option value="closed">已关闭</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="all">全部优先级</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                </div>
              </div>

              {/* 工单列表 */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {ticket.username}
                        </div>
                      </div>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(ticket.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>暂无工单</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 工单详情 */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="card">
                {/* 工单头部 */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedTicket.subject}
                      </h2>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {selectedTicket.username}
                        </span>
                        <span>•</span>
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
                </div>

                {/* 消息列表 */}
                <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.isAdmin
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium">
                            {message.isAdmin ? (message.adminName || '管理员') : selectedTicket.username}
                          </span>
                          <span className={`text-xs ml-2 ${message.isAdmin ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 回复输入框 */}
                {selectedTicket.status !== 'closed' ? (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="input-field resize-none"
                        rows={4}
                        placeholder="输入回复内容..."
                      />
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handleCloseTicket}
                          className="btn-secondary text-sm"
                        >
                          关闭工单
                        </button>
                        <button
                          onClick={handleReply}
                          disabled={!newMessage.trim()}
                          className="btn-primary flex items-center"
                        >
                          <Send className="h-5 w-5 mr-2" />
                          发送回复
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">此工单已关闭</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">请选择一个工单查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
