import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Users,
  Building2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import type { JobPosting, JobStatus } from '@/types/jobs';
import { cn } from '@/utils';

export function formatRelativePostingTime(postedAt?: string | null): string {
  if (!postedAt) return 'Posted date unavailable';
  try {
    const dt = new Date(postedAt);
    if (isNaN(dt.getTime())) return 'Posted date unavailable';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - dt.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    if (diffSec < 172800) {
      return 'Yesterday';
    }
    const days = Math.floor(diffSec / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } catch {
    return 'Posted date unavailable';
  }
}

interface JobCardProps {
  job: JobPosting;
  onSelect: (job: JobPosting) => void;
  onToggleSave: (job: JobPosting) => void;
  isSelected?: boolean;
}

export function JobCard({
  job,
  onSelect,
  onToggleSave,
  isSelected = false,
}: JobCardProps) {
  const [showMatchDetails, setShowMatchDetails] = useState(false);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'applied':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 size={10} /> Applied
          </span>
        );
      case 'interview':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Interview
          </span>
        );
      case 'interested':
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
            Interested
          </span>
        );
      default:
        return null;
    }
  };

  const formattedSalary =
    job.salaryFormatted ||
    (job.salaryMin && job.salaryMax
      ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
      : job.salaryMin
      ? `From ${job.salaryCurrency} ${job.salaryMin.toLocaleString()}`
      : 'Not specified');

  const formattedExperience =
    job.experienceLabel ||
    (job.experienceMin !== null && job.experienceMin !== undefined
      ? `${job.experienceMin}${job.experienceMax ? `–${job.experienceMax}` : '+'} years`
      : 'Not specified');

  const relativeTime = formatRelativePostingTime(job.postedAt);

  return (
    <div
      onClick={() => onSelect(job)}
      className={cn(
        'group relative p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between gap-4',
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/10'
          : 'border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      )}
    >
      {/* Top row: Company Avatar + Title + Save Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-11 h-11 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800 flex-shrink-0 bg-zinc-50"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                {job.title}
              </h3>
              {getStatusBadge(job.status)}
            </div>

            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
              {job.company}
            </p>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 truncate">
                <MapPin size={11} className="text-zinc-400 flex-shrink-0" />
                {job.location}
              </span>
              <span>·</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {job.workMode}
              </span>
            </div>
          </div>
        </div>

        {/* Save Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(job);
          }}
          className={cn(
            'p-2 rounded-xl border transition-all flex-shrink-0 cursor-pointer',
            job.isSaved
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800'
          )}
          title={job.isSaved ? 'Remove from saved' : 'Save job'}
        >
          {job.isSaved ? <BookmarkCheck size={16} className="fill-indigo-600/20" /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Middle: Salary + Experience + NEXA Match */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-1">
        {/* Salary */}
        <div className="p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[10px] text-zinc-400 font-medium uppercase">Salary</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {formattedSalary}
          </p>
        </div>

        {/* Experience */}
        <div className="p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-[10px] text-zinc-400 font-medium uppercase">Experience</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {formattedExperience}
          </p>
        </div>

        {/* NEXA Match */}
        <div
          onMouseEnter={() => setShowMatchDetails(true)}
          onMouseLeave={() => setShowMatchDetails(false)}
          className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 col-span-2 sm:col-span-1 relative"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} /> Match
            </span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              {job.nexaMatchScore !== null && job.nexaMatchScore !== undefined ? `${job.nexaMatchScore}%` : 'Analysis'}
            </span>
          </div>

          {/* Hover explanation popup */}
          {showMatchDetails && job.matchReasons && job.matchReasons.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-56 p-3 rounded-xl bg-zinc-900 text-white text-[11px] shadow-xl z-30 border border-zinc-800 animate-fade-in space-y-1">
              <p className="font-bold text-indigo-300 text-[10px] uppercase">Why NEXA Matched:</p>
              {job.matchReasons.map((r, idx) => (
                <p key={idx} className="leading-tight text-zinc-300">
                  {r}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skills Chips */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills.slice(0, 4).map((skill, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 text-zinc-400">
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Bottom row: Posted time (Dynamic Relative) + Source + Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2.5 truncate">
          <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
            <Clock size={11} className="text-zinc-400" />
            {relativeTime}
          </span>

          <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
            {job.source}
          </span>

          {/* Candidate Count: ONLY display if provider explicitly returns it */}
          {job.candidateCount ? (
            <span className="hidden sm:flex items-center gap-1 text-zinc-500 font-medium">
              <Users size={11} className="text-zinc-400" />
              {job.candidateCount.toLocaleString()} interested
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (job.sourceUrl) {
                window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
              }
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Open original job posting URL"
          >
            <ExternalLink size={13} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job);
            }}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>View Job</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
