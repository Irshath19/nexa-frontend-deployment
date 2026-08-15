import type { RefObject } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { getInitials } from '@/utils';
import { useAuthStore } from '@/app/store';
import type { ChatMessage, ProgressStep } from '@/types';
import { MarkdownContent } from './MarkdownContent';

interface MessageListProps {
  messages: ChatMessage[];
  streamingContent: string;
  progressSteps: ProgressStep[];
  isThinking: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  streamingContent,
  progressSteps,
  isThinking,
  messagesEndRef,
}: MessageListProps) {
  const { user } = useAuthStore();

  return (
    <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} userName={user?.displayName ?? 'You'} />
      ))}

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

function MessageBubble({ message, userName }: { message: ChatMessage; userName: string }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end gap-3">
        <div className="chat-message-user font-medium whitespace-pre-wrap">
          {message.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
          {getInitials(userName)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* NEXA avatar */}
      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs leading-none">✦</span>
      </div>

      <div className="chat-message-nexa flex-1 min-w-0">
        <MarkdownContent content={message.content} />
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
    <div className="flex gap-3">
      {/* NEXA avatar */}
      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs leading-none animate-pulse">✦</span>
      </div>

      <div className="space-y-2 max-w-2xl flex-1 min-w-0">
        {/* Progress steps */}
        {progressSteps.length > 0 && (
          <div className="space-y-1.5">
            {progressSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                {step.status === 'done' ? (
                  <Check size={12} className="text-emerald-500 flex-shrink-0" />
                ) : step.status === 'active' ? (
                  <Loader2 size={12} className="text-indigo-500 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-600 flex-shrink-0" />
                )}
                <span className={`text-xs ${step.status === 'done' ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                  {step.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Streaming content */}
        {streamingContent && (
          <div className="chat-message-nexa">
            <MarkdownContent content={streamingContent} />
            {/* Pulsing cursor indicator */}
            <span className="inline-block w-1.5 h-3.5 bg-indigo-500 animate-pulse ml-1 align-middle" />
          </div>
        )}

        {/* Default thinking state */}
        {!streamingContent && progressSteps.length === 0 && (
          <div className="flex items-center gap-2 py-1">
            <span className="thinking-dots text-zinc-400">
              <span /><span /><span />
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">NEXA is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}
