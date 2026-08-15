import { useState } from 'react';
import { AccountSidebar } from './AccountSidebar';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import { AddAccountModal } from './AddAccountModal';
import { Mail, Sparkles, X, Plus } from 'lucide-react';
import { cn } from '@/utils';
import type { Email } from '@/types';

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showMobileAccounts, setShowMobileAccounts] = useState(false);
  const [isAccountsCollapsed, setIsAccountsCollapsed] = useState(false);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [isFullscreenReading, setIsFullscreenReading] = useState(false);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
  };

  const handleCloseEmail = () => {
    setSelectedEmail(null);
    setIsFullscreenReading(false);
  };

  return (
    <div className="flex h-full overflow-hidden bg-zinc-100/60 dark:bg-zinc-950 page-enter relative">
      {/* ── 1. ACCOUNTS PANEL (Desktop Left Sidebar) ─────────── */}
      {!isFullscreenReading && (
        <div className="hidden md:flex flex-shrink-0">
          <AccountSidebar
            isCollapsed={isAccountsCollapsed}
            onToggleCollapse={() => setIsAccountsCollapsed(!isAccountsCollapsed)}
            onAddAccount={() => setShowAddAccount(true)}
          />
        </div>
      )}

      {/* ── 1B. MOBILE ACCOUNTS DRAWER / BOTTOM SHEET ────────── */}
      {showMobileAccounts && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileAccounts(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-h-[85dvh] flex flex-col z-10 animate-fade-in-scale overflow-hidden">
            {/* Sheet Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Email Accounts
                </h3>
              </div>
              <button
                onClick={() => setShowMobileAccounts(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                aria-label="Close accounts sheet"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content using AccountSidebar in expanded mode */}
            <div className="flex-1 overflow-y-auto p-2">
              <AccountSidebar
                isCollapsed={false}
                onToggleCollapse={() => setShowMobileAccounts(false)}
                onAddAccount={() => {
                  setShowMobileAccounts(false);
                  setShowAddAccount(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. EMAIL LIST PANEL (Middle) ─────────────────────── */}
      {!isFullscreenReading && (
        <div
          className={cn(
            'flex flex-col border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out flex-shrink-0 z-0',
            // Desktop Widths
            isListCollapsed ? 'w-[68px]' : 'w-full md:w-[360px] lg:w-[380px]',
            // Mobile responsive visibility
            selectedEmail ? 'hidden md:flex' : 'flex flex-1 md:flex-none'
          )}
        >
          <EmailList
            selectedEmailId={selectedEmail?.id ?? null}
            onSelectEmail={handleSelectEmail}
            isCollapsed={isListCollapsed}
            onToggleCollapse={() => setIsListCollapsed(!isListCollapsed)}
            onOpenAccounts={() => setShowMobileAccounts(true)}
            onAddAccount={() => setShowAddAccount(true)}
          />
        </div>
      )}

      {/* ── 3. EMAIL PREVIEW PANEL (Right / Fullscreen) ──────── */}
      <main
        className={cn(
          'flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-300',
          selectedEmail ? 'flex' : 'hidden md:flex items-center justify-center'
        )}
      >
        {selectedEmail ? (
          <EmailDetail
            email={selectedEmail}
            onClose={handleCloseEmail}
            isFullscreen={isFullscreenReading}
            onToggleFullscreen={() => setIsFullscreenReading(!isFullscreenReading)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 max-w-sm text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <Mail size={28} />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              Select an email to preview
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Browse through your inbox or ask NEXA AI in Chat to summarize and act on your unread threads.
            </p>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
              <Sparkles size={12} className="text-indigo-500" />
              <span>Powered by NEXA Email Intelligence</span>
            </div>
          </div>
        )}
      </main>

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
      />
    </div>
  );
}
