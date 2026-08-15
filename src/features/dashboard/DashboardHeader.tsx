import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useAuthStore, useContextStore } from '@/app/store';
import { getGreeting, formatDateForApi } from '@/utils';
import { ROUTES } from '@/constants';

export function DashboardHeader() {
  const { user } = useAuthStore();
  const { selectedDate, setSelectedDate } = useContextStore();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);

  const currentDate = parseISO(selectedDate);
  const isToday = selectedDate === formatDateForApi(new Date());

  const goToPrev = () => setSelectedDate(formatDateForApi(subDays(currentDate, 1)));
  const goToNext = () => {
    const next = addDays(currentDate, 1);
    if (next <= new Date()) setSelectedDate(formatDateForApi(next));
  };
  const goToToday = () => setSelectedDate(formatDateForApi(new Date()));

  const handleAskNexa = () => {
    navigate(ROUTES.CHAT);
  };

  return (
    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Greeting */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {getGreeting(user?.displayName)}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Here's what's happening{' '}
            {isToday ? 'today' : `on ${format(currentDate, 'MMMM d')}`}.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-1 self-start">
          <button
            onClick={goToPrev}
            className="btn-ghost p-1.5"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Calendar size={13} className="text-zinc-400" />
              {isToday ? 'Today' : format(currentDate, 'MMM d, yyyy')}
            </button>
          </div>

          <button
            onClick={goToNext}
            disabled={isToday}
            className="btn-ghost p-1.5 disabled:opacity-40"
            aria-label="Next day"
          >
            <ChevronRight size={16} />
          </button>

          {!isToday && (
            <button
              onClick={goToToday}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1"
            >
              Today
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
