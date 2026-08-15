import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Sparkles, ExternalLink, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { emailAccountsApi } from '@/services/api/emailAccounts';
import { useContextStore } from '@/app/store';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'sonner';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function GmailLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335"/>
    </svg>
  );
}

export function AddAccountModal({ isOpen, onClose }: AddAccountModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { setSelectedAccountId } = useContextStore();
  const queryClient = useQueryClient();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl w-full max-w-lg animate-fade-in-scale overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
              <GmailLogo />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Connect Gmail Account
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Integrate your Google Workspace or personal Gmail
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {/* Primary: Google OAuth */}
          <button
            onClick={handleConnectGmail}
            disabled={isConnecting || demoMutation.isPending}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-indigo-500/30 hover:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all duration-150 group text-left"
            id="connect-gmail-oauth"
          >
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center flex-shrink-0">
              <GmailLogo />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {isConnecting ? 'Redirecting to Google...' : 'Sign in with Google (OAuth 2.0)'}
                </p>
                <span className="badge badge-primary text-[10px]">Recommended</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Direct read-only sync via official Google OAuth consent screen
              </p>
            </div>
            <ArrowRight size={16} className="text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Quick Demo Sandbox option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-medium tracking-wider">
                Or Instant Testing
              </span>
            </div>
          </div>

          <button
            onClick={() => demoMutation.mutate()}
            disabled={isConnecting || demoMutation.isPending}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50 bg-white dark:bg-zinc-900 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-150 group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {demoMutation.isPending ? 'Generating Test Inbox...' : 'Instant Demo Gmail Inbox'}
                </p>
                <span className="badge badge-success text-[10px]">Zero Config</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Populate 5+ realistic emails with urgent actions, attachments, & AI summaries instantly
              </p>
            </div>
          </button>
        </div>

        {/* Security Disclosure */}
        <div className="px-6 pb-6">
          <div className="flex items-start gap-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
            <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-zinc-800 dark:text-zinc-200">Security Guarantee:</strong> NEXA uses read-only OAuth tokens. Your Google password is never requested or stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
