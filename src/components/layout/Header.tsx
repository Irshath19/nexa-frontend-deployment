import { Link } from 'react-router-dom';
import { Bell, Moon, Sun, Monitor, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuthStore, useThemeStore, useSidebarStore, applyTheme } from '@/app/store';
import { authApi } from '@/services/api/auth';
import { getInitials } from '@/utils';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';
import type { Theme } from '@/types';

const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun size={14} />, label: 'Light' },
  { value: 'dark', icon: <Moon size={14} />, label: 'Dark' },
  { value: 'system', icon: <Monitor size={14} />, label: 'System' },
];

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { toggleMobileOpen } = useSidebarStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      logout();
      window.location.href = ROUTES.LOGIN;
    }
  };

  const cycleTheme = () => {
    const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' };
    const newTheme = next[theme];
    setTheme(newTheme);
    applyTheme(newTheme);
    toast.success(`Theme: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`);
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileOpen}
          className="md:hidden btn-ghost p-1.5"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Logo — visible on mobile only (desktop sidebar has it) */}
        <Link
          to={ROUTES.DASHBOARD}
          className="md:hidden flex items-center gap-1.5"
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">✦</span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">NEXA</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="btn-ghost p-2"
          aria-label={`Toggle theme (currently ${theme})`}
          title={`Theme: ${theme}`}
        >
          {theme === 'dark' ? (
            <Moon size={16} />
          ) : theme === 'light' ? (
            <Sun size={16} />
          ) : (
            <Monitor size={16} />
          )}
        </button>

        {/* Notifications */}
        <button className="btn-ghost p-2 relative" aria-label="Notifications">
          <Bell size={16} />
          {/* Unread indicator */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative group ml-1">
          <button
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="User menu"
            aria-haspopup="true"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  {user ? getInitials(user.displayName) : 'N'}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
              {user?.displayName ?? 'User'}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <User size={14} /> Profile
            </Link>

            <Link
              to={ROUTES.SETTINGS}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Settings size={14} /> Settings
            </Link>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Theme picker */}
            <div className="px-3 py-1.5">
              <p className="text-[10px] text-label mb-1.5">APPEARANCE</p>
              <div className="flex gap-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setTheme(opt.value); applyTheme(opt.value); }}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded text-xs transition-colors ${
                      theme === opt.value
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-[10px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
