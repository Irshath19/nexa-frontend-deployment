import React from 'react';
import {
  Send,
  Sparkles,
  X,
  Loader2,
  Reply,
} from 'lucide-react';
import { cn } from '@/utils';

interface EmailReplyComposerProps {
  isOpen: boolean;
  senderName: string;
  replyTo: string;
  replySubject: string;
  replyBody: string;
  isDraftingReply: boolean;
  isSendingReply: boolean;
  onOpen: () => void;
  onClose: () => void;
  onChangeTo: (val: string) => void;
  onChangeSubject: (val: string) => void;
  onChangeBody: (val: string) => void;
  onAutoDraft: () => void;
  onSend: () => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function EmailReplyComposer({
  isOpen,
  senderName,
  replyTo,
  replySubject,
  replyBody,
  isDraftingReply,
  isSendingReply,
  onOpen,
  onClose,
  onChangeTo,
  onChangeSubject,
  onChangeBody,
  onAutoDraft,
  onSend,
  textareaRef,
}: EmailReplyComposerProps) {
  if (!isOpen) {
    return (
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpen}
          className="w-full min-h-[48px] py-3 px-4 sm:px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-left text-xs sm:text-sm text-zinc-500 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center justify-between group cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Reply size={15} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
            <span>Reply to {senderName}...</span>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
            Write message
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="pt-2 animate-fade-in">
      <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-lg space-y-3.5">
        {/* Header: To & Subject */}
        <div className="space-y-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 flex-1 min-w-0">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 w-14 flex-shrink-0">To:</span>
              <input
                type="text"
                value={replyTo}
                onChange={(e) => onChangeTo(e.target.value)}
                placeholder="recipient@example.com"
                className="bg-transparent border-0 focus:outline-none text-zinc-800 dark:text-zinc-200 w-full text-xs font-medium"
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer flex-shrink-0"
              title="Close reply composer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 w-14 flex-shrink-0">Subject:</span>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => onChangeSubject(e.target.value)}
              placeholder="Re: Subject"
              className="bg-transparent border-0 focus:outline-none text-zinc-800 dark:text-zinc-200 w-full text-xs font-semibold"
            />
          </div>
        </div>

        {/* Reply Body Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={6}
            value={replyBody}
            onChange={(e) => onChangeBody(e.target.value)}
            placeholder="Type your response here..."
            className="w-full p-3 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed font-normal"
          />

          {isDraftingReply && (
            <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
              <Loader2 size={16} className="animate-spin" />
              <span>NEXA AI is crafting your response...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <button
            type="button"
            onClick={onAutoDraft}
            disabled={isDraftingReply || isSendingReply}
            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={13} className="text-indigo-500" />
            <span>{replyBody ? 'Regenerate with AI' : 'Draft with NEXA AI'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={onSend}
              disabled={isSendingReply || !replyBody.trim()}
              className="min-h-[38px] flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isSendingReply ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
