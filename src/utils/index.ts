import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

// ── Tailwind class merge utility ──────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Greeting based on time of day ────────────────────────────
export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good evening';
  } else {
    greeting = 'Good night';
  }

  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
}

// ── Format email timestamps ───────────────────────────────────
export function formatEmailTime(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return format(date, 'h:mm a'); // 10:32 AM
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d'); // Aug 14
  }
}

export function formatEmailDate(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMMM d, yyyy'); // August 14, 2026
  }
}

export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMMM d, yyyy');
}

export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// ── Truncate text ─────────────────────────────────────────────
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '…';
}

// ── Get initials for avatar ───────────────────────────────────
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Format file size ─────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Email provider helpers ────────────────────────────────────
export function getProviderLabel(provider: 'gmail' | 'outlook'): string {
  return provider === 'gmail' ? 'Gmail' : 'Outlook';
}

export function getProviderColor(provider: 'gmail' | 'outlook'): string {
  return provider === 'gmail' ? '#EA4335' : '#0078D4';
}

// ── Debounce ─────────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// ── Generate a local ID (for optimistic UI) ───────────────────
export function localId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
