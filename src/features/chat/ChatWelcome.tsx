import { Star, List, Zap, Search, MessageSquare, Sparkles } from 'lucide-react';
import { NEXA_SUGGESTED_PROMPTS } from '@/constants';

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

const iconMap = {
  star: Star,
  list: List,
  zap: Zap,
  search: Search,
  sparkles: Sparkles,
};

export function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 page-enter">
      {/* NEXA mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-3xl leading-none">✦</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            How can I help you today?
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
            Ask questions, brainstorm ideas, write and debug code, or explore technical concepts with NEXA.
          </p>
        </div>
      </div>

      {/* Suggested prompt cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {NEXA_SUGGESTED_PROMPTS.map((suggestion) => {
          const Icon = iconMap[suggestion.icon as keyof typeof iconMap] ?? MessageSquare;
          return (
            <button
              key={suggestion.id}
              onClick={() => onSelectPrompt(suggestion.prompt)}
              className="group flex items-start gap-3 p-4 text-left rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-all duration-150 cursor-pointer"
              id={`suggestion-${suggestion.id}`}
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 flex items-center justify-center flex-shrink-0 transition-colors duration-150">
                <Icon size={14} className="text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 leading-snug">
                  {suggestion.label}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 leading-relaxed">
                  {suggestion.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-8 text-center max-w-sm">
        NEXA is a general-purpose AI assistant. Always verify critical facts and code output.
      </p>
    </div>
  );
}
