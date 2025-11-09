/**
 * 邀请追踪系统性能监控
 * 
 * 运行方式：
 * node server/scripts/monitorReferralPerformance.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const ReferralVisit = require('../models/ReferralVisit');
const User = require('../models/User');

async function monitorPerformance() {
  try {
    // 连接数据库
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/knowbase';
    await mongoose.connect(dbUri);
    console.log('✅ 数据库连接成功\n');

    console.log('📊 邀请追踪系统性能监控报告');
    console.log('='.repeat(70));
    console.log(`生成时间: ${new Date().toLocaleString('zh-CN')}\n`);

    // 1. 基础统计
    console.log('📈 基础统计:');
    console.log('-'.repeat(70));
    
    const totalVisits = await ReferralVisit.countDocuments();
    const activeVisits = await ReferralVisit.countDocuments({
      converted: false,
      expiresAt: { $gt: new Date() }
    });
    const convertedVisits = await ReferralVisit.countDocuments({ converted: true });
    const expiredVisits = await ReferralVisit.countDocuments({
      converted: false,
      expiresAt: { $lte: new Date() }
    });

    console.log(`总访问记录: ${totalVisits}`);
    console.log(`活跃记录 (未转化且未过期): ${activeVisits}`);
    console.log(`已转化记录: ${convertedVisits}`);
    console.log(`已过期记录: ${expiredVisits}`);
    
    const conversionRate = totalVisits > 0 
      ? ((convertedVisits / totalVisits) * 100).toFixed(2) 
      : '0.00';
    console.log(`转化率: ${conversionRate}%\n`);

    // 2. 追踪成功率
    console.log('✅ 追踪成功率:');
    console.log('-'.repeat(70));
    
    // 按邀请码统计
    const topReferrers = await ReferralVisit.aggregate([
      {
        $group: {
          _id: '$referralCode',
          totalVisits: { $sum: 1 },
          conversions: {
            $sum: { $cond: ['$converted', 1, 0] }
          },
          avgVisitCount: { $avg: '$visitCount' }
        }
      },
      {
        $project: {
          referralCode: '$_id',
          totalVisits: 1,
          conversions: 1,
          avgVisitCount: { $round: ['$avgVisitCount', 2] },
          conversionRate: {
            $multiply: [
              { $divide: ['$conversions', '$totalVisits'] },
              100
            ]
          }
        }
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 10 }
    ]);

    console.log('Top 10 邀请码:');
    topReferrers.forEach((ref, index) => {
      console.log(`${index + 1}. ${ref.referralCode}`);
      console.log(`   访问: ${ref.totalVisits}, 转化: ${ref.conversions}, 转化率: ${ref.conversionRate.toFixed(2)}%`);
      console.log(`   平均访问次数: ${ref.avgVisitCount}`);
    });
    console.log();

    // 3. 访问模式分析
    console.log('🔍 访问模式分析:');
    console.log('-'.repeat(70));
    
    // 单次访问 vs 多次访问
    const singleVisit = await ReferralVisit.countDocuments({ visitCount: 1 });
    const multipleVisits = await ReferralVisit.countDocuments({ visitCount: { $gt: 1 } });
    
    console.log(`单次访问: ${singleVisit} (${((singleVisit / totalVisits) * 100).toFixed(2)}%)`);
    console.log(`多次访问: ${multipleVisits} (${((multipleVisits / totalVisits) * 100).toFixed(2)}%)`);
    
    // 平均访问次数
    const avgVisitResult = await ReferralVisit.aggregate([
      {
        $group: {
          _id: null,
          avgVisitCount: { $avg: '$visitCount' },
          maxVisitCount: { $max: '$visitCount' }
        }
      }
    ]);
    
    if (avgVisitResult.length > 0) {
      console.log(`平均访问次数: ${avgVisitResult[0].avgVisitCount.toFixed(2)}`);
      console.log(`最大访问次数: ${avgVisitResult[0].maxVisitCount}`);
    }
    console.log();

    // 4. 时间分析
    console.log('⏱️  时间分析:');
    console.log('-'.repeat(70));
    
    // 最近24小时
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visitsLast24h = await ReferralVisit.countDocuments({
      createdAt: { $gte: last24h }
    });
    const conversionsLast24h = await ReferralVisit.countDocuments({
      converted: true,
      updatedAt: { $gte: last24h }
    });
    
    console.log(`最近24小时访问: ${visitsLast24h}`);
    console.log(`最近24小时转化: ${conversionsLast24h}`);
    
    // 最近7天
    const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const visitsLast7d = await ReferralVisit.countDocuments({
      createdAt: { $gte: last7d }
    });
    const conversionsLast7d = await ReferralVisit.countDocuments({
      converted: true,
      updatedAt: { $gte: last7d }
    });
    
    console.log(`最近7天访问: ${visitsLast7d}`);
    console.log(`最近7天转化: ${conversionsLast7d}`);
    console.log();

    // 5. 转化时间分析
    console.log('⏳ 转化时间分析:');
    console.log('-'.repeat(70));
    
    const convertedWithTime = await ReferralVisit.find({
      converted: true,
      convertedUserId: { $exists: true }
    }).select('firstVisit updatedAt').lean();
    
    if (convertedWithTime.length > 0) {
      const conversionTimes = convertedWithTime.map(visit => {
        const firstVisit = new Date(visit.firstVisit);
        const converted = new Date(visit.updatedAt);
        return (converted - firstVisit) / (1000 * 60 * 60); // 小时
      });
      
      const avgConversionTime = conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length;
      const minConversionTime = Math.min(...conversionTimes);
      const maxConversionTime = Math.max(...conversionTimes);
      
      console.log(`平均转化时间: ${avgConversionTime.toFixed(2)} 小时`);
      console.log(`最快转化时间: ${minConversionTime.toFixed(2)} 小时`);
      console.log(`最慢转化时间: ${maxConversionTime.toFixed(2)} 小时`);
      
      // 转化时间分布
      const immediate = conversionTimes.filter(t => t < 1).length;
      const within24h = conversionTimes.filter(t => t >= 1 && t < 24).length;
      const within7d = conversionTimes.filter(t => t >= 24 && t < 168).length;
      const over7d = conversionTimes.filter(t => t >= 168).length;
      
      console.log('\n转化时间分布:');
      console.log(`  1小时内: ${immediate} (${((immediate / conversionTimes.length) * 100).toFixed(2)}%)`);
      console.log(`  1-24小时: ${within24h} (${((within24h / conversionTimes.length) * 100).toFixed(2)}%)`);
      console.log(`  1-7天: ${within7d} (${((within7d / conversionTimes.length) * 100).toFixed(2)}%)`);
      console.log(`  7天以上: ${over7d} (${((over7d / conversionTimes.length) * 100).toFixed(2)}%)`);
    } else {
      console.log('暂无转化数据');
    }
    console.log();

    // 6. 数据质量检查
    console.log('🔧 数据质量检查:');
    console.log('-'.repeat(70));
    
    // 检查无效邀请码
    const invalidCodes = await ReferralVisit.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'referralCode',
          foreignField: 'referralCode',
          as: 'user'
        }
      },
      {
        $match: {
          user: { $size: 0 }
        }
      },
      {
        $group: {
          _id: '$referralCode',
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (invalidCodes.length > 0) {
      console.log(`⚠️  发现 ${invalidCodes.length} 个无效邀请码:`);
      invalidCodes.slice(0, 5).forEach(code => {
        console.log(`   ${code._id}: ${code.count} 条记录`);
      });
    } else {
      console.log('✅ 所有邀请码都有效');
    }
    
    // 检查重复指纹
    const duplicateFingerprints = await ReferralVisit.aggregate([
      {
        $group: {
          _id: '$fingerprint',
          count: { $sum: 1 },
          codes: { $addToSet: '$referralCode' }
        }
      },
      {
        $match: {
          count: { $gt: 5 },
          codes: { $size: { $gt: 1 } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    if (duplicateFingerprints.length > 0) {
      console.log(`\n⚠️  发现 ${duplicateFingerprints.length} 个高频设备指纹:`);
      duplicateFingerprints.forEach(fp => {
        console.log(`   ${fp._id.substring(0, 20)}...: ${fp.count} 条记录, ${fp.codes.length} 个邀请码`);
      });
    } else {
      console.log('\n✅ 设备指纹分布正常');
    }
    console.log();

    // 7. 性能建议
    console.log('💡 性能建议:');
    console.log('-'.repeat(70));
    
    const suggestions = [];
    
    if (expiredVisits > totalVisits * 0.3) {
      suggestions.push('⚠️  过期记录较多，TTL索引可能未生效，建议检查');
    }
    
    if (conversionRate < 5) {
      suggestions.push('⚠️  转化率较低，建议优化邀请流程或检查追踪准确性');
    }
    
    if (activeVisits > 10000) {
      suggestions.push('💡 活跃记录较多，建议定期清理或调整过期时间');
    }
    
    if (invalidCodes.length > 0) {
      suggestions.push('⚠️  存在无效邀请码，建议清理或添加验证');
    }
    
    if (suggestions.length > 0) {
      suggestions.forEach(s => console.log(s));
    } else {
      console.log('✅ 系统运行良好，无需特别优化');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 监控报告生成完成\n');

  } catch (error) {
    console.error('❌ 监控失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 数据库连接已关闭');
  }
}

// 运行监控
monitorPerformance();
