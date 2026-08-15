import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Briefcase,
  Brain,
  DollarSign,
  Calculator,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useSidebarStore } from '@/app/store';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  comingSoon?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: ROUTES.DASHBOARD },
  { label: 'NEXA Chat', icon: <MessageSquare size={18} />, href: ROUTES.CHAT },
  { label: 'Emails', icon: <Mail size={18} />, href: ROUTES.EMAILS },
  { label: 'Jobs', icon: <Briefcase size={18} />, href: ROUTES.JOBS },
  { label: 'Knowledge', icon: <Brain size={18} />, href: '/knowledge', comingSoon: true },
  { label: 'Expenses', icon: <DollarSign size={18} />, href: '/expenses', comingSoon: true },
  { label: 'Calculator', icon: <Calculator size={18} />, href: '/calculator', comingSoon: true },
];

export function Sidebar() {
  const { isCollapsed, toggleCollapsed, closeMobile } = useSidebarStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-white dark:bg-zinc-900',
        'border-r border-zinc-200 dark:border-zinc-800',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        isCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-14 px-4 border-b border-zinc-100 dark:border-zinc-800',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2 group">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl leading-none">
              ✦
            </span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              NEXA
            </span>
          </Link>
        )}

        {isCollapsed && (
          <Link to={ROUTES.DASHBOARD} className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            ✦
          </Link>
        )}

        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="btn-ghost p-1.5 rounded-md ml-auto"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;

            if (item.comingSoon) {
              return (
                <li key={item.href}>
                  <div
                    className={cn(
                      'nav-item nav-item-disabled group relative',
                      isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0 text-zinc-400">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full ml-auto">
                          Soon
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label} · Coming Soon
                        <Lock size={10} className="inline ml-1" />
                      </div>
                    )}
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={closeMobile}
                  className={cn(
                    'nav-item group relative',
                    isActive && 'nav-item-active',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={cn(
                    'flex-shrink-0',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'
                  )}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-0.5">
        <Link
          to={ROUTES.SETTINGS}
          className={cn(
            'nav-item group relative',
            location.pathname === ROUTES.SETTINGS && 'nav-item-active',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
          {!isCollapsed && <span className="flex-1">Settings</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              Settings
            </div>
          )}
        </Link>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="nav-item w-full justify-center px-0"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} className="text-zinc-500" />
          </button>
        )}
      </div>
    </aside>
  );
}
