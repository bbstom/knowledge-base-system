import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Database, Shield, Zap, Users, Award } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';

export const HomeSimple: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: '快速搜索',
      description: '支持多种搜索类型，快速准确地找到您需要的信息'
    },
    {
      icon: Database,
      title: '丰富数据库',
      description: '拥有多个高质量数据库，覆盖各种信息类型'
    },
    {
      icon: Shield,
      title: '安全保障',
      description: '采用先进的加密技术，保护用户隐私和数据安全'
    },
    {
      icon: Zap,
      title: '高效处理',
      description: '优化的搜索算法，毫秒级响应速度'
    },
    {
      icon: Users,
      title: '推荐奖励',
      description: '邀请好友注册使用，获得丰厚佣金奖励'
    },
    {
      icon: Award,
      title: 'VIP特权',
      description: 'VIP用户享受更多特权和优惠价格'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              专业信息搜索平台
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              快速、安全、准确的数据查询服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                开始搜索
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                免费注册
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
            <p className="text-xl text-gray-600">
              我们提供最专业的信息搜索服务
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
              <div className="text-gray-600">注册用户</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10M+</div>
              <div className="text-gray-600">搜索次数</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">数据库</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-gray-600">服务可用性</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            准备开始了吗？
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            立即注册，体验专业的信息搜索服务
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            免费注册
          </Link>
        </div>
      </section>
    </Layout>
  );
};
