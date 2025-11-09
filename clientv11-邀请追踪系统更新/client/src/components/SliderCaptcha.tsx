import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';

interface SliderCaptchaProps {
  onSuccess: (token: string) => void;
  onFail?: () => void;
}

export const SliderCaptcha: React.FC<SliderCaptchaProps> = ({ onSuccess, onFail }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [puzzleX, setPuzzleX] = useState(0);
  const [puzzleY, setPuzzleY] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);

  const TOLERANCE = 5;
  const MAX_WIDTH = 300;
  const PUZZLE_SIZE = 50;

  useEffect(() => {
    generatePuzzle();
  }, []);

  const generatePuzzle = () => {
    // 生成随机拼图位置
    const x = Math.floor(150 + Math.random() * 100); // 150-250px
    const y = Math.floor(20 + Math.random() * 80);   // 20-100px
    setPuzzleX(x);
    setPuzzleY(y);
    
    // 生成随机背景（使用渐变模拟图片）
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    setBackgroundImage(colors[Math.floor(Math.random() * colors.length)]);
  };

  const handleStart = (clientX: number) => {
    if (status !== 'idle') return;
    setIsDragging(true);
    startXRef.current = clientX;
    startTimeRef.current = Date.now();
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;

    const deltaX = clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(MAX_WIDTH - 50, deltaX));
    setPosition(newPosition);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const timeTaken = Date.now() - startTimeRef.current;
    const distance = Math.abs(position - puzzleX);

    if (
      distance <= TOLERANCE &&
      timeTaken > 300 &&
      timeTaken < 10000
    ) {
      setStatus('success');
      const token = btoa(JSON.stringify({
        position: position,
        target: puzzleX,
        time: timeTaken,
        timestamp: Date.now()
      }));
      setTimeout(() => onSuccess(token), 500);
    } else {
      setStatus('fail');
      setTimeout(() => {
        reset();
        onFail?.();
      }, 1000);
    }
  };

  const reset = () => {
    setPosition(0);
    setStatus('idle');
    generatePuzzle();
  };

  // 鼠标事件
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, position]);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'fail':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-white" />;
      case 'fail':
        return <X className="h-5 w-5 text-white" />;
      default:
        return <span className="text-white text-sm">→</span>;
    }
  };

  return (
    <div className="w-full">
      {/* 拼图验证区域 */}
      <div className="relative mb-4 h-48 rounded-lg overflow-hidden border-2 border-gray-300 shadow-lg">
        {/* 背景图 */}
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: backgroundImage }}
        >
          {/* 添加一些装饰元素 */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 30 + 10 + 'px',
                  height: Math.random() * 30 + 10 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
              />
            ))}
          </div>
        </div>

        {/* 拼图缺口（目标位置） */}
        {status === 'idle' && (
          <div
            className="absolute bg-black bg-opacity-40 backdrop-blur-sm"
            style={{
              left: `${puzzleX}px`,
              top: `${puzzleY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {/* 移动的拼图块 */}
        {status === 'idle' && (
          <div
            className="absolute transition-all"
            style={{
              left: `${position}px`,
              top: `${puzzleY}px`,
              width: `${PUZZLE_SIZE}px`,
              height: `${PUZZLE_SIZE}px`,
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
              backgroundImage: backgroundImage,
              backgroundPosition: `-${puzzleX}px -${puzzleY}px`,
              backgroundSize: '300px 192px',
              filter: 'brightness(1.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
        )}

        {/* 状态提示 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {status === 'success' && (
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
              <Check className="h-6 w-6" />
              <span className="font-bold">验证成功！</span>
            </div>
          )}
          {status === 'fail' && (
            <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-shake">
              <X className="h-6 w-6" />
              <span className="font-bold">验证失败，请重试</span>
            </div>
          )}
        </div>
      </div>

      {/* 滑块轨道 */}
      <div className="relative flex items-center">
        <div
          ref={trackRef}
          className="relative h-14 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full overflow-hidden border-2 border-gray-300 shadow-inner"
          style={{ width: `${MAX_WIDTH}px` }}
        >
          {/* 进度条 */}
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${getStatusColor()}`}
            style={{ 
              width: `${position + 56}px`,
              backgroundImage: status === 'success' 
                ? 'linear-gradient(90deg, #10b981, #059669)' 
                : status === 'fail'
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : 'linear-gradient(90deg, #3b82f6, #2563eb)',
              opacity: 0.2
            }}
          />

          {/* 动画箭头 */}
          {status === 'idle' && !isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex space-x-1 animate-pulse">
                <span className="text-gray-400">→</span>
                <span className="text-gray-400">→</span>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          )}

          {/* 提示文字 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`text-sm font-medium transition-opacity ${isDragging || status !== 'idle' ? 'opacity-0' : 'opacity-100'}`}>
              <span className="text-gray-600">拖动滑块完成拼图</span>
            </span>
          </div>

          {/* 滑块 */}
          <div
            ref={sliderRef}
            className={`absolute top-1 bottom-1 w-14 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
              isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
            } ${status !== 'idle' ? 'cursor-not-allowed' : ''}`}
            style={{ 
              left: `${position}px`,
              backgroundImage: status === 'success' 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : status === 'fail'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="text-white">
              {getStatusIcon()}
            </div>
          </div>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={reset}
          className="ml-3 p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg"
          title="刷新验证码"
        >
          <RefreshCw className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* 提示信息 */}
      <div className="mt-3 text-center">
        {status === 'idle' && (
          <p className="text-sm text-gray-600">
            <span className="inline-flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              拖动滑块将拼图放入缺口
            </span>
          </p>
        )}
        {status === 'success' && (
          <p className="text-sm text-green-600 font-medium">
            ✓ 验证通过，正在处理...
          </p>
        )}
        {status === 'fail' && (
          <p className="text-sm text-red-600 font-medium">
            ✗ 验证失败，请重新尝试
          </p>
        )}
      </div>
    </div>
  );
};
