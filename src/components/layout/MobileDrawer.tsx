import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, MessageSquare, Mail, Settings, Briefcase, Brain, DollarSign, Calculator } from 'lucide-react';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useSidebarStore } from '@/app/store';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: ROUTES.DASHBOARD },
  { label: 'NEXA Chat', icon: <MessageSquare size={18} />, href: ROUTES.CHAT },
  { label: 'Emails', icon: <Mail size={18} />, href: ROUTES.EMAILS },
  { label: 'Jobs', icon: <Briefcase size={18} />, href: ROUTES.JOBS },
  { label: 'Knowledge', icon: <Brain size={18} />, href: '/knowledge', comingSoon: true },
  { label: 'Expenses', icon: <DollarSign size={18} />, href: '/expenses', comingSoon: true },
  { label: 'Calculator', icon: <Calculator size={18} />, href: '/calculator', comingSoon: true },
];

export function MobileDrawer() {
  const { isMobileOpen, closeMobile } = useSidebarStore();
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  // Trap scroll when open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-200',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-72 bg-white dark:bg-zinc-900',
          'border-r border-zinc-200 dark:border-zinc-800 z-50',
          'flex flex-col md:hidden',
          'transition-transform duration-250 ease-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2" onClick={closeMobile}>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">✦</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">NEXA</span>
          </Link>
          <button
            onClick={closeMobile}
            className="btn-ghost p-1.5"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              if (item.comingSoon) {
                return (
                  <li key={item.href}>
                    <div className="nav-item nav-item-disabled">
                      <span className="text-zinc-400">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                        Soon
                      </span>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn('nav-item', isActive && 'nav-item-active')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <Link to={ROUTES.SETTINGS} className="nav-item">
            <Settings size={18} className="text-zinc-500" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
