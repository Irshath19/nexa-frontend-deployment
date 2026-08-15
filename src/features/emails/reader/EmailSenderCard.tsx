import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Copy,
  Check,
  Mail,
  User,
  Calendar,
} from 'lucide-react';
import { getInitials, formatFullDate, formatEmailTime } from '@/utils';
import { toast } from 'sonner';

interface EmailSenderCardProps {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  receivedAt: string;
  subject?: string;
  replyToEmail?: string;
}

export function EmailSenderCard({
  senderName,
  senderEmail,
  recipientEmail,
  receivedAt,
  subject,
  replyToEmail,
}: EmailSenderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopySenderEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(senderEmail);
    setCopiedEmail(true);
    toast.success('Sender email copied');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3.5 sm:p-4 transition-all duration-200 shadow-2xs">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-start justify-between gap-3 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
            {getInitials(senderName || senderEmail)}
          </div>

          {/* Sender Details Header */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {senderName || senderEmail}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate hidden sm:inline">
                &lt;{senderEmail}&gt;
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>to me</span>
              <span>·</span>
              <span>{formatFullDate(receivedAt)}</span>
              <span>({formatEmailTime(receivedAt)})</span>
            </p>
          </div>
        </div>

        {/* Expand Trigger Button */}
        <div className="flex items-center gap-1 flex-shrink-0 pt-1">
          <button
            type="button"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors"
            title={isExpanded ? 'Hide details' : 'Show details'}
            aria-label={isExpanded ? 'Hide details' : 'Show details'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Deep Metadata */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-zinc-200/70 dark:border-zinc-700/60 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-zinc-400 font-medium w-16 flex-shrink-0">From:</span>
              <div className="min-w-0 flex items-center gap-1">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {senderName}
                </span>
                <span className="text-zinc-500 truncate">&lt;{senderEmail}&gt;</span>
                <button
                  type="button"
                  onClick={handleCopySenderEmail}
                  className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Copy email address"
                >
                  {copiedEmail ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <span className="text-zinc-400 font-medium w-16 flex-shrink-0">To:</span>
              <span className="text-zinc-800 dark:text-zinc-200 truncate font-medium">
                {recipientEmail || 'me'}
              </span>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <span className="text-zinc-400 font-medium w-16 flex-shrink-0">Date:</span>
              <span className="text-zinc-800 dark:text-zinc-200">
                {formatFullDate(receivedAt)} at {formatEmailTime(receivedAt)}
              </span>
            </div>

            {replyToEmail && replyToEmail !== senderEmail && (
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-zinc-400 font-medium w-16 flex-shrink-0">Reply-To:</span>
                <span className="text-zinc-800 dark:text-zinc-200 truncate">{replyToEmail}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium sm:col-span-2">
              <ShieldCheck size={14} className="flex-shrink-0" />
              <span>Standard Encryption (TLS) · Verified Sender via SPF & DKIM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
