import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Reply,
  Forward,
  MailOpen,
  Maximize2,
  Minimize2,
  MoreVertical,
  Printer,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface EmailHeaderProps {
  subject: string;
  isImportant: boolean;
  isUrgent?: boolean;
  category?: string;
  isFullscreen?: boolean;
  onClose: () => void;
  onToggleStar: () => void;
  onReply: () => void;
  onMarkUnread: () => void;
  onToggleFullscreen?: () => void;
}

export function EmailHeader({
  subject,
  isImportant,
  isUrgent,
  category,
  isFullscreen = false,
  onClose,
  onToggleStar,
  onReply,
  onMarkUnread,
  onToggleFullscreen,
}: EmailHeaderProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    toast.success('Subject copied to clipboard');
    setTimeout(() => {
      setCopiedSubject(false);
      setShowMoreMenu(false);
    }, 1500);
  };

  const handlePrint = () => {
    setShowMoreMenu(false);
    window.print();
  };

  const handleForward = () => {
    setShowMoreMenu(false);
    onReply();
    toast.info('Forwarding draft prepared below.');
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-20 flex-shrink-0 transition-all">
      {/* Left: Back button & Subject */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2 sm:mr-4">
        <button
          onClick={onClose}
          className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 cursor-pointer"
          title="Back to email list"
          aria-label="Back to email list"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Truncated Subject for mobile & desktop */}
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <h2
            className="text-xs sm:text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate tracking-tight"
            title={subject || '(No Subject)'}
          >
            {subject || '(No Subject)'}
          </h2>

          {isUrgent && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Urgent
            </span>
          )}

          {category && (
            <span className="hidden md:inline-flex text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex-shrink-0">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions Bar */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {/* Star / Important */}
        <button
          onClick={onToggleStar}
          className={cn(
            'min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer',
            isImportant && 'text-amber-500'
          )}
          title={isImportant ? 'Starred' : 'Star email'}
          aria-label={isImportant ? 'Starred' : 'Star email'}
        >
          <Star size={17} className={isImportant ? 'fill-amber-400 text-amber-400' : ''} />
        </button>

        {/* Reply (Visible on all screens) */}
        <button
          onClick={onReply}
          className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Reply to email"
          aria-label="Reply to email"
        >
          <Reply size={17} />
        </button>

        {/* Mark Unread (Desktop only) */}
        <button
          onClick={onMarkUnread}
          className="hidden sm:flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Mark as unread"
          aria-label="Mark as unread"
        >
          <MailOpen size={17} />
        </button>

        {/* Fullscreen Toggle (Desktop only) */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="hidden md:flex min-h-[42px] min-w-[42px] items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        )}

        {/* More Actions Menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="More actions"
            aria-label="More actions"
          >
            <MoreVertical size={17} />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-1.5 z-30 animate-fade-in-scale">
              <button
                onClick={handleForward}
                className="w-full px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
              >
                <Forward size={14} className="text-zinc-400" />
                <span>Forward Message</span>
              </button>

              <button
                onClick={onMarkUnread}
                className="sm:hidden w-full px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
              >
                <MailOpen size={14} className="text-zinc-400" />
                <span>Mark as unread</span>
              </button>

              <button
                onClick={handleCopySubject}
                className="w-full px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
              >
                {copiedSubject ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-zinc-400" />}
                <span>{copiedSubject ? 'Subject Copied' : 'Copy Subject'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="w-full px-3.5 py-2 text-left text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 cursor-pointer"
              >
                <Printer size={14} className="text-zinc-400" />
                <span>Print Email</span>
              </button>
            </div>
          )}
        </div>

        <div className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Close */}
        <button
          onClick={onClose}
          className="min-h-[38px] min-w-[38px] sm:min-h-[42px] sm:min-w-[42px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Close email preview"
          aria-label="Close email preview"
        >
          <X size={17} />
        </button>
      </div>
    </header>
  );
}
