import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sparkles,
  ArrowUpDown,
  Loader2,
  Briefcase,
  MapPin,
  Clock,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import type { JobPosting, ImmediateJobSearchRequest } from '@/types/jobs';
import { JobCard } from './JobCard';
import { cn } from '@/utils';

interface ImmediateSearchSectionProps {
  jobs: JobPosting[];
  isLoading: boolean;
  onSearch: (req: ImmediateJobSearchRequest) => Promise<void>;
  selectedJob: JobPosting | null;
  onSelectJob: (job: JobPosting) => void;
  onToggleSave: (job: JobPosting) => void;
  searchSummary: string;
  hasError?: boolean;
}

const SEARCH_STEPS = [
  'Searching live job sources...',
  'Searching LinkedIn, Naukri, Indeed, Wellfound, and live feeds...',
  'Analyzing job descriptions & qualifications...',
  'Deduplicating cross-platform listings...',
  'Sorting by Newest First...',
];

export function ImmediateSearchSection({
  jobs,
  isLoading,
  onSearch,
  selectedJob,
  onSelectJob,
  onToggleSave,
  searchSummary,
  hasError = false,
}: ImmediateSearchSectionProps) {
  const [jobTitle, setJobTitle] = useState('AI Engineer');
  const [location, setLocation] = useState('India');
  const [workMode, setWorkMode] = useState('All');
  const [experience, setExperience] = useState('All');
  const [postedWithin, setPostedWithin] = useState('7 days');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'best_match' | 'salary_high' | 'salary_low'>('newest');

  // Filter & Pagination State
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Rotate loading steps
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % SEARCH_STEPS.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isLoading]);

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

  // Reset pagination on search or filter change
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      jobTitle: jobTitle.trim(),
      location: location.trim() === 'All' ? undefined : location.trim(),
      workMode: workMode === 'All' ? undefined : workMode,
      experience: experience === 'All' ? undefined : experience,
      postedWithin,
      sortBy,
    });
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'best_match' | 'salary_high' | 'salary_low') => {
    setSortBy(newSort);
    onSearch({
      jobTitle: jobTitle.trim(),
      location: location.trim() === 'All' ? undefined : location.trim(),
      workMode: workMode === 'All' ? undefined : workMode,
      experience: experience === 'All' ? undefined : experience,
      postedWithin,
      sortBy: newSort,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── FIND JOBS NOW (SEARCH PANEL) ────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Search size={15} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Find Jobs Now
            </h2>
            <p className="text-xs text-zinc-500">
              Discovers live job postings across LinkedIn, Naukri, Indeed, Wellfound, and live feeds sorted Newest First.
            </p>
          </div>
        </div>

        {/* Primary Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Job Title */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Job Title / Keyword
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
              <Briefcase size={14} className="text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. AI Engineer, Python Developer"
                className="bg-transparent border-0 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Location / Country
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
              <MapPin size={14} className="text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. India, Remote, Bengaluru, USA"
                className="bg-transparent border-0 focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Work Modes</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          {/* Posted Within */}
          <div>
            <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Posted Within
            </label>
            <select
              value={postedWithin}
              onChange={(e) => setPostedWithin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="24 hours">Past 24 hours</option>
              <option value="3 days">Past 3 days</option>
              <option value="7 days">Past 7 days</option>
              <option value="30 days">Past 30 days</option>
            </select>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400">
            Searches LinkedIn, Naukri, Indeed, Wellfound, Glassdoor, Remote OK, and Remotive in real-time.
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            <span>{isLoading ? 'Searching ecosystem...' : 'Search Jobs'}</span>
          </button>
        </div>
      </form>

      {/* ── STEP-BY-STEP ANIMATED LOADING STATE ──────────────── */}
      {isLoading && (
        <div className="p-8 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-center space-y-3 animate-fade-in">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles size={18} className="animate-spin" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
              {SEARCH_STEPS[loadingStepIndex]}
            </h4>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
              Querying multi-platform search engines and sorting real job postings chronologically.
            </p>
          </div>
        </div>
      )}

      {/* ── SEARCH RESULTS & PLATFORM FILTER BAR ─────────────── */}
      {!isLoading && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Search Results</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {filteredJobs.length} {selectedSource !== 'All' ? `${selectedSource} ` : ''}Jobs
                </span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {searchSummary || `Jobs matching your criteria for '${jobTitle}'`}
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
                    onChange={(e) => handleSortChange(e.target.value as any)}
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

          {hasError ? (
            /* Error State */
            <div className="p-12 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Filter size={20} />
              </div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                Unable to retrieve jobs right now
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 max-w-sm mx-auto">
                We encountered an issue communicating with the search providers. Please try again.
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Briefcase size={20} />
              </div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                No matching jobs found
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try expanding your search query or removing filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setJobTitle('');
                  setLocation('India');
                  setWorkMode('All');
                  setSelectedSource('All');
                  onSearch({});
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Clear Filters & Search All
              </button>
            </div>
          ) : (
            <>
              {/* Grid of Results */}
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
          )}
        </div>
      )}
    </div>
  );
}
