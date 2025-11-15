import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Database, Shield, Zap, Users, Award, ArrowRight, Star, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { useSiteConfig } from '../hooks/useSiteConfig';

export const Home: React.FC = () => {
  const { config } = useSiteConfig();
  const features = [
    {
      icon: Search,
      title: '快速搜索',
      description: '支持多种搜索类型，快速准确地找到您需要的信息',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Database,
      title: '丰富数据库',
      description: '拥有多个高质量数据库，覆盖各种信息类型',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: '安全保障',
      description: '采用先进的加密技术，保护用户隐私和数据安全',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: '高效处理',
      description: '优化的搜索算法，毫秒级响应速度',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Users,
      title: '推荐奖励',
      description: '邀请好友注册使用，获得丰厚佣金奖励',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Award,
      title: 'VIP特权',
      description: 'VIP用户享受更多特权和优惠价格',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  return (
    <Layout>
      {/* Hero Section - 增强版 */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            {/* 标签 */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
              <span>专业 · 安全 · 高效</span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                {config.siteName}
              </span>
            </h1>
            
            {/* 副标题 */}
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {config.siteDescription}
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/search"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center"
              >
                开始搜索
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="group border-2 border-white/50 backdrop-blur-sm bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                免费注册
              </Link>
            </div>

            {/* 信任标识 */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-blue-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>100% 安全保障</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                <span>4.9/5.0 用户评分</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                <span>1M+ 活跃用户</span>
              </div>
            </div>
          </div>
        </div>

        {/* 波浪装饰 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section - 增强版 */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              核心优势
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              为什么选择我们
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              我们提供最专业的信息搜索服务，让您的每一次查询都物超所值
            </p>
          </div>

          {/* 特性卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-white p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* 背景渐变装饰 */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-full -mr-16 -mt-16 transition-opacity duration-500`}></div>
                  
                  {/* 图标 */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.gradient} text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  
                  {/* 内容 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* 装饰线 */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} w-0 group-hover:w-full transition-all duration-500`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats & CTA Section - 合并为一个区域 */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 统计数据部分 */}
          <div className="mb-20">
            {/* 标题 */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                值得信赖的数据
              </h2>
              <p className="text-blue-100 text-lg">
                数字见证我们的专业与实力
              </p>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:from-white/30 hover:to-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    1M+
                  </div>
                  <div className="text-blue-100 font-medium">注册用户</div>
                  <div className="mt-2 text-xs text-blue-200">持续增长中</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:from-white/30 hover:to-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    10M+
                  </div>
                  <div className="text-blue-100 font-medium">搜索次数</div>
                  <div className="mt-2 text-xs text-blue-200">每日更新</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:from-white/30 hover:to-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    50+
                  </div>
                  <div className="text-blue-100 font-medium">数据库</div>
                  <div className="mt-2 text-xs text-blue-200">覆盖全面</div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:from-white/30 hover:to-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                  <div className="text-5xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    99.9%
                  </div>
                  <div className="text-blue-100 font-medium">服务可用性</div>
                  <div className="mt-2 text-xs text-blue-200">稳定可靠</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA部分 */}
          <div className="text-center">
            {/* 标签 */}
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/30">
              <Star className="h-4 w-4 mr-2 text-yellow-300" />
              <span>立即开始您的搜索之旅</span>
            </div>

            {/* 标题 */}
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              准备开始了吗？
            </h2>
            
            {/* 副标题 */}
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              立即注册，体验专业的信息搜索服务
              <br />
              <span className="text-lg">新用户注册即送积分，更有推荐奖励等你来拿</span>
            </p>

            {/* 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="group bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center text-lg"
              >
                免费注册
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/search"
                className="group border-2 border-white/50 backdrop-blur-sm bg-white/10 text-white px-10 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                先去看看
              </Link>
            </div>

            {/* 特性列表 */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>无需信用卡</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>30秒快速注册</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>新人专属福利</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};