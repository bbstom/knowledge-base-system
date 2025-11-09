/**
 * 管理后台菜单类型定义
 */

import { LucideIcon } from 'lucide-react';

/**
 * 子菜单项
 */
export interface SubMenuItem {
  /** 菜单标题 */
  title: string;
  /** 路由路径 */
  path: string;
  /** 可选的描述文本 */
  description?: string;
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单标题 */
  title: string;
  /** 菜单图标 */
  icon: LucideIcon;
  /** 路由路径（普通菜单项有path，带子菜单的没有） */
  path?: string;
  /** 是否精确匹配路由 */
  exact?: boolean;
  /** 子菜单列表（有子菜单则没有path） */
  submenu?: SubMenuItem[];
}

/**
 * 菜单状态
 */
export interface MenuState {
  /** 展开的菜单标题列表 */
  expandedMenus: string[];
}
