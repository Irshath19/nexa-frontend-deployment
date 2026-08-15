// ============================================================
// NEXA — Shared TypeScript Types
// ============================================================

// ── Auth ─────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
}

// ── Email Accounts ────────────────────────────────────────────
export type EmailProvider = 'gmail' | 'outlook';

export interface EmailAccount {
  id: string;
  userId: string;
  provider: EmailProvider;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Emails ────────────────────────────────────────────────────
export type EmailCategory =
  | 'important'
  | 'urgent'
  | 'work'
  | 'personal'
  | 'financial'
  | 'promotional'
  | 'social'
  | 'newsletter'
  | 'other';

export type EmailFilter = 'all' | 'unread' | 'important' | 'attachments' | 'requires_action';

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface Email {
  id: string;
  accountId: string;
  providerMessageId: string;
  threadId: string | null;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  bodyPreview: string;
  body: string | null;
  receivedAt: string;
  isRead: boolean;
  hasAttachments: boolean;
  isImportant: boolean;
  isUrgent: boolean;
  category: EmailCategory;
  requiresAction: boolean;
  actionSummary: string | null;
  summary: string | null;
  keyPoints: string[] | null;
  deadlineMentioned: string | null;
  importantPeople: string[] | null;
  attachments: EmailAttachment[];
  createdAt: string;
  updatedAt: string;
}

// ── Email Statistics ──────────────────────────────────────────
export interface EmailStats {
  total: number;
  unread: number;
  important: number;
  urgent: number;
  hasAttachments: number;
  requiresAction: number;
}

// ── Dashboard ─────────────────────────────────────────────────
export interface DashboardOverview {
  stats: EmailStats;
  importantEmails: Email[];
  recentEmails: Email[];
  date: string;
  accountId: string | null;
}

// ── Agent / Chat ──────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  emailCards?: Email[];
  progressSteps?: ProgressStep[];
  createdAt: string;
}

export interface ProgressStep {
  id: string;
  message: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export interface AgentSession {
  id: string;
  userId: string;
  accountId: string | null;
  selectedDate: string | null;
  createdAt: string;
  lastActiveAt: string;
}

// ── SSE Events ────────────────────────────────────────────────
export type SSEEventType = 'progress' | 'token' | 'email_card' | 'done' | 'error';

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  email?: Email;
  stepId?: string;
  stepStatus?: ProgressStep['status'];
}

// ── API Response Envelope ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ── Pagination ────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface EmailListParams extends PaginationParams {
  accountId: string;
  date?: string;
  filter?: EmailFilter;
  q?: string;
}

// ── Theme ─────────────────────────────────────────────────────
export type Theme = 'light' | 'dark' | 'system';
