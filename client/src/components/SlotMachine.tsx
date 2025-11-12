import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface Prize {
  name: string;
  type: string;
  value: number;
  icon?: string;
}

interface SlotMachineProps {
  prizes: Prize[];
  result: Prize | null;
  isSpinning: boolean;
  onComplete: () => void;
  onStartDraw?: () => void; // 点击立即抽奖按钮的回调
  showStartButton?: boolean; // 是否显示立即抽奖按钮
}

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  prizes, 
  result, 
  isSpinning,
  onComplete,
  onStartDraw,
  showStartButton = false
}) => {
  const [displayPrizes, setDisplayPrizes] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // 初始化显示的奖品
    if (prizes.length > 0) {
      setDisplayPrizes([prizes[0], prizes[1] || prizes[0], prizes[2] || prizes[0]]);
    }
  }, [prizes]);

  useEffect(() => {
    if (isSpinning && !spinning) {
      startSpin();
    }
  }, [isSpinning]);

  const startSpin = () => {
    setSpinning(true);
    
    // 快速滚动效果
    let count = 0;
    const maxCount = 30;
    
    const interval = setInterval(() => {
      setDisplayPrizes([
        prizes[Math.floor(Math.random() * prizes.length)],
        prizes[Math.floor(Math.random() * prizes.length)],
        prizes[Math.floor(Math.random() * prizes.length)]
      ]);
      
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        
        // 显示最终结果
        if (result) {
          setTimeout(() => {
            setDisplayPrizes([result, result, result]);
            setSpinning(false);
            setTimeout(onComplete, 500);
          }, 300);
        }
      }
    }, 100);
  };

  const getPrizeIcon = (prize: Prize) => {
    if (prize.icon) return prize.icon;
    
    switch (prize.type) {
      case 'points': return '💰';
      case 'vip': return '👑';
      case 'coupon': return '🎫';
      case 'physical': return '🎁';
      case 'thanks':
      case 'none': return '😊';
      default: return '🎁';
    }
  };

  return (
    <div className="relative">
      {/* 老虎机外框 */}
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl p-6 shadow-2xl">
        <div className="bg-gradient-to-b from-red-600 to-red-800 rounded-xl p-4 mb-4">
          <div className="text-center text-yellow-300 font-bold text-2xl mb-2">
            🎰 幸运抽奖 🎰
          </div>
        </div>

        {/* 显示窗口 */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-inner">
          <div className="flex justify-center items-center gap-4">
            {displayPrizes.map((prize, index) => (
              <div
                key={index}
                className={`
                  flex flex-col items-center justify-center
                  w-24 h-32 bg-gradient-to-b from-gray-50 to-gray-100
                  rounded-lg border-4 border-gray-300 shadow-lg
                  transition-all duration-300
                  ${spinning ? 'animate-bounce' : ''}
                `}
              >
                <div className="text-5xl mb-2">
                  {getPrizeIcon(prize)}
                </div>
                <div className="text-xs text-gray-700 font-medium text-center px-1">
                  {prize.name.length > 8 ? prize.name.substring(0, 8) + '...' : prize.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 装饰灯光 */}
        <div className="flex justify-around mb-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                w-3 h-3 rounded-full
                ${spinning 
                  ? 'bg-yellow-300 animate-pulse' 
                  : 'bg-yellow-600'
                }
              `}
              style={{
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* 立即抽奖按钮 */}
        {showStartButton && !spinning && onStartDraw && (
          <button
            onClick={onStartDraw}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            ⚡ 立即抽奖
          </button>
        )}
      </div>

      {/* 闪光效果 */}
      {spinning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Sparkles className="h-16 w-16 text-yellow-300 animate-spin" />
        </div>
      )}
    </div>
  );
};
