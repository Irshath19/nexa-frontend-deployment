import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

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
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm flex-shrink-0 z-30">
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileOpen}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo — visible on mobile only (desktop sidebar has it) */}
        <Link
          to={ROUTES.DASHBOARD}
          className="md:hidden flex items-center gap-1.5 min-h-[44px] px-1"
          aria-label="NEXA Home"
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">✦</span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">NEXA</span>
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
        <button
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User menu container */}
        <div className="relative ml-0.5" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors min-h-[44px] cursor-pointer"
            aria-label="Open user profile menu"
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden border border-indigo-200/60 dark:border-indigo-800/60">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {user ? getInitials(user.displayName) : 'N'}
                </span>
              )}
            </div>
            <span className="hidden sm:block text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
              {user?.displayName ?? 'User'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 animate-fade-in-scale z-50">
              <div className="px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.displayName ?? 'User'}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>

              <Link
                to={ROUTES.PROFILE}
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <User size={15} className="text-indigo-500" />
                <span>Profile & Identity</span>
              </Link>

              <Link
                to={ROUTES.SETTINGS}
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <Settings size={15} className="text-zinc-500" />
                <span>Settings</span>
              </Link>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              {/* Theme picker */}
              <div className="px-3.5 py-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Appearance</p>
                <div className="flex gap-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTheme(opt.value);
                        applyTheme(opt.value);
                      }}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        theme === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
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
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
