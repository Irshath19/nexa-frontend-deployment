import { useState, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useContextStore } from '@/app/store';
import { debounce } from '@/utils';

export function EmailSearch() {
  const { searchQuery, setSearchQuery } = useContextStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSetSearch = useCallback(
    debounce((q: string) => setSearchQuery(q), 300),
    [setSearchQuery]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocalQuery(v);
    debouncedSetSearch(v);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={localQuery}
          onChange={handleChange}
          placeholder="Search subjects, senders, content..."
          className="w-full bg-zinc-100/80 dark:bg-zinc-800/60 border border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-500/40 rounded-lg pl-7 pr-7 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-colors"
          id="email-search-input"
          aria-label="Search emails"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
