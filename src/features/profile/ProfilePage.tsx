import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Key, Sparkles, CheckCircle, ExternalLink, Calendar, LogOut } from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { authApi } from '@/services/api/auth';
import { getInitials, formatFullDate } from '@/utils';
import { ROUTES } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { emailAccountsApi } from '@/services/api/emailAccounts';
import { QUERY_KEYS } from '@/constants';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [copiedId, setCopiedId] = useState(false);

  const { data: accountsData } = useQuery({
    queryKey: QUERY_KEYS.EMAIL_ACCOUNTS,
    queryFn: emailAccountsApi.list,
  });

  const accounts = accountsData?.data ?? [];

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
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
    <div className="max-w-4xl mx-auto px-6 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-page-title text-zinc-900 dark:text-zinc-100">Your Profile</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your personal information, connected accounts, and workspace settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: User Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="nexa-card p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950 border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-2xl font-bold text-indigo-700 dark:text-indigo-300 shadow-sm mb-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                user ? getInitials(user.displayName) : 'N'
              )}
            </div>

            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {user?.displayName ?? 'User'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 break-all">
              {user?.email}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <span className="badge badge-primary">
                ✦ Pro Member
              </span>
              <span className="badge badge-success">
                Active
              </span>
            </div>

            <div className="w-full border-t border-zinc-100 dark:border-zinc-800 my-5" />

            <div className="w-full space-y-2 text-left text-xs">
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                <span>Member since</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {user?.createdAt ? formatFullDate(user.createdAt).split('at')[0] : 'August 2026'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-500 dark:text-zinc-400">
                <span>User ID</span>
                <button
                  onClick={handleCopyId}
                  className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  title="Click to copy ID"
                >
                  {copiedId ? 'Copied!' : `${user?.id?.slice(0, 8)}...`}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/40 transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Account Details & Connected Services */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="nexa-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <User size={16} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Account Details
                </h3>
              </div>
              <Link
                to={ROUTES.SETTINGS}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Settings <ExternalLink size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="text-label block mb-1">Full Name</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user?.displayName ?? 'Not set'}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-100 dark:border-zinc-800">
                <span className="text-label block mb-1">Email Address</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user?.email ?? 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Email Inboxes */}
          <div className="nexa-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Connected Inboxes
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Google Gmail accounts linked to your NEXA Agent
                  </p>
                </div>
              </div>

              <Link
                to={ROUTES.EMAILS}
                className="btn-primary text-xs py-1.5 px-3"
              >
                Manage Inboxes
              </Link>
            </div>

            {accounts.length > 0 ? (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-red-50 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24">
                          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{acc.displayName}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{acc.email}</p>
                      </div>
                    </div>
                    <span className="badge badge-success text-[10px]">Connected</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  No email accounts connected yet. Connect your Gmail to let NEXA summarize and organize your emails.
                </p>
                <Link
                  to={ROUTES.EMAILS}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Connect Gmail <ExternalLink size={11} />
                </Link>
              </div>
            )}
          </div>

          {/* Security & Intelligence Features */}
          <div className="nexa-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Security & AI Privacy
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  OAuth 2.0 with zero password storage
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
                <span>JWT authentication with automatic session refresh.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
