import { Link } from 'react-router-dom';
import { ArrowRight, Paperclip, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '@/app/store';
import { dashboardApi } from '@/services/api/dashboard';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { formatEmailTime, getInitials, cn } from '@/utils';
import type { Email } from '@/types';

function EmailRow({ email }: { email: Email }) {
  return (
    <Link
      to={`${ROUTES.EMAILS}?email=${email.id}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        'transition-colors duration-100',
        'border-b border-zinc-100 dark:border-zinc-800 last:border-0'
      )}
    >
      {/* Unread dot */}
      <div className="w-4 flex-shrink-0 flex justify-center">
        {!email.isRead && (
          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
        )}
      </div>

      {/* Sender avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold',
        email.isRead
          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
          : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
      )}>
        {getInitials(email.senderName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm truncate',
            email.isRead
              ? 'font-normal text-zinc-600 dark:text-zinc-400'
              : 'font-medium text-zinc-900 dark:text-zinc-100'
          )}>
            {email.senderName}
          </span>
          <span className="text-xs text-zinc-400 flex-shrink-0 ml-auto">
            {formatEmailTime(email.receivedAt)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn(
            'text-xs truncate flex-1',
            email.isRead
              ? 'text-zinc-500 dark:text-zinc-500'
              : 'text-zinc-700 dark:text-zinc-300'
          )}>
            {email.subject}
          </span>
          {email.isImportant && (
            <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
          )}
          {email.hasAttachments && (
            <Paperclip size={11} className="text-zinc-400 flex-shrink-0" />
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
      <div className="w-4" />
      <div className="skeleton w-7 h-7 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between gap-2">
          <div className="skeleton h-3.5 w-24 rounded" />
          <div className="skeleton h-3 w-10 rounded" />
        </div>
        <div className="skeleton h-3 w-48 rounded" />
      </div>
    </div>
  );
}

export function RecentEmailsList() {
  const { selectedAccountId, selectedDate } = useContextStore();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD(selectedAccountId, selectedDate),
    queryFn: () => dashboardApi.overview(selectedAccountId, selectedDate),
    enabled: !!selectedAccountId,
  });

  const recentEmails = data?.data?.recentEmails ?? [];

  return (
    <div className="px-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Emails
        </h2>
        <Link
          to={ROUTES.EMAILS}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="nexa-card overflow-hidden">
        {isLoading && selectedAccountId ? (
          <>
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </>
        ) : recentEmails.length > 0 ? (
          <>
            {recentEmails.slice(0, 8).map((email) => (
              <EmailRow key={email.id} email={email} />
            ))}
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedAccountId
                ? 'No emails for this date'
                : 'Connect an email account to view emails'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
