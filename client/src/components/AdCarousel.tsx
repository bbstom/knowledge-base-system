import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdCarouselProps {
  images: string[];
  links?: string[];
  interval?: number; // 自动切换间隔（毫秒）
  height?: string; // 高度
  showControls?: boolean; // 是否显示左右箭头
  showIndicators?: boolean; // 是否显示指示器
}

export const AdCarousel: React.FC<AdCarouselProps> = ({
  images,
  links = [],
  interval = 5000,
  height = '400px',
  showControls = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    const link = links[currentIndex];
    if (link) {
      window.open(link, '_blank');
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg ad-carousel-container"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图片容器 */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`广告 ${index + 1}`}
              className={`w-full h-full object-cover ${
                links[index] ? 'cursor-pointer' : ''
              }`}
              onClick={handleImageClick}
            />
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {showControls && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="carousel-control absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0"
            aria-label="上一张"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="carousel-control absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0"
            aria-label="下一张"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* 指示器 */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`跳转到第 ${index + 1} 张`}
            />
          ))}
        </div>
      )}

    </div>
  );
};
