import { format, addDays, subDays, parseISO, isToday, isYesterday, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useContextStore } from '@/app/store';
import { formatDateForApi, cn } from '@/utils';

export function DateBar() {
  const { selectedDate, setSelectedDate } = useContextStore();
  const currentDate = parseISO(selectedDate);

  const isCurrentToday = isToday(currentDate);
  const isCurrentYesterday = isYesterday(currentDate);

  const goToPrev = () => setSelectedDate(formatDateForApi(subDays(currentDate, 1)));
  const goToNext = () => {
    const next = addDays(currentDate, 1);
    if (next <= new Date()) setSelectedDate(formatDateForApi(next));
  };

  const goToToday = () => setSelectedDate(formatDateForApi(new Date()));
  const goToYesterday = () => setSelectedDate(formatDateForApi(subDays(new Date(), 1)));
  const goToThisWeek = () => setSelectedDate(formatDateForApi(startOfWeek(new Date(), { weekStartsOn: 1 })));

  const dateLabel = isCurrentToday
    ? 'Today'
    : isCurrentYesterday
    ? 'Yesterday'
    : format(currentDate, 'MMM d, yyyy');

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
      {/* Date navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrev}
          className="p-1 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Previous day"
          title="Previous day"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-md shadow-2xs">
          <Calendar size={11} className="text-indigo-500" />
          <span>{dateLabel}</span>
        </div>

        <button
          onClick={goToNext}
          disabled={isCurrentToday}
          className="p-1 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next day"
          title="Next day"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick date chips */}
      <div className="flex items-center gap-1">
        {[
          { label: 'Today', action: goToToday, active: isCurrentToday },
          { label: 'Yesterday', action: goToYesterday, active: isCurrentYesterday },
          { label: 'Week', action: goToThisWeek, active: false },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={chip.action}
            className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors',
              chip.active
                ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
