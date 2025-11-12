/**
 * 测试抽奖概率是否正确
 */

// 模拟抽奖算法
function drawPrize(prizes) {
  const availablePrizes = prizes.filter(p => 
    p.quantity === -1 || p.quantity > 0
  );

  if (availablePrizes.length === 0) {
    return prizes.find(p => p.type === 'thanks') || null;
  }

  // 计算总概率
  const totalProbability = availablePrizes.reduce(
    (sum, p) => sum + p.probability, 0
  );

  // 生成随机数 0 到 totalProbability
  const random = Math.random() * totalProbability;

  // 根据概率区间确定中奖奖品
  let cumulative = 0;
  for (const prize of availablePrizes) {
    cumulative += prize.probability;
    if (random < cumulative) {
      return prize;
    }
  }

  return availablePrizes[availablePrizes.length - 1];
}

// 测试奖品配置
const prizes = [
  { name: '100积分', type: 'points', value: 100, probability: 0.01, quantity: -1 },
  { name: '50积分', type: 'points', value: 50, probability: 0.1, quantity: -1 },
  { name: '10积分', type: 'points', value: 10, probability: 5, quantity: -1 },
  { name: '5积分', type: 'points', value: 5, probability: 10, quantity: -1 },
  { name: '谢谢参与', type: 'thanks', value: 0, probability: 84.89, quantity: -1 }
];

console.log('=== 抽奖概率测试 ===\n');
console.log('奖品配置：');
prizes.forEach(p => {
  console.log(`  ${p.name}: ${p.probability}%`);
});

const totalProb = prizes.reduce((sum, p) => sum + p.probability, 0);
console.log(`\n总概率: ${totalProb}%\n`);

// 执行10000次抽奖测试
const testCount = 10000;
const results = {};

console.log(`执行 ${testCount} 次抽奖测试...\n`);

for (let i = 0; i < testCount; i++) {
  const prize = drawPrize(prizes);
  if (prize) {
    results[prize.name] = (results[prize.name] || 0) + 1;
  }
}

console.log('=== 测试结果 ===\n');
console.log('奖品名称          | 设定概率 | 实际次数 | 实际概率 | 误差');
console.log('------------------|----------|----------|----------|------');

prizes.forEach(p => {
  const count = results[p.name] || 0;
  const actualProb = (count / testCount * 100).toFixed(2);
  const error = (actualProb - p.probability).toFixed(2);
  const errorPercent = p.probability > 0 ? ((Math.abs(error) / p.probability) * 100).toFixed(1) : '0.0';
  
  console.log(
    `${p.name.padEnd(18)}| ${p.probability.toString().padEnd(8)} | ${count.toString().padEnd(8)} | ${actualProb.padEnd(8)} | ${error > 0 ? '+' : ''}${error} (${errorPercent}%)`
  );
});

console.log('\n=== 结论 ===');
console.log('如果实际概率与设定概率接近（误差在10%以内），说明算法正确。');
console.log('如果误差较大，说明算法有问题。');
