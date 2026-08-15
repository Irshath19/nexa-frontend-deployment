import React from 'react';
import {
  X,
  ExternalLink,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Building2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Users,
  Award,
  ChevronRight,
} from 'lucide-react';
import type { JobPosting, JobStatus } from '@/types/jobs';
import { cn } from '@/utils';
import { toast } from 'sonner';

interface JobDetailDrawerProps {
  job: JobPosting | null;
  onClose: () => void;
  onToggleSave: (job: JobPosting) => void;
  onUpdateStatus: (job: JobPosting, status: JobStatus) => void;
}

const STATUS_OPTIONS: { label: string; value: JobStatus; color: string }[] = [
  { label: 'Saved', value: 'saved', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300' },
  { label: 'Interested', value: 'interested', color: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' },
  { label: 'Applied', value: 'applied', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' },
  { label: 'Interview', value: 'interview', color: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' },
  { label: 'Rejected', value: 'rejected', color: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' },
  { label: 'Closed', value: 'closed', color: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400' },
];

export function JobDetailDrawer({
  job,
  onClose,
  onToggleSave,
  onUpdateStatus,
}: JobDetailDrawerProps) {
  if (!job) return null;

  const handleApplyClick = () => {
    if (!job.sourceUrl) {
      toast.error('Job source URL unavailable.');
      return;
    }
    window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-slide-in-right">
        {/* Sticky Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Job Details
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              via {job.source}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(job)}
              className={cn(
                'p-2 rounded-xl border transition-all cursor-pointer',
                job.isSaved
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
              title={job.isSaved ? 'Saved' : 'Save Job'}
            >
              {job.isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin">
          {/* Main Title & Company */}
          <div className="flex items-start gap-4">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-zinc-50"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center flex-shrink-0 shadow-md">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
                {job.title}
              </h2>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {job.company}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-zinc-400" />
                  {job.location}
                </span>
                <span>·</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  {job.employmentType} ({job.workMode})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-zinc-400" />
                  Posted {job.postedAgo}
                </span>
              </div>
            </div>
          </div>

          {/* ── STATUS TRACKER BAR ─────────────────────────────── */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Application Status:
              </span>
              <span className="text-xs font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                {job.status === 'none' ? 'Not tracked' : job.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onUpdateStatus(job, opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border',
                    job.status === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PROMINENT APPLY / VIEW BUTTON ──────────────────── */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleApplyClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
            >
              <span>Apply / View Job on {job.source}</span>
              <ExternalLink size={16} />
            </button>
          </div>

          {/* ── KEY SPECS GRID ─────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Salary Range</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {job.salaryFormatted || `${job.salaryCurrency} ${job.salaryMin} - ${job.salaryMax}`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Experience Level</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {job.experienceLabel || `${job.experienceMin || 0}–${job.experienceMax || 3} yrs`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Candidate Info</span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {job.candidateCount ? `${job.candidateCount.toLocaleString()} Interested` : 'Source data unavailable'}
              </p>
            </div>
          </div>

          {/* ── NEXA AI MATCH ANALYSIS ─────────────────────────── */}
          {job.nexaMatchScore !== undefined && job.nexaMatchScore !== null && (
            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/20 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ✦
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    NEXA MATCH ANALYSIS
                  </span>
                </div>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/80 px-2.5 py-0.5 rounded-full">
                  {job.nexaMatchScore}% Match
                </span>
              </div>

              {job.matchReasons && job.matchReasons.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {job.matchReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                      <span>{reason.replace(/^✓\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── JOB DESCRIPTION ────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              About the Role
            </h3>
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
              {job.description}
            </p>
          </div>

          {/* ── RESPONSIBILITIES ───────────────────────────────── */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Key Responsibilities
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-normal">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-indigo-500 font-bold mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── REQUIREMENTS ───────────────────────────────────── */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Requirements & Qualifications
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-normal">
                {job.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-indigo-500 font-bold mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── REQUIRED SKILLS ────────────────────────────────── */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── PERKS & BENEFITS ───────────────────────────────── */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Perks & Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                {job.benefits.map((benefit, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2">
                    <Award size={14} className="text-indigo-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
