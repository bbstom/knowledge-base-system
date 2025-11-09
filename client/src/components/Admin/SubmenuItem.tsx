import React from 'react';
import { Link } from 'react-router-dom';
import { SubMenuItem } from '../../types/menu';

interface SubmenuItemProps extends SubMenuItem {
  /** 是否为当前激活的菜单项 */
  isActive: boolean;
  /** 点击回调（用于移动端关闭侧边栏） */
  onClick?: () => void;
}

export const SubmenuItem: React.FC<SubmenuItemProps> = ({
  title,
  path,
  description,
  isActive,
  onClick
}) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      className={`
        flex flex-col px-3 py-2 rounded-md text-sm
        transition-colors
        ${isActive
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
      `}
    >
      <span className="font-medium">{title}</span>
      {description && (
        <span className="text-xs text-gray-500 mt-0.5">
          {description}
        </span>
      )}
    </Link>
  );
};
