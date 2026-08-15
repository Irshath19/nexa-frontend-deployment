import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, Star, ListOrdered, Zap, Search } from 'lucide-react';
import { useContextStore } from '@/app/store';
import { ROUTES, NEXA_SUGGESTED_PROMPTS } from '@/constants';

const iconMap = {
  star: <Star size={13} />,
  list: <ListOrdered size={13} />,
  zap: <Zap size={13} />,
  search: <Search size={13} />,
};

export function NexaQuickAsk() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedAccountId } = useContextStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`${ROUTES.CHAT}?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSuggestion = (prompt: string) => {
    navigate(`${ROUTES.CHAT}?q=${encodeURIComponent(prompt)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <div className="px-4 sm:px-6 mb-5 sm:mb-6">
      <div className="nexa-card overflow-hidden">
        {/* Main input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-zinc-100 dark:border-zinc-800">
          {/* NEXA mark */}
          <span className="text-indigo-500 text-lg flex-shrink-0 font-bold leading-none">✦</span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedAccountId
                ? 'Ask NEXA anything about your emails...'
                : 'Connect an email account to ask NEXA about your emails...'
            }
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
            id="nexa-quick-ask"
            aria-label="Ask NEXA"
          />

          <button
            type="submit"
            disabled={!query.trim()}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send"
          >
            <ArrowUp size={14} />
          </button>
        </form>

        {/* Suggested prompts */}
        <div className="p-3 flex flex-wrap gap-2">
          {NEXA_SUGGESTED_PROMPTS.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestion(suggestion.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-full transition-all duration-150"
            >
              <span className="text-zinc-400 dark:text-zinc-500">
                {iconMap[suggestion.icon as keyof typeof iconMap]}
              </span>
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
