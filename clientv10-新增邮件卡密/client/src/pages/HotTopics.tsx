import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, MessageCircle, Calendar, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';

interface Topic {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  comments: number;
  createdAt: string;
  isHot: boolean;
  tags: string[];
}

export const HotTopics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/topics');
      const data = await response.json();
      
      if (data.success) {
        setTopics(data.data.topics || []);
      }
    } catch (error) {
      console.error('加载话题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: '全部话题', icon: TrendingUp },
    { value: 'security', label: '信息安全', icon: Eye },
    { value: 'legal', label: '法律法规', icon: MessageCircle },
    { value: 'tips', label: '使用技巧', icon: Tag },
    { value: 'vip', label: 'VIP相关', icon: Calendar },
    { value: 'announcement', label: '平台公告', icon: TrendingUp }
  ];

  const filteredTopics = topics.filter(topic => 
    selectedCategory === 'all' || topic.category === selectedCategory
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            热门话题
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            探索平台最新动态，了解行业趋势，分享使用心得
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTopics.map(topic => {
            const topicId = (topic as any)._id || topic.id;
            const isExpanded = expandedTopics.has(topicId);
            
            return (
            <div key={topicId} className="card hover:shadow-lg transition-all">
              {/* Topic Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {topic.title}
                  {topic.isHot && (
                    <span className="inline-flex items-center ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      热门
                    </span>
                  )}
                </h3>
              </div>

              {/* Topic Content */}
              <div className={`text-gray-600 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
                <p className="whitespace-pre-wrap">{topic.content}</p>
              </div>

              {/* Tags */}
              {isExpanded && topic.tags && topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {topic.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Topic Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {formatNumber(topic.views)}
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {(topic as any).likes || 0}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate((topic as any).customUpdatedAt || (topic as any).updatedAt || topic.createdAt)}
                  </div>
                </div>
                
                <button 
                  onClick={() => toggleExpand(topicId)}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {isExpanded ? (
                    <>
                      收起 <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      阅读更多 <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
          })}
        </div>

        {/* Hot Topics Sidebar */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-red-500" />
              本周热门
            </h3>
            <div className="space-y-3">
              {topics.filter(t => t.isHot).slice(0, 3).map((topic, index) => {
                const topicId = (topic as any)._id || topic.id;
                return (
                <div key={topicId} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-red-500 text-white' :
                    index === 1 ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {topic.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(topic.views)} 次浏览
                    </p>
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              有想分享的话题？
            </h3>
            <p className="text-gray-600 mb-4">
              加入我们的社区讨论，分享您的见解和经验
            </p>
            <button className="btn-primary">
              发布话题
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};