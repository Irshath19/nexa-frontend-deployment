import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { emailAccountsApi } from '@/services/api/emailAccounts';
import { useContextStore } from '@/app/store';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'sonner';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function GmailLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
    </svg>
  );
}

function OutlookLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      <path fill="#0078D4" d="M1 5.5l13.5-3v19L1 18.5z"/>
      <path fill="#28A8EA" d="M14.5 2.5L23 5v14l-8.5 2.5z"/>
      <circle cx="7.5" cy="11.5" r="3.5" fill="#ffffff"/>
    </svg>
  );
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setSelectedAccountId } = useContextStore();
  const queryClient = useQueryClient();

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const demoMutation = useMutation({
    mutationFn: emailAccountsApi.connectDemo,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMAIL_ACCOUNTS });
      if (res.data?.id) {
        setSelectedAccountId(res.data.id);
      }
      toast.success('Demo Gmail account connected with sample emails!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to initialize demo account');
    },
  });

  if (!isOpen) return null;

  const handleConnectGmail = () => {
    setIsConnecting(true);
    emailAccountsApi.connectGmail();
  };

  const handleConnectOutlook = () => {
    toast.info('Outlook integration is in development. Use Gmail or Demo account.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet */}
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-lg max-h-[90dvh] flex flex-col animate-fade-in-scale overflow-hidden z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-xs">
              ✦
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Connect Email Account
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Integrate your inboxes with NEXA AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* Primary: Google OAuth */}
          <button
            onClick={handleConnectGmail}
            disabled={isConnecting || demoMutation.isPending}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 border-indigo-500/30 hover:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all duration-150 group text-left cursor-pointer disabled:opacity-50 min-h-[56px]"
            id="connect-gmail-oauth"
          >
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0 border border-zinc-100 dark:border-zinc-700">
              <GmailLogo size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {isConnecting ? 'Redirecting to Google...' : 'Google Gmail (OAuth 2.0)'}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Official OAuth
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Sync Workspace or Personal Gmail via Google consent
              </p>
            </div>
            <ArrowRight size={18} className="text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Secondary: Microsoft Outlook */}
          <button
            onClick={handleConnectOutlook}
            disabled={isConnecting || demoMutation.isPending}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400/50 bg-white dark:bg-zinc-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all duration-150 group text-left cursor-pointer disabled:opacity-50 min-h-[56px]"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 shadow-sm flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/40">
              <OutlookLogo size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Microsoft Outlook / 365
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Connect your work Outlook or Hotmail account
              </p>
            </div>
            <Lock size={16} className="text-zinc-400 flex-shrink-0" />
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-bold tracking-wider">
                Or Instant Testing
              </span>
            </div>
          </div>

          {/* Quick Demo Sandbox Option */}
          <button
            onClick={() => demoMutation.mutate()}
            disabled={isConnecting || demoMutation.isPending}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-emerald-200/70 dark:border-emerald-900/50 hover:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-all duration-150 group text-left cursor-pointer disabled:opacity-50 min-h-[56px]"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {demoMutation.isPending ? 'Generating Test Inbox...' : 'Instant Demo Gmail Inbox'}
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Zero Config
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                Populate realistic emails with attachments and AI summaries
              </p>
            </div>
            <ArrowRight size={18} className="text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>

        {/* Security Disclosure Footer */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-800/60 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
          <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong className="text-zinc-800 dark:text-zinc-200">Security Guarantee:</strong> NEXA uses official read-only OAuth tokens. Your account password is never stored or accessed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
