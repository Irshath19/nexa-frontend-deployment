import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Zap, Paperclip, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useContextStore } from '@/app/store';
import { dashboardApi } from '@/services/api/dashboard';
import { QUERY_KEYS, ROUTES } from '@/constants';
import { formatEmailTime, truncate, getInitials, cn } from '@/utils';
import type { Email } from '@/types';

function EmailCard({ email }: { email: Email }) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg',
      'border border-zinc-200 dark:border-zinc-800',
      'bg-white dark:bg-zinc-900',
      'hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors duration-150',
      email.isUrgent ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-amber-400'
    )}>
      {/* Sender avatar */}
      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
        {getInitials(email.senderName)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {email.subject}
          </span>
          <span className="text-xs text-zinc-400 flex-shrink-0">
            {formatEmailTime(email.receivedAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {email.senderName}
          </span>
          {email.isUrgent && (
            <span className="badge badge-danger gap-0.5">
              <Zap size={9} /> Urgent
            </span>
          )}
          {!email.isUrgent && email.isImportant && (
            <span className="badge badge-warning gap-0.5">
              <AlertTriangle size={9} /> Important
            </span>
          )}
          {email.hasAttachments && (
            <Paperclip size={11} className="text-zinc-400 flex-shrink-0" />
          )}
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {email.bodyPreview}
        </p>

        {email.actionSummary && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
            <CheckCircle size={12} className="mt-0.5 flex-shrink-0" />
            <span>{email.actionSummary}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonEmailCard() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between gap-2">
          <div className="skeleton h-4 w-48 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
    </div>
  );
}

export function ImportantEmailsWidget() {
  const { selectedAccountId, selectedDate } = useContextStore();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD(selectedAccountId, selectedDate),
    queryFn: () => dashboardApi.overview(selectedAccountId, selectedDate),
    enabled: !!selectedAccountId,
  });

  const importantEmails = data?.data?.importantEmails ?? [];

  return (
    <div className="px-6 mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Important Emails
        </h2>
        <Link
          to={`${ROUTES.EMAILS}?filter=important`}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          View all <ArrowRight size={12} />
        </Link>
      </div>

      {/* Content */}
      {isLoading && selectedAccountId ? (
        <div className="space-y-3">
          <SkeletonEmailCard />
          <SkeletonEmailCard />
        </div>
      ) : importantEmails.length > 0 ? (
        <div className="space-y-3">
          {importantEmails.slice(0, 3).map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <AlertTriangle size={18} className="text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No important emails</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {selectedAccountId
              ? 'No important emails found for this date.'
              : 'Connect an email account to see important emails.'}
          </p>
        </div>
      )}
    </div>
  );
}
