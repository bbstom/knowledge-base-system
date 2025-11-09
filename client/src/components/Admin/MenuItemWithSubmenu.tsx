import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../types/menu';
import { SubmenuItem } from './SubmenuItem';

interface MenuItemWithSubmenuProps {
  /** 菜单项数据 */
  item: MenuItem;
  /** 是否展开 */
  isExpanded: boolean;
  /** 切换展开/收起 */
  onToggle: () => void;
  /** 当前路由路径 */
  currentPath: string;
  /** 导航回调（移动端关闭侧边栏） */
  onNavigate?: () => void;
}

export const MenuItemWithSubmenu: React.FC<MenuItemWithSubmenuProps> = ({
  item,
  isExpanded,
  onToggle,
  currentPath,
  onNavigate
}) => {
  const Icon = item.icon;
  
  // 检查是否有任何子菜单项被激活
  const hasActiveSubmenu = item.submenu?.some(sub => 
    currentPath.startsWith(sub.path)
  );

  return (
    <div>
      {/* 父级菜单头 */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${item.title} 菜单，${isExpanded ? '已展开' : '已收起'}`}
        aria-controls={`submenu-${item.title}`}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
          transition-colors
          ${hasActiveSubmenu
            ? 'bg-blue-600 text-white'
            : isExpanded
            ? 'bg-gray-50 text-gray-900'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
          }
        `}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.title}</span>
        <ChevronRight 
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* 子菜单列表 */}
      <AnimatePresence initial={false}>
        {isExpanded && item.submenu && (
          <motion.div
            id={`submenu-${item.title}`}
            role="menu"
            aria-label={`${item.title} 子菜单`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.2, ease: 'easeInOut' },
              opacity: { duration: 0.15, ease: 'easeInOut' }
            }}
            className="overflow-hidden"
          >
            <div className="ml-5 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
              {item.submenu.map(subItem => (
                <SubmenuItem
                  key={subItem.path}
                  {...subItem}
                  isActive={currentPath.startsWith(subItem.path)}
                  onClick={onNavigate}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
