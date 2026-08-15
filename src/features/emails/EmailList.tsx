import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Paperclip,
  Star,
  Zap,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import { emailsApi } from '@/services/api/emails';
import { useContextStore } from '@/app/store';
import { QUERY_KEYS, DEFAULT_PAGE_SIZE } from '@/constants';
import { formatEmailTime, getInitials, cn } from '@/utils';
import { DateBar } from './DateBar';
import { EmailSearch } from './EmailSearch';
import { EmailFilters } from './EmailFilters';
import { toast } from 'sonner';
import type { Email } from '@/types';

interface EmailListProps {
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SkeletonRow({ isCollapsed }: { isCollapsed?: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center p-2 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2 border-b border-zinc-100 dark:border-zinc-800/60 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
      <div className="h-3.5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
    </div>
  );
}

function EmptyState({ type }: { type: 'no-account' | 'no-emails' | 'no-results' }) {
  const messages = {
    'no-account': {
      icon: <Mail size={22} className="text-zinc-400" />,
      title: 'No account selected',
      body: 'Select a connected Gmail account to view emails.',
    },
    'no-emails': {
      icon: <Inbox size={22} className="text-zinc-400" />,
      title: 'No emails for this date',
      body: 'There are no emails recorded on the selected date.',
    },
    'no-results': {
      icon: <AlertTriangle size={22} className="text-zinc-400" />,
      title: 'No matching emails',
      body: 'No emails found matching your filter or search query.',
    },
  };

  const m = messages[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-3">
        {m.icon}
      </div>
      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{m.title}</p>
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-[200px] leading-relaxed">{m.body}</p>
    </div>
  );
}

export function EmailList({
  selectedEmailId,
  onSelectEmail,
  isCollapsed = false,
  onToggleCollapse,
}: EmailListProps) {
  const { selectedAccountId, selectedDate, emailFilter, searchQuery } = useContextStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.EMAILS({
      accountId: selectedAccountId,
      date: selectedDate,
      filter: emailFilter,
      q: searchQuery,
    }),
    queryFn: () =>
      emailsApi.list({
        accountId: selectedAccountId!,
        date: selectedDate,
        filter: emailFilter !== 'all' ? emailFilter : undefined,
        q: searchQuery || undefined,
        limit: DEFAULT_PAGE_SIZE,
      }),
    enabled: !!selectedAccountId,
  });

  const emails = data?.data ?? [];

  const { mutate: toggleStar } = useMutation({
    mutationFn: ({ emailId, isImportant }: { emailId: string; isImportant: boolean }) =>
      emailsApi.markImportant(emailId, isImportant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
  });

  if (isCollapsed) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Collapsed Header */}
        <div className="h-14 flex items-center justify-center border-b border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Expand Email List"
            aria-label="Expand Email List"
          >
            <PanelLeftOpen size={16} />
          </button>
        </div>

        {/* Collapsed Avatars */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-none">
          {isLoading ? (
            [...Array(6)].map((_, i) => <SkeletonRow key={i} isCollapsed />)
          ) : emails.length === 0 ? (
            <div className="flex justify-center p-2 text-zinc-400">
              <Mail size={16} />
            </div>
          ) : (
            emails.map((email) => {
              const isSelected = selectedEmailId === email.id;
              return (
                <button
                  key={email.id}
                  onClick={() => onSelectEmail(email)}
                  title={`${email.senderName}: ${email.subject}`}
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center relative transition-all mx-auto',
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  )}
                >
                  <span className="text-xs font-bold">{getInitials(email.senderName)}</span>
                  {!email.isRead && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900" />
                  )}
                  {email.isUrgent && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Expanded Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            EMAILS
          </h2>
          {emails.length > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40">
              {emails.length}
            </span>
          )}
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Collapse Email List"
            aria-label="Collapse Email List"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Navigation Controls */}
      <DateBar />
      <EmailSearch />
      <EmailFilters />

      {/* Email Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100/80 dark:divide-zinc-800/60 scrollbar-thin">
        {!selectedAccountId ? (
          <EmptyState type="no-account" />
        ) : isLoading ? (
          [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
        ) : emails.length === 0 ? (
          <EmptyState type={searchQuery || emailFilter !== 'all' ? 'no-results' : 'no-emails'} />
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onClick={() => onSelectEmail(email)}
              onToggleStar={(e) => {
                e.stopPropagation();
                toggleStar({ emailId: email.id, isImportant: !email.isImportant });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}

function EmailListItem({ email, isSelected, onClick, onToggleStar }: EmailListItemProps) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'group relative p-3.5 cursor-pointer transition-all duration-150 border-l-2 select-none',
        isSelected
          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-l-indigo-600 dark:border-l-indigo-400'
          : email.isUrgent
          ? 'border-l-red-500 bg-red-50/20 dark:bg-red-950/10 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          : email.isImportant
          ? 'border-l-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          : 'border-l-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        !email.isRead && 'bg-zinc-50/50 dark:bg-zinc-800/30'
      )}
    >
      {/* Top row: unread dot, avatar, sender name, time, star */}
      <div className="flex items-center gap-2.5 mb-1">
        {/* Unread indicator */}
        <div className="w-2 flex-shrink-0">
          {!email.isRead && (
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 block" />
          )}
        </div>

        {/* Sender Avatar */}
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
            email.isRead
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
          )}
        >
          {getInitials(email.senderName)}
        </div>

        {/* Sender Name */}
        <span
          className={cn(
            'text-xs truncate flex-1',
            email.isRead
              ? 'font-medium text-zinc-700 dark:text-zinc-300'
              : 'font-bold text-zinc-950 dark:text-zinc-50'
          )}
        >
          {email.senderName}
        </span>

        {/* Timestamp */}
        <span className="text-[11px] text-zinc-400 flex-shrink-0">
          {formatEmailTime(email.receivedAt)}
        </span>

        {/* Star Action */}
        <button
          onClick={onToggleStar}
          className="p-1 -mr-1 rounded text-zinc-300 dark:text-zinc-600 hover:text-amber-400 transition-colors"
          title={email.isImportant ? 'Starred' : 'Star email'}
          aria-label={email.isImportant ? 'Starred' : 'Star email'}
        >
          <Star
            size={13}
            className={cn(
              email.isImportant
                ? 'text-amber-400 fill-amber-400'
                : 'group-hover:text-zinc-400'
            )}
          />
        </button>
      </div>

      {/* Middle row: Subject with badges */}
      <div className="pl-4.5 flex items-center gap-1.5 mb-1">
        <span
          className={cn(
            'text-xs truncate flex-1',
            email.isRead
              ? 'font-normal text-zinc-800 dark:text-zinc-200'
              : 'font-semibold text-zinc-950 dark:text-zinc-100'
          )}
        >
          {email.subject || '(No Subject)'}
        </span>

        {email.isUrgent && (
          <span className="flex-shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            Urgent
          </span>
        )}

        {email.hasAttachments && (
          <Paperclip size={12} className="text-zinc-400 flex-shrink-0" />
        )}
      </div>

      {/* Bottom row: Body snippet */}
      <p className="pl-4.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {email.bodyPreview || 'No content preview'}
      </p>
    </div>
  );
}
