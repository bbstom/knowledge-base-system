import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface Prize {
  name: string;
  type: string;
  value: number;
  probability: number;
  color?: string;
}

interface LotteryWheelProps {
  prizes: Prize[];
  onComplete: (prize: Prize) => void;
  isSpinning: boolean;
  targetPrize?: Prize | null; // 指定的中奖奖品
}

export const LotteryWheel: React.FC<LotteryWheelProps> = ({ prizes, onComplete, isSpinning, targetPrize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  // 为每个奖品分配颜色
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];

  const prizesWithColors = prizes.map((prize, index) => ({
    ...prize,
    color: colors[index % colors.length]
  }));

  useEffect(() => {
    drawWheel();
  }, [rotation]);

  useEffect(() => {
    if (isSpinning && !isAnimating) {
      startSpin();
    }
  }, [isSpinning]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // 平均分配扇区，不考虑概率
    const sliceAngle = (2 * Math.PI) / prizesWithColors.length;
    let currentAngle = 0;

    prizesWithColors.forEach((prize, index) => {
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color || colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 绘制文字
      ctx.save();
      ctx.rotate(currentAngle + sliceAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.name, radius * 0.65, 5);
      ctx.restore();

      currentAngle += sliceAngle;
    });

    ctx.restore();

    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制指针
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(-Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(radius + 5, 0);
    ctx.lineTo(radius - 15, -15);
    ctx.lineTo(radius - 15, 15);
    ctx.closePath();
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const startSpin = () => {
    setIsAnimating(true);
    
    // 选择奖品：如果指定了targetPrize则使用它，否则随机选择
    let selectedPrize: Prize & { color?: string };
    
    if (targetPrize) {
      // 使用指定的奖品
      const foundPrize = prizesWithColors.find(p => p.name === targetPrize.name && p.type === targetPrize.type);
      selectedPrize = foundPrize || prizesWithColors[0] as Prize & { color: string };
    } else {
      // 随机选择一个奖品
      const random = Math.random() * 100;
      let cumulative = 0;
      selectedPrize = prizesWithColors[0];
      
      for (const prize of prizesWithColors) {
        cumulative += prize.probability;
        if (random <= cumulative) {
          selectedPrize = prize;
          break;
        }
      }
    }

    // 计算目标角度 - 平均分配扇区
    const prizeIndex = prizesWithColors.findIndex(p => 
      p.name === selectedPrize.name && p.type === selectedPrize.type
    );
    const sliceAngle = 360 / prizesWithColors.length;
    
    // 计算该奖品扇区的中心角度
    // 第一个扇区从0度开始，每个扇区的中心是 index * sliceAngle + sliceAngle / 2
    const prizeCenterAngle = prizeIndex * sliceAngle + sliceAngle / 2;
    
    // 指针在顶部（90度位置），我们需要让奖品的中心旋转到90度位置
    // 所以目标旋转角度 = 90 - prizeCenterAngle
    // 为了让转盘顺时针旋转，我们需要计算正确的旋转角度
    let targetAngle = 90 - prizeCenterAngle;
    
    // 确保角度为正数
    if (targetAngle < 0) {
      targetAngle += 360;
    }
    
    // 多转几圈 + 目标角度
    const finalRotation = 360 * 5 + targetAngle;
    
    // 动画参数
    const duration = 4000; // 4秒
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 缓动函数 (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentRotation = startRotation + finalRotation * easeOut;
      setRotation(currentRotation % 360);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setTimeout(() => {
          onComplete(selectedPrize as Prize);
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="mx-auto"
      />
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Sparkles className="h-12 w-12 text-yellow-400 animate-pulse" />
        </div>
      )}
    </div>
  );
};
