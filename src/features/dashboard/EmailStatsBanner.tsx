import { Mail, AlertTriangle, MailOpen, Paperclip, Zap } from 'lucide-react';
import { useContextStore } from '@/app/store';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api/dashboard';
import { QUERY_KEYS } from '@/constants';
import type { EmailStats } from '@/types';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: 'default' | 'warning' | 'danger' | 'info';
  isLoading?: boolean;
}

function StatCard({ label, value, icon, accent = 'default', isLoading }: StatCardProps) {
  const accentMap = {
    default: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    danger: 'text-red-600 bg-red-50 dark:bg-red-950',
    info: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950',
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-xs text-label">{label}</span>
        <span className={`w-7 h-7 rounded-md flex items-center justify-center ${accentMap[accent]}`}>
          {icon}
        </span>
      </div>

      {isLoading ? (
        <div className="skeleton h-7 w-16 rounded" />
      ) : (
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
          {value.toLocaleString()}
        </span>
      )}
    </div>
  );
}

// Mock stats for when no account is selected
const EMPTY_STATS: EmailStats = {
  total: 0,
  unread: 0,
  important: 0,
  urgent: 0,
  hasAttachments: 0,
  requiresAction: 0,
};

export function EmailStatsBanner() {
  const { selectedAccountId, selectedDate } = useContextStore();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD(selectedAccountId, selectedDate),
    queryFn: () => dashboardApi.overview(selectedAccountId, selectedDate),
    enabled: !!selectedAccountId,
  });

  const stats = data?.data?.stats ?? EMPTY_STATS;

  return (
    <div className="px-6 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Emails"
          value={stats.total}
          icon={<Mail size={14} />}
          accent="default"
          isLoading={isLoading && !!selectedAccountId}
        />
        <StatCard
          label="Important"
          value={stats.important}
          icon={<AlertTriangle size={14} />}
          accent="warning"
          isLoading={isLoading && !!selectedAccountId}
        />
        <StatCard
          label="Unread"
          value={stats.unread}
          icon={<MailOpen size={14} />}
          accent="info"
          isLoading={isLoading && !!selectedAccountId}
        />
        <StatCard
          label="Attachments"
          value={stats.hasAttachments}
          icon={<Paperclip size={14} />}
          accent="default"
          isLoading={isLoading && !!selectedAccountId}
        />
      </div>

      {!selectedAccountId && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 text-center">
          Connect an email account to see your statistics
        </p>
      )}
    </div>
  );
}
