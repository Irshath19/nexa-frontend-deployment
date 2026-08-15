// ============================================================
// NEXA — App Constants
// ============================================================

// ── Route Paths ───────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  EMAILS: '/emails',
  JOBS: '/jobs',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  // OAuth callbacks
  OAUTH_CALLBACK_GMAIL: '/oauth/gmail/callback',
  OAUTH_CALLBACK_OUTLOOK: '/oauth/outlook/callback',
} as const;

// ── TanStack Query Keys ───────────────────────────────────────
export const QUERY_KEYS = {
  // Auth
  ME: ['auth', 'me'] as const,

  // Email accounts
  EMAIL_ACCOUNTS: ['email-accounts'] as const,

  // Emails
  EMAILS: (params: Record<string, unknown>) => ['emails', params] as const,
  EMAIL: (id: string) => ['email', id] as const,
  EMAIL_STATS: (accountId: string, date: string) => ['email-stats', accountId, date] as const,
  EMAIL_SEARCH: (accountId: string, q: string) => ['email-search', accountId, q] as const,

  // Dashboard
  DASHBOARD: (accountId: string | null, date: string) => ['dashboard', accountId, date] as const,

  // Agent sessions
  SESSIONS: ['agent-sessions'] as const,
  SESSION_MESSAGES: (sessionId: string) => ['session-messages', sessionId] as const,
} as const;

// ── Email Filters ─────────────────────────────────────────────
export const EMAIL_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'important', label: 'Important' },
  { value: 'attachments', label: 'Attachments' },
  { value: 'requires_action', label: 'Requires Action' },
] as const;

// ── NEXA Suggested Prompts ────────────────────────────────────
export const NEXA_SUGGESTED_PROMPTS = [
  {
    id: 'agentic-ai',
    label: 'Explain Agentic AI',
    prompt: 'Explain what Agentic AI is and how multi-agent architectures work.',
    icon: 'star',
  },
  {
    id: 'debug-code',
    label: 'Help me debug my code',
    prompt: 'Can you review this code snippet and help me debug it?',
    icon: 'zap',
  },
  {
    id: 'langgraph',
    label: 'Explain LangGraph',
    prompt: 'What is LangGraph and how does state management work in cyclical graphs?',
    icon: 'list',
  },
  {
    id: 'learning-roadmap',
    label: 'Create a learning roadmap',
    prompt: 'Create a step-by-step learning roadmap for modern AI application engineering.',
    icon: 'search',
  },
] as const;

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// ── Local storage keys ────────────────────────────────────────
export const STORAGE_KEYS = {
  THEME: 'nexa_theme',
  SELECTED_ACCOUNT: 'nexa_selected_account',
  SELECTED_DATE: 'nexa_selected_date',
  SIDEBAR_COLLAPSED: 'nexa_sidebar_collapsed',
} as const;

export const API_BASE_URL = 'https://nexa-backend-qnds.onrender.com/api';

// ── Email categories ──────────────────────────────────────────
export const EMAIL_CATEGORY_LABELS: Record<string, string> = {
  important: 'Important',
  urgent: 'Urgent',
  work: 'Work',
  personal: 'Personal',
  financial: 'Financial',
  promotional: 'Promotional',
  social: 'Social',
  newsletter: 'Newsletter',
  other: 'Other',
};

export const EMAIL_CATEGORY_COLORS: Record<string, string> = {
  important: 'badge-warning',
  urgent: 'badge-danger',
  work: 'badge-primary',
  personal: 'badge-success',
  financial: 'badge-warning',
  promotional: 'badge-muted',
  social: 'badge-muted',
  newsletter: 'badge-muted',
  other: 'badge-muted',
};
