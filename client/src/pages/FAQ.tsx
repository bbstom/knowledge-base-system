import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ: React.FC = () => {
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faqs');
      const data = await response.json();
      
      if (data.success) {
        setFaqData(data.data.faqs || []);
      }
    } catch (error) {
      console.error('加载FAQ失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: '全部问题' },
    { value: 'account', label: '账户相关' },
    { value: 'search', label: '搜索功能' },
    { value: 'payment', label: '充值提现' },
    { value: 'referral', label: '推广赚钱' },
    { value: 'vip', label: 'VIP会员' }
  ];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Layout containerSize="xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout containerSize="xl">
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            常见问题
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            这里汇总了用户最常遇到的问题和解答，如果您的问题没有在这里找到答案，请联系我们的客服团队
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map(item => {
              const itemId = (item as any)._id || item.id;
              const isExpanded = expandedItems.includes(itemId);
              return (
                <div key={itemId} className="card">
                  <button
                    onClick={() => toggleExpanded(itemId)}
                    className="w-full text-left flex items-center justify-between p-0"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                没有找到相关问题
              </h3>
              <p className="text-gray-600">
                请尝试使用不同的关键词搜索，或联系客服获取帮助
              </p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            没有找到您要的答案？
          </h3>
          <p className="text-blue-700 mb-4">
            我们的客服团队随时为您提供帮助
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">
              在线客服
            </button>
            <button className="btn-secondary">
              提交工单
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};