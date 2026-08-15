import { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailAccountsApi } from '@/services/api/emailAccounts';
import { useContextStore } from '@/app/store';
import { QUERY_KEYS } from '@/constants';
import { getInitials, cn } from '@/utils';
import { toast } from 'sonner';
import type { EmailAccount } from '@/types';

function GmailLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      <path
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface AccountSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddAccount: () => void;
}

export function AccountSidebar({
  isCollapsed,
  onToggleCollapse,
  onAddAccount,
}: AccountSidebarProps) {
  const { selectedAccountId, setSelectedAccountId } = useContextStore();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.EMAIL_ACCOUNTS,
    queryFn: emailAccountsApi.list,
  });

  const accounts = data?.data ?? [];

  const { mutate: disconnect } = useMutation({
    mutationFn: emailAccountsApi.disconnect,
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMAIL_ACCOUNTS });
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
      }
      toast.success('Account disconnected');
      setDeletingId(null);
    },
    onError: () => {
      toast.error('Failed to disconnect account');
      setDeletingId(null);
    },
  });

  // Auto-select first account if none selected
  if (accounts.length > 0 && !selectedAccountId) {
    setSelectedAccountId(accounts[0].id);
  }

  return (
    <aside
      className={cn(
        'border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/80 dark:bg-zinc-900/90 transition-all duration-300 ease-in-out flex-shrink-0 z-10',
        isCollapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              ACCOUNTS
            </span>
            {accounts.length > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {accounts.length}
              </span>
            )}
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={cn(
            'p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors',
            isCollapsed && 'mx-auto'
          )}
          title={isCollapsed ? 'Expand Accounts Panel' : 'Collapse Accounts Panel'}
          aria-label={isCollapsed ? 'Expand Accounts Panel' : 'Collapse Accounts Panel'}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-2 py-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl">
                <div className="skeleton w-8 h-8 rounded-xl flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-2.5 w-28 rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-2 text-center text-xs text-red-500 flex items-center justify-center gap-1">
            <AlertCircle size={14} />
            {!isCollapsed && <span>Failed to load</span>}
          </div>
        ) : accounts.length === 0 ? (
          !isCollapsed && (
            <div className="p-4 text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No accounts connected</p>
            </div>
          )
        ) : (
          accounts.map((account) => {
            const isSelected = selectedAccountId === account.id;
            return (
              <AccountCard
                key={account.id}
                account={account}
                isSelected={isSelected}
                isCollapsed={isCollapsed}
                onSelect={() => setSelectedAccountId(account.id)}
                onDelete={() => {
                  setDeletingId(account.id);
                  disconnect(account.id);
                }}
                isDeleting={deletingId === account.id}
              />
            );
          })
        )}
      </div>

      {/* Add Account Button */}
      <div className="p-2.5 border-t border-zinc-200/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40">
        <button
          onClick={onAddAccount}
          className={cn(
            'w-full flex items-center rounded-xl font-medium text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/70 border border-indigo-200/60 dark:border-indigo-800/50 transition-all duration-150',
            isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2.5'
          )}
          title="Connect new Gmail account"
          id="add-email-account-btn"
        >
          <Plus size={15} className="flex-shrink-0" />
          {!isCollapsed && <span className="font-semibold">Add account</span>}
        </button>
      </div>
    </aside>
  );
}

interface AccountCardProps {
  account: EmailAccount;
  isSelected: boolean;
  isCollapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function AccountCard({
  account,
  isSelected,
  isCollapsed,
  onSelect,
  onDelete,
  isDeleting,
}: AccountCardProps) {
  const [showDelete, setShowDelete] = useState(false);

  if (isCollapsed) {
    return (
      <div className="relative flex justify-center group" title={`${account.displayName} (${account.email})`}>
        <button
          onClick={onSelect}
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-150',
            isSelected
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-900'
              : 'bg-white dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 border border-zinc-200/70 dark:border-zinc-700/60'
          )}
        >
          <span className="text-xs font-bold">{getInitials(account.displayName || account.email)}</span>
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900',
              account.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
            )}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-150',
        isSelected
          ? 'bg-white dark:bg-zinc-800/90 border-indigo-500/50 dark:border-indigo-500/40 shadow-sm'
          : 'bg-white/60 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
    >
      {/* Icon with active status indicator */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs',
            isSelected
              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-600'
          )}
        >
          <GmailLogo size={16} />
        </div>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-800',
            account.isActive ? 'bg-emerald-500' : 'bg-zinc-400'
          )}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              'text-xs font-semibold truncate',
              isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-800 dark:text-zinc-200'
            )}
          >
            {account.displayName}
          </p>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{account.email}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Synced
          </span>
        </div>
      </div>

      {/* Disconnect Action */}
      {showDelete && !isDeleting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2.5 top-3 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
          title="Disconnect account"
          aria-label={`Disconnect ${account.email}`}
        >
          <Trash2 size={12} />
        </button>
      )}

      {isDeleting && (
        <div className="absolute right-2.5 top-3 p-1">
          <Loader2 size={12} className="animate-spin text-zinc-400" />
        </div>
      )}
    </div>
  );
}
