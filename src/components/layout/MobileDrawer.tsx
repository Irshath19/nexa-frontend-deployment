import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  MessageSquare,
  Mail,
  Settings,
  Briefcase,
  User,
  LogOut,
  Brain,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { cn, getInitials } from '@/utils';
import { ROUTES } from '@/constants';
import { useSidebarStore, useAuthStore } from '@/app/store';
import { authApi } from '@/services/api/auth';

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: ROUTES.DASHBOARD },
  { label: 'NEXA Chat', icon: <MessageSquare size={18} />, href: ROUTES.CHAT },
  { label: 'Emails', icon: <Mail size={18} />, href: ROUTES.EMAILS },
  { label: 'Jobs', icon: <Briefcase size={18} />, href: ROUTES.JOBS },
  { label: 'Profile', icon: <User size={18} />, href: ROUTES.PROFILE },
  { label: 'Knowledge', icon: <Brain size={18} />, href: '/knowledge', comingSoon: true },
  { label: 'Expenses', icon: <DollarSign size={18} />, href: '/expenses', comingSoon: true },
  { label: 'Calculator', icon: <Calculator size={18} />, href: '/calculator', comingSoon: true },
];

export function MobileDrawer() {
  const { isMobileOpen, closeMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    try {
      closeMobile();
      await authApi.logout();
    } catch {
      // Ignore logout error
    } finally {
      logout();
      window.location.href = ROUTES.LOGIN;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200',
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[290px] max-w-[85vw] bg-white dark:bg-zinc-900',
          'border-r border-zinc-200 dark:border-zinc-800 z-50',
          'flex flex-col md:hidden shadow-2xl',
          'transition-transform duration-250 ease-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-2 min-h-[44px]"
            onClick={closeMobile}
          >
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">✦</span>
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">NEXA</span>
          </Link>
          <button
            onClick={closeMobile}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;

              if (item.comingSoon) {
                return (
                  <li key={item.href}>
                    <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-400 dark:text-zinc-500 text-xs font-medium opacity-60 select-none">
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
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
                    onClick={closeMobile}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px]',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs border border-indigo-200/50 dark:border-indigo-800/50'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                    )}
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

        {/* User profile & Settings footer */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
          {/* User Card */}
          <Link
            to={ROUTES.PROFILE}
            onClick={closeMobile}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-indigo-200/60 dark:border-indigo-800/60">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {user ? getInitials(user.displayName) : 'N'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.displayName ?? 'User'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <Link
              to={ROUTES.SETTINGS}
              onClick={closeMobile}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 min-h-[40px]"
            >
              <Settings size={14} className="text-zinc-500" />
              <span>Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 min-h-[40px] cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
