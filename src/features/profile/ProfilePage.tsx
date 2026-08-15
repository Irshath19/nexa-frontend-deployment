import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  ExternalLink,
  LogOut,
  Plus,
  Copy,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { authApi } from '@/services/api/auth';
import { getInitials, formatFullDate } from '@/utils';
import { ROUTES, QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { emailAccountsApi } from '@/services/api/emailAccounts';
import { AddAccountModal } from '@/features/emails/AddAccountModal';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [copiedId, setCopiedId] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  const { data: accountsData } = useQuery({
    queryKey: QUERY_KEYS.EMAIL_ACCOUNTS,
    queryFn: emailAccountsApi.list,
  });

  const accounts = accountsData?.data ?? [];

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      window.location.href = ROUTES.LOGIN;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 page-enter">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Your Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your personal identity, connected email accounts, and workspace settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: User Profile Card */}
        <div className="md:col-span-1 space-y-5 sm:space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl font-bold text-white shadow-md mb-4 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user ? getInitials(user.displayName) : 'N'
              )}
            </div>

            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-full">
              {user?.displayName ?? 'User'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-all max-w-full">
              {user?.email}
            </p>

            <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                ✦ Active Member
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                Verified
              </span>
            </div>

            <div className="w-full border-t border-zinc-100 dark:border-zinc-800 my-5" />

            <div className="w-full space-y-2.5 text-left text-xs">
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                <span>Member since</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {user?.createdAt ? formatFullDate(user.createdAt).split('at')[0] : 'August 2026'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                <span>User ID</span>
                <button
                  onClick={handleCopyId}
                  className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  title="Click to copy ID"
                >
                  <span>{copiedId ? 'Copied' : `${user?.id?.slice(0, 8)}...`}</span>
                  {copiedId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full min-h-[42px] flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Column: Account Details & Connected Services */}
        <div className="md:col-span-2 space-y-5 sm:space-y-6">
          {/* Personal Information */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                  <User size={16} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Account Details
                </h3>
              </div>
              <Link
                to={ROUTES.SETTINGS}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Settings</span>
                <ExternalLink size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Full Name
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {user?.displayName ?? 'Not set'}
                </span>
              </div>

              <div className="p-3.5 bg-zinc-50/80 dark:bg-zinc-800/60 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">
                  {user?.email ?? 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Email Inboxes */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Connected Inboxes
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Email accounts linked to your NEXA workspace
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddAccountModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 min-h-[36px]"
                >
                  <Plus size={13} />
                  <span>Connect Inbox</span>
                </button>
                <Link
                  to={ROUTES.EMAILS}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold min-h-[36px] flex items-center justify-center"
                >
                  View Emails
                </Link>
              </div>
            </div>

            {accounts.length > 0 ? (
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center flex-shrink-0 border border-red-100 dark:border-red-900/40">
                        <svg width="15" height="15" viewBox="0 0 24 24">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {acc.displayName || acc.email}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center space-y-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  No email accounts connected yet. Connect your Gmail to let NEXA summarize and organize your inbox.
                </p>
                <button
                  onClick={() => setShowAddAccountModal(true)}
                  className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Connect Gmail</span>
                </button>
              </div>
            )}
          </div>

          {/* Security & Intelligence Features */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Security & AI Privacy
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Official OAuth 2.0 with zero password storage
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Tokens are encrypted with AES-256-GCM at rest.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Email credentials are never shared with third-party LLMs.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <span>Official Google OAuth with read-only scoped permissions.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
      />
    </div>
  );
}
