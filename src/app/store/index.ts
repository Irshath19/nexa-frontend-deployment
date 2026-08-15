import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { User, EmailAccount, Theme, EmailFilter } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// ── Auth Store ────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'nexa_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ── Context Store — selected account, date, filter ────────────
// Shared between Dashboard and Email page
interface ContextState {
  selectedAccountId: string | null;
  selectedDate: string; // ISO date string: 'yyyy-MM-dd'
  emailFilter: EmailFilter;
  searchQuery: string;

  setSelectedAccountId: (id: string | null) => void;
  setSelectedDate: (date: string) => void;
  setEmailFilter: (filter: EmailFilter) => void;
  setSearchQuery: (q: string) => void;
  resetFilters: () => void;
}

export const useContextStore = create<ContextState>()(
  persist(
    (set) => ({
      selectedAccountId: null,
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      emailFilter: 'all',
      searchQuery: '',

      setSelectedAccountId: (id) => set({ selectedAccountId: id }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setEmailFilter: (filter) => set({ emailFilter: filter }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      resetFilters: () => set({ emailFilter: 'all', searchQuery: '' }),
    }),
    {
      name: STORAGE_KEYS.SELECTED_ACCOUNT,
      partialize: (state) => ({
        selectedAccountId: state.selectedAccountId,
        selectedDate: state.selectedDate,
      }),
    }
  )
);

// ── Theme Store ───────────────────────────────────────────────
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    { name: STORAGE_KEYS.THEME }
  )
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

// ── Sidebar Store ─────────────────────────────────────────────
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobileOpen: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      toggleMobileOpen: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    {
      name: STORAGE_KEYS.SIDEBAR_COLLAPSED,
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);

// ── Email Accounts Store (local cache) ────────────────────────
interface AccountsState {
  accounts: EmailAccount[];
  setAccounts: (accounts: EmailAccount[]) => void;
  addAccount: (account: EmailAccount) => void;
  removeAccount: (id: string) => void;
}

export const useAccountsStore = create<AccountsState>()((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  addAccount: (account) => set((s) => ({ accounts: [...s.accounts, account] })),
  removeAccount: (id) => set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),
}));
