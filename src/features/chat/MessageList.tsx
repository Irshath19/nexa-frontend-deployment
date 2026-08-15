import { useState, type RefObject } from 'react';
import { Check, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { getInitials, cn } from '@/utils';
import { useAuthStore } from '@/app/store';
import type { ChatMessage, ProgressStep } from '@/types';
import { MarkdownContent } from './MarkdownContent';
import { toast } from 'sonner';

interface MessageListProps {
  messages: ChatMessage[];
  streamingContent: string;
  progressSteps: ProgressStep[];
  isThinking: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onRegenerate?: () => void;
}

export function MessageList({
  messages,
  streamingContent,
  progressSteps,
  isThinking,
  messagesEndRef,
  onRegenerate,
}: MessageListProps) {
  const { user } = useAuthStore();

  return (
    <div className="px-3 sm:px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((message, index) => {
        const isLastAssistant =
          message.role === 'assistant' &&
          index === messages.length - 1 &&
          !isThinking;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            userName={user?.displayName ?? 'You'}
            isLastAssistant={isLastAssistant}
            onRegenerate={onRegenerate}
          />
        );
      })}

      {/* NEXA thinking / streaming state */}
      {isThinking && (
        <NexaThinkingBubble
          progressSteps={progressSteps}
          streamingContent={streamingContent}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubble({
  message,
  userName,
  isLastAssistant,
  onRegenerate,
}: {
  message: ChatMessage;
  userName: string;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-2.5 sm:gap-3 group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%]">
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-indigo-600 text-white text-xs sm:text-sm font-normal leading-relaxed whitespace-pre-wrap shadow-xs break-words">
            {message.content}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 mt-1 flex items-center gap-1 cursor-pointer"
            title="Copy user message"
          >
            {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex-shrink-0 mt-0.5 shadow-2xs">
          {getInitials(userName)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-3 group">
      {/* NEXA avatar */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <span className="font-bold text-xs leading-none">✦</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs sm:text-sm shadow-2xs">
          <MarkdownContent content={message.content} />
        </div>

        {/* Action toolbar */}
        <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-zinc-400">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy response"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {isLastAssistant && onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Regenerate response"
            >
              <RefreshCw size={12} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NexaThinkingBubble({
  progressSteps,
  streamingContent,
}: {
  progressSteps: ProgressStep[];
  streamingContent: string;
}) {
  return (
    <div className="flex gap-2.5 sm:gap-3 animate-fade-in">
      {/* NEXA avatar */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <span className="font-bold text-xs leading-none animate-pulse">✦</span>
      </div>

      <div className="space-y-2 max-w-2xl flex-1 min-w-0">
        {/* Progress steps */}
        {progressSteps.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs">
            {progressSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.status === 'done' ? (
                  <Check size={12} className="text-emerald-500 flex-shrink-0" />
                ) : step.status === 'active' ? (
                  <Loader2 size={12} className="text-indigo-500 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-600 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    'text-xs',
                    step.status === 'done'
                      ? 'text-zinc-500 dark:text-zinc-400'
                      : 'text-zinc-800 dark:text-zinc-200 font-semibold'
                  )}
                >
                  {step.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Streaming content */}
        {streamingContent && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-800 text-xs sm:text-sm shadow-2xs">
            <MarkdownContent content={streamingContent} />
            <span className="inline-block w-1.5 h-3.5 bg-indigo-500 animate-pulse ml-1 align-middle" />
          </div>
        )}

        {/* Default thinking state */}
        {!streamingContent && progressSteps.length === 0 && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 font-medium animate-pulse">
            <Loader2 size={13} className="animate-spin text-indigo-500" />
            <span>Assistant is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
