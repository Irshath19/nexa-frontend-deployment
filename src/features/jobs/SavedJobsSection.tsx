import React, { useState } from 'react';
import { Bookmark, Briefcase, Trash2, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';
import type { JobPosting, JobStatus } from '@/types/jobs';
import { JobCard } from './JobCard';
import { cn } from '@/utils';

interface SavedJobsSectionProps {
  savedJobs: JobPosting[];
  selectedJob: JobPosting | null;
  onSelectJob: (job: JobPosting) => void;
  onToggleSave: (job: JobPosting) => void;
  onUpdateStatus: (job: JobPosting, status: JobStatus) => void;
}

export function SavedJobsSection({
  savedJobs,
  selectedJob,
  onSelectJob,
  onToggleSave,
  onUpdateStatus,
}: SavedJobsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredJobs = savedJobs.filter((job) => {
    if (activeFilter === 'all') return true;
    return job.status === activeFilter;
  });

  const counts = {
    all: savedJobs.length,
    saved: savedJobs.filter((j) => j.status === 'saved' || j.status === 'none').length,
    applied: savedJobs.filter((j) => j.status === 'applied').length,
    interview: savedJobs.filter((j) => j.status === 'interview').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Saved & Tracked Jobs</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              {savedJobs.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track your bookmarks, active applications, and interview statuses.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
              activeFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            )}
          >
            All ({counts.all})
          </button>

          <button
            onClick={() => setActiveFilter('saved')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
              activeFilter === 'saved'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            )}
          >
            Saved ({counts.saved})
          </button>

          <button
            onClick={() => setActiveFilter('applied')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
              activeFilter === 'applied'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            )}
          >
            Applied ({counts.applied})
          </button>

          <button
            onClick={() => setActiveFilter('interview')}
            className={cn(
              'px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border',
              activeFilter === 'interview'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
            )}
          >
            Interview ({counts.interview})
          </button>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Bookmark size={20} />
          </div>
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            No saved jobs in this filter
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Click the bookmark icon on any opportunity card to save it for easy tracking later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onToggleSave={onToggleSave}
              isSelected={selectedJob?.id === job.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
