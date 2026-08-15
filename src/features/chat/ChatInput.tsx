import { useState, useRef, useCallback } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function ChatInput({ onSend, onCancel, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSend(trimmed);
  }, [value, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <div className={cn(
          'flex items-end gap-3 p-3 rounded-xl border transition-colors duration-150',
          'bg-white dark:bg-zinc-900',
          isLoading
            ? 'border-indigo-300 dark:border-indigo-700'
            : 'border-zinc-200 dark:border-zinc-700 focus-within:border-indigo-400 dark:focus-within:border-indigo-600'
        )}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'NEXA is thinking...' : 'Ask NEXA anything...'}
            disabled={isLoading || disabled}
            rows={1}
            className={cn(
              'flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100',
              'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'outline-none resize-none leading-relaxed',
              'disabled:opacity-60'
            )}
            style={{ minHeight: '24px', maxHeight: '160px' }}
            id="chat-input"
            aria-label="Message NEXA"
          />

          {/* Send / Stop button */}
          {isLoading ? (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-red-100 dark:hover:bg-red-900 flex items-center justify-center flex-shrink-0 transition-colors"
              aria-label="Stop generating"
              title="Stop"
            >
              <Square size={14} className="text-zinc-600 dark:text-zinc-300" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!value.trim() || disabled}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150',
                value.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              )}
              aria-label="Send message"
            >
              <ArrowUp size={15} />
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 text-center mt-2">
          Press <kbd className="px-1 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
