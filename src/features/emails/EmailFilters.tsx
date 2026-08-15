import { useContextStore } from '@/app/store';
import { EMAIL_FILTERS } from '@/constants';
import { cn } from '@/utils';
import type { EmailFilter } from '@/types';

export function EmailFilters() {
  const { emailFilter, setEmailFilter } = useContextStore();

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 overflow-x-auto scrollbar-none bg-zinc-50/40 dark:bg-zinc-900/40">
      {EMAIL_FILTERS.map((filter) => {
        const isActive = emailFilter === filter.value;
        return (
          <button
            key={filter.value}
            onClick={() => setEmailFilter(filter.value as EmailFilter)}
            className={cn(
              'text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-all duration-150',
              isActive
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
            )}
            aria-pressed={isActive}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
