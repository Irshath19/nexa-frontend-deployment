import React from 'react';
import {
  Sparkles,
  Reply,
  CheckSquare,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils';

interface NexaActionsBarProps {
  isDraftingReply: boolean;
  isExtractingTasks: boolean;
  isAddingToCalendar: boolean;
  isExplaining: boolean;
  onDraftReply: () => void;
  onExtractTasks: () => void;
  onAddToCalendar: () => void;
  onExplainEmail: () => void;
}

export function NexaActionsBar({
  isDraftingReply,
  isExtractingTasks,
  isAddingToCalendar,
  isExplaining,
  onDraftReply,
  onExtractTasks,
  onAddToCalendar,
  onExplainEmail,
}: NexaActionsBarProps) {
  const isAnyLoading = isDraftingReply || isExtractingTasks || isAddingToCalendar || isExplaining;

  return (
    <div className="pt-2">
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ✦
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              NEXA Email Actions
            </span>
          </div>

          {isAnyLoading && (
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              <span>NEXA AI working...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
          {/* 1. DRAFT REPLY */}
          <button
            type="button"
            onClick={onDraftReply}
            disabled={isDraftingReply}
            className="min-h-[42px] px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDraftingReply ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Reply size={14} />
            )}
            <span>{isDraftingReply ? 'Drafting...' : 'Draft Reply'}</span>
          </button>

          {/* 2. EXTRACT TASKS */}
          <button
            type="button"
            onClick={onExtractTasks}
            disabled={isExtractingTasks}
            className="min-h-[42px] px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExtractingTasks ? (
              <Loader2 size={14} className="animate-spin text-emerald-400" />
            ) : (
              <CheckSquare size={14} className="text-emerald-400" />
            )}
            <span>{isExtractingTasks ? 'Extracting...' : 'Extract Tasks'}</span>
          </button>

          {/* 3. ADD TO CALENDAR */}
          <button
            type="button"
            onClick={onAddToCalendar}
            disabled={isAddingToCalendar}
            className="min-h-[42px] px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isAddingToCalendar ? (
              <Loader2 size={14} className="animate-spin text-amber-400" />
            ) : (
              <Calendar size={14} className="text-amber-400" />
            )}
            <span>{isAddingToCalendar ? 'Adding...' : 'Add to Calendar'}</span>
          </button>

          {/* 4. EXPLAIN EMAIL */}
          <button
            type="button"
            onClick={onExplainEmail}
            disabled={isExplaining}
            className="min-h-[42px] px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 col-span-2 sm:col-span-1"
          >
            {isExplaining ? (
              <Loader2 size={14} className="animate-spin text-indigo-400" />
            ) : (
              <Sparkles size={14} className="text-indigo-400" />
            )}
            <span>{isExplaining ? 'Analyzing...' : 'Explain Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
