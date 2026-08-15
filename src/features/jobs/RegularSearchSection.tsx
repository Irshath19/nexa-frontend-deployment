import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  Settings,
  SlidersHorizontal,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Globe,
  ChevronLeft,
} from 'lucide-react';
import type { JobPosting, JobPreferences } from '@/types/jobs';
import { JobCard } from './JobCard';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface RegularSearchSectionProps {
  preferences: JobPreferences | null;
  jobs: JobPosting[];
  isLoading: boolean;
  selectedJob: JobPosting | null;
  onSelectJob: (job: JobPosting) => void;
  onToggleSave: (job: JobPosting) => void;
  onOpenPreferences: () => void;
  onToggleDailySearch: (enabled: boolean) => void;
  onRunDailySearchNow: () => void;
  isRunningSearch: boolean;
}

export function RegularSearchSection({
  preferences,
  jobs,
  isLoading,
  selectedJob,
  onSelectJob,
  onToggleSave,
  onOpenPreferences,
  onToggleDailySearch,
  onRunDailySearchNow,
  isRunningSearch,
}: RegularSearchSectionProps) {
  const isEnabled = preferences?.dailySearchEnabled ?? true;

  // Filter & Pagination State (Newest first default)
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'best_match' | 'salary_high' | 'salary_low'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Extract distinct sources from discovered jobs
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.source) set.add(j.source);
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Filter and sort jobs (Newest first default)
  const filteredJobs = useMemo(() => {
    let list = [...jobs];
    if (selectedSource !== 'All') {
      list = list.filter((j) => j.source === selectedSource);
    }

    if (sortBy === 'newest') {
      const valid = list.filter((j) => j.postedAt);
      valid.sort((a, b) => new Date(b.postedAt!).getTime() - new Date(a.postedAt!).getTime());
      const invalid = list.filter((j) => !j.postedAt);
      list = [...valid, ...invalid];
    } else if (sortBy === 'oldest') {
      const valid = list.filter((j) => j.postedAt);
      valid.sort((a, b) => new Date(a.postedAt!).getTime() - new Date(b.postedAt!).getTime());
      const invalid = list.filter((j) => !j.postedAt);
      list = [...valid, ...invalid];
    } else if (sortBy === 'best_match') {
      list.sort((a, b) => (b.nexaMatchScore || 0) - (a.nexaMatchScore || 0));
    } else if (sortBy === 'salary_high') {
      list.sort((a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0));
    } else if (sortBy === 'salary_low') {
      list.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
    }

    return list;
  }, [jobs, selectedSource, sortBy]);

  // Reset pagination on filter or jobs change
  useEffect(() => {
    setCurrentPage(1);
  }, [jobs, selectedSource, pageSize]);

  // Paginated slice
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const displayedJobs = useMemo(() => {
    if (pageSize >= 9999) return filteredJobs;
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage, pageSize]);

  const lastSearchTime = preferences?.lastSearchAt
    ? new Date(preferences.lastSearchAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '8:00 AM IST';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── DAILY SEARCH CONFIGURATION CARD ──────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
              ✦
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Daily Job Search
                </h2>
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1',
                    isEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400')} />
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                NEXA automatically discovers new jobs across the web every morning at 8:00 AM IST.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Run search now */}
            <button
              onClick={onRunDailySearchNow}
              disabled={isRunningSearch}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Run daily agent right now"
            >
              <RefreshCw size={13} className={cn(isRunningSearch && 'animate-spin text-indigo-600')} />
              <span>{isRunningSearch ? 'Searching...' : 'Run Now'}</span>
            </button>

            {/* Edit Preferences */}
            <button
              onClick={onOpenPreferences}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>Edit Preferences</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">Schedule</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
              <Calendar size={13} className="text-indigo-500" />
              <span>Daily at 8:00 AM IST</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">Last Run</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
              <Clock size={13} className="text-indigo-500" />
              <span>{lastSearchTime}</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">Jobs Discovered</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {jobs.length} Opportunities
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-medium">Status</span>
            <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>{preferences?.lastSearchStatus || 'Completed'}</span>
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60 dark:border-indigo-900/40 text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">
            Automatic Daily Discovery Agent
          </span>
          <button
            onClick={() => onToggleDailySearch(!isEnabled)}
            className={cn(
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer',
              isEnabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
            )}
          >
            <span
              className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform',
                isEnabled ? 'translate-x-4.5' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* ── TODAY'S OPPORTUNITIES HEADER ─────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Today's Opportunities</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {filteredJobs.length} {selectedSource !== 'All' ? `${selectedSource} ` : ''}Jobs
              </span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ranked opportunities matched with your configured preferences (Newest First).
            </p>
          </div>

          {/* Sort & Page Size Controls */}
          {jobs.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap text-xs">
              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown size={13} className="text-zinc-400" />
                <span className="text-zinc-500 font-medium">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First (Default)</option>
                  <option value="oldest">Oldest First</option>
                  <option value="best_match">Best Match</option>
                  <option value="salary_high">Salary: High to Low</option>
                  <option value="salary_low">Salary: Low to High</option>
                </select>
              </div>

              {/* Page Size */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-medium">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={99999}>All ({filteredJobs.length})</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Source Filter Tabs (LinkedIn, Naukri, Indeed, etc.) */}
        {availableSources.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pb-1">
            <span className="text-xs font-bold text-zinc-400 mr-1 flex items-center gap-1">
              <Globe size={12} /> Sources:
            </span>

            <button
              onClick={() => setSelectedSource('All')}
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                selectedSource === 'All'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
              )}
            >
              All ({jobs.length})
            </button>

            {availableSources.map((src) => {
              const count = jobs.filter((j) => j.source === src).length;
              return (
                <button
                  key={src}
                  onClick={() => setSelectedSource(src)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border',
                    selectedSource === src
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  )}
                >
                  {src} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="p-12 text-center space-y-3">
            <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-zinc-500">
              NEXA is discovering new opportunities and sorting Newest First...
            </p>
          </div>
        )}

        {/* Jobs Grid & Empty State */}
        {!isLoading && filteredJobs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Briefcase size={20} />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No new jobs found matching your criteria
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Try adjusting your target job titles, experience level, or locations in preferences.
            </p>
            <button
              onClick={onOpenPreferences}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
            >
              Update Preferences
            </button>
          </div>
        ) : (
          !isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onSelect={onSelectJob}
                    onToggleSave={onToggleSave}
                    isSelected={selectedJob?.id === job.id}
                  />
                ))}
              </div>

              {/* ── PAGINATION CONTROLS ───────────────────────── */}
              {pageSize < 9999 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800 text-xs">
                  <span className="text-zinc-500">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length} jobs
                  </span>

                  <div className="flex items-center gap-1.5 self-center sm:self-auto">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1 px-2 font-bold text-zinc-700 dark:text-zinc-300">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
