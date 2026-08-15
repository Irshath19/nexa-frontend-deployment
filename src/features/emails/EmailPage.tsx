import { useState } from 'react';
import { AccountSidebar } from './AccountSidebar';
import { EmailList } from './EmailList';
import { EmailDetail } from './EmailDetail';
import { AddAccountModal } from './AddAccountModal';
import { Mail, Sparkles } from 'lucide-react';
import { cn } from '@/utils';
import type { Email } from '@/types';

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
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
      {/* ── 1. ACCOUNTS PANEL (Left) ─────────────────────────── */}
      {!isFullscreenReading && (
        <div className="hidden md:flex flex-shrink-0">
          <AccountSidebar
            isCollapsed={isAccountsCollapsed}
            onToggleCollapse={() => setIsAccountsCollapsed(!isAccountsCollapsed)}
            onAddAccount={() => setShowAddAccount(true)}
          />
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
