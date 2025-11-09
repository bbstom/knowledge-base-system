import React from 'react';
import { cn } from '../lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  noPadding?: boolean;
}

/**
 * 容器组件 - 控制内容最大宽度，避免全屏铺开
 * 
 * @param size - 容器大小
 *   - sm: 672px (表单、登录页)
 *   - md: 896px (文章、详情页)
 *   - lg: 1152px (列表、仪表盘) - 默认
 *   - xl: 1280px (管理后台)
 *   - full: 全宽
 * @param noPadding - 是否移除内边距
 */
export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'lg',
  className,
  noPadding = false
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',    // 672px
    md: 'max-w-4xl',    // 896px
    lg: 'max-w-6xl',    // 1152px
    xl: 'max-w-7xl',    // 1280px
    full: 'w-full'
  };

  return (
    <div 
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        !noPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};
