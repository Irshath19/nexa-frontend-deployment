import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Sparkles,
  SlidersHorizontal,
  Bookmark,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/services/api/jobs';
import type {
  JobPosting,
  JobPreferences,
  JobPreferenceUpdatePayload,
  ImmediateJobSearchRequest,
  JobStatus,
} from '@/types/jobs';
import { RegularSearchSection } from './RegularSearchSection';
import { ImmediateSearchSection } from './ImmediateSearchSection';
import { SavedJobsSection } from './SavedJobsSection';
import { JobDetailDrawer } from './JobDetailDrawer';
import { JobPreferencesModal } from './JobPreferencesModal';
import { cn } from '@/utils';
import { toast } from 'sonner';

type SearchMode = 'regular' | 'immediate' | 'saved';

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [activeMode, setActiveMode] = useState<SearchMode>('regular');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Immediate Search custom results state
  const [immediateResults, setImmediateResults] = useState<JobPosting[]>([]);
  const [immediateSummary, setImmediateSummary] = useState('');
  const [isSearchingImmediate, setIsSearchingImmediate] = useState(false);
  const [hasImmediateError, setHasImmediateError] = useState(false);

  // ── 1. Fetch User Job Preferences ────────────────────────────
  const { data: prefData } = useQuery({
    queryKey: ['job-preferences'],
    queryFn: () => jobsApi.getPreferences(),
  });
  const preferences = prefData?.data ?? null;

  // ── 2. Fetch Daily Discovered Opportunities ──────────────────
  const {
    data: dailyData,
    isLoading: isLoadingDaily,
    isRefetching: isRefetchingDaily,
  } = useQuery({
    queryKey: ['jobs-daily'],
    queryFn: () => jobsApi.getDailyOpportunities(),
  });
  const dailyJobs = dailyData?.data?.jobs ?? [];

  // ── 3. Fetch Saved Jobs ──────────────────────────────────────
  const { data: savedData } = useQuery({
    queryKey: ['jobs-saved'],
    queryFn: () => jobsApi.getSavedJobs(),
  });
  const savedJobs = savedData?.data ?? [];

  // ── Update Preferences Mutation ──────────────────────────────
  const { mutateAsync: savePreferences } = useMutation({
    mutationFn: (payload: JobPreferenceUpdatePayload) => jobsApi.updatePreferences(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-daily'] });
    },
  });

  // ── Run Daily Search Now Mutation ───────────────────────────
  const { mutate: runDailySearchNow, isPending: isRunningDailySearch } = useMutation({
    mutationFn: () => jobsApi.runDailySearch(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['jobs-daily'] });
      queryClient.invalidateQueries({ queryKey: ['job-preferences'] });
      toast.success(`NEXA discovered ${res?.data?.jobs?.length ?? 0} live opportunities.`);
    },
    onError: () => toast.error('Unable to run daily search right now.'),
  });

  // ── Toggle Save Mutation ─────────────────────────────────────
  const { mutate: toggleSaveJob } = useMutation({
    mutationFn: async (job: JobPosting) => {
      if (job.isSaved) {
        await jobsApi.removeSavedJob(job.id);
        return { isSaved: false, job };
      } else {
        await jobsApi.saveJob(job.id, job);
        return { isSaved: true, job };
      }
    },
    onSuccess: ({ isSaved, job }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs-saved'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-daily'] });
      toast.success(isSaved ? `Saved "${job.title}"` : `Removed "${job.title}" from saved`);

      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, isSaved, status: isSaved ? 'saved' : 'none' });
      }
    },
    onError: () => toast.error('Unable to update saved status.'),
  });

  // ── Update Application Status Mutation ───────────────────────
  const { mutate: updateJobStatus } = useMutation({
    mutationFn: ({ job, status }: { job: JobPosting; status: JobStatus }) =>
      jobsApi.updateJobStatus(job.id, status, job),
    onSuccess: (_, { job, status }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs-saved'] });
      queryClient.invalidateQueries({ queryKey: ['jobs-daily'] });
      toast.success(`Marked as ${status}`);

      if (selectedJob?.id === job.id) {
        setSelectedJob({ ...selectedJob, status, isSaved: status !== 'none' });
      }
    },
    onError: () => toast.error('Unable to update application status.'),
  });

  // ── Immediate Search Handler ─────────────────────────────────
  const handleImmediateSearch = async (req: ImmediateJobSearchRequest) => {
    setIsSearchingImmediate(true);
    setHasImmediateError(false);
    try {
      const res = await jobsApi.searchImmediate(req);
      if (res.data) {
        setImmediateResults(res.data.jobs);
        setImmediateSummary(res.data.querySummary);
      }
    } catch (err: any) {
      console.error('Immediate search error:', err);
      setHasImmediateError(true);
      toast.error('Unable to retrieve jobs from the job provider.');
    } finally {
      setIsSearchingImmediate(false);
    }
  };

  // Pre-seed immediate results on first view if empty
  React.useEffect(() => {
    if (activeMode === 'immediate' && immediateResults.length === 0 && !isSearchingImmediate) {
      handleImmediateSearch({ jobTitle: 'AI Engineer', location: 'Remote' });
    }
  }, [activeMode]);

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950 overflow-y-auto">
      {/* ── GLOBAL STICKY JOBS HEADER ─────────────────────────── */}
      <header className="px-6 py-5 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                <Briefcase size={18} />
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Jobs
              </h1>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Let NEXA search and rank real job opportunities from verified providers.
            </p>
          </div>

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 self-start md:self-auto text-xs font-semibold">
            {/* Regular Search Tab */}
            <button
              onClick={() => setActiveMode('regular')}
              className={cn(
                'px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                activeMode === 'regular'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Sparkles size={13} />
              <span>Regular Search</span>
            </button>

            {/* Immediate Search Tab */}
            <button
              onClick={() => setActiveMode('immediate')}
              className={cn(
                'px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                activeMode === 'immediate'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Search size={13} />
              <span>Immediate Search</span>
            </button>

            {/* Saved Jobs Tab */}
            <button
              onClick={() => setActiveMode('saved')}
              className={cn(
                'px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5',
                activeMode === 'saved'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              <Bookmark size={13} />
              <span>Saved Jobs</span>
              {savedJobs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] flex items-center justify-center font-bold">
                  {savedJobs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ───────────────────────────── */}
      <main className="flex-1 p-6 sm:p-8 max-w-6xl w-full mx-auto pb-16">
        {/* TAB 1: REGULAR SEARCH */}
        {activeMode === 'regular' && (
          <RegularSearchSection
            preferences={preferences}
            jobs={dailyJobs}
            isLoading={isLoadingDaily || isRefetchingDaily}
            selectedJob={selectedJob}
            onSelectJob={(job) => setSelectedJob(job)}
            onToggleSave={(job) => toggleSaveJob(job)}
            onOpenPreferences={() => setIsPreferencesModalOpen(true)}
            onToggleDailySearch={async (enabled) => {
              if (preferences) {
                await savePreferences({
                  jobTitles: preferences.jobTitles,
                  salaryMin: preferences.salaryMin,
                  salaryMax: preferences.salaryMax,
                  salaryCurrency: preferences.salaryCurrency,
                  experienceLevels: preferences.experienceLevels,
                  locations: preferences.locations,
                  workModes: preferences.workModes,
                  employmentTypes: preferences.employmentTypes,
                  skills: preferences.skills,
                  dailySearchEnabled: enabled,
                });
                toast.success(enabled ? 'Daily search activated.' : 'Daily search paused.');
              }
            }}
            onRunDailySearchNow={() => runDailySearchNow()}
            isRunningSearch={isRunningDailySearch}
          />
        )}

        {/* TAB 2: IMMEDIATE SEARCH */}
        {activeMode === 'immediate' && (
          <ImmediateSearchSection
            jobs={immediateResults}
            isLoading={isSearchingImmediate}
            onSearch={handleImmediateSearch}
            selectedJob={selectedJob}
            onSelectJob={(job) => setSelectedJob(job)}
            onToggleSave={(job) => toggleSaveJob(job)}
            searchSummary={immediateSummary}
            hasError={hasImmediateError}
          />
        )}

        {/* TAB 3: SAVED JOBS */}
        {activeMode === 'saved' && (
          <SavedJobsSection
            savedJobs={savedJobs}
            selectedJob={selectedJob}
            onSelectJob={(job) => setSelectedJob(job)}
            onToggleSave={(job) => toggleSaveJob(job)}
            onUpdateStatus={(job, status) => updateJobStatus({ job, status })}
          />
        )}
      </main>

      {/* ── JOB DETAILS RIGHT DRAWER ─────────────────────────── */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onToggleSave={(job) => toggleSaveJob(job)}
        onUpdateStatus={(job, status) => updateJobStatus({ job, status })}
      />

      {/* ── JOB PREFERENCES MODAL ────────────────────────────── */}
      {isPreferencesModalOpen && preferences && (
        <JobPreferencesModal
          preferences={preferences}
          onClose={() => setIsPreferencesModalOpen(false)}
          onSave={async (payload) => {
            await savePreferences(payload);
          }}
        />
      )}
    </div>
  );
}
