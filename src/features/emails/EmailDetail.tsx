import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Copy,
  Loader2,
  Calendar,
  MapPin,
  Link2,
  Globe,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  emailsApi,
  type TaskItem,
  type ExplainEmailResult,
} from '@/services/api/emails';
import { QUERY_KEYS } from '@/constants';
import { formatFullDate, formatEmailTime, cn } from '@/utils';
import { toast } from 'sonner';
import type { Email } from '@/types';

// Subcomponents
import { EmailHeader } from './reader/EmailHeader';
import { EmailSenderCard } from './reader/EmailSenderCard';
import { RichEmailBody } from './reader/RichEmailBody';
import { EmailAttachments } from './reader/EmailAttachments';
import { NexaActionsBar } from './reader/NexaActionsBar';
import { EmailReplyComposer } from './reader/EmailReplyComposer';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function EmailDetail({
  email,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
}: EmailDetailProps) {
  const queryClient = useQueryClient();

  // ── Reply Composer State ────────────────────────────────────
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [replyTo, setReplyTo] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isDraftingReply, setIsDraftingReply] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // ── Action 2: Extract Tasks State ───────────────────────────
  const [extractedTasks, setExtractedTasks] = useState<TaskItem[] | null>(null);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);

  // ── Action 3: Add to Calendar State ─────────────────────────
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isSubmittingCalendarModal, setIsSubmittingCalendarModal] = useState(false);
  const [calendarFormData, setCalendarFormData] = useState({
    title: '',
    date: '',
    startTime: '11:00 AM',
    endTime: '11:45 AM',
    timezone: 'Asia/Kolkata',
    location: '',
    meetingUrl: '',
    description: '',
  });

  // ── Action 4: Explain Email State ───────────────────────────
  const [emailExplanation, setEmailExplanation] = useState<ExplainEmailResult | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch full email details if needed
  const { data } = useQuery({
    queryKey: QUERY_KEYS.EMAIL(email.id),
    queryFn: () => emailsApi.get(email.id),
    initialData: { data: email },
  });

  const fullEmail = data?.data ?? email;

  const { mutate: markImportant } = useMutation({
    mutationFn: (important: boolean) => emailsApi.markImportant(email.id, important),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success(fullEmail.isImportant ? 'Removed from starred' : 'Marked as starred');
    },
  });

  const { mutate: markUnread } = useMutation({
    mutationFn: () => emailsApi.markUnread(email.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success('Marked as unread');
      onClose();
    },
  });

  // ── 1. DRAFT REPLY HANDLER ─────────────────────────────────
  const handleDraftReply = async () => {
    setIsDraftingReply(true);
    setShowReplyComposer(true);
    setReplyTo(fullEmail.senderEmail);
    setReplySubject(
      fullEmail.subject.toLowerCase().startsWith('re:')
        ? fullEmail.subject
        : `Re: ${fullEmail.subject}`
    );

    try {
      const res = await emailsApi.draftReply(fullEmail.id);
      if (res.data?.draft) {
        setReplyBody(res.data.draft);
        if (res.data.recipient) setReplyTo(res.data.recipient);
        if (res.data.subject) setReplySubject(res.data.subject);
        setTimeout(() => {
          replyInputRef.current?.focus();
          replyInputRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error('Draft reply error:', err);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail?.message ||
        'Unable to generate reply. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsDraftingReply(false);
    }
  };

  // ── SEND REPLY HANDLER ──────────────────────────────────────
  const handleSendReply = async () => {
    if (!replyBody.trim()) {
      toast.error('Please enter a reply message.');
      return;
    }

    setIsSendingReply(true);
    try {
      await emailsApi.sendReply(fullEmail.id, {
        body: replyBody,
        subject: replySubject,
        recipient: replyTo,
      });

      toast.success('Reply sent successfully!');
      setShowReplyComposer(false);
      setReplyBody('');
    } catch (err: any) {
      console.error('Send reply error:', err);
      const errMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.detail?.message ||
        'Failed to send reply. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSendingReply(false);
    }
  };

  // ── 2. EXTRACT TASKS HANDLER ───────────────────────────────
  const handleExtractTasks = async () => {
    setIsExtractingTasks(true);
    try {
      const res = await emailsApi.extractTasks(fullEmail.id);
      if (res.data?.tasks) {
        setExtractedTasks(res.data.tasks);
        if (res.data.tasks.length === 0) {
          toast.info('No actionable tasks found in this email.');
        } else {
          toast.success(`Found ${res.data.tasks.length} actionable tasks.`);
        }
      }
    } catch (err: any) {
      console.error('Extract tasks error:', err);
      toast.error('Unable to extract tasks from this email.');
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const toggleTaskCompletion = (index: number) => {
    if (!extractedTasks) return;
    const updated = [...extractedTasks];
    updated[index].completed = !updated[index].completed;
    setExtractedTasks(updated);
  };

  // ── 3. ADD TO CALENDAR HANDLER ─────────────────────────────
  const handleAddToCalendar = async () => {
    setIsAddingToCalendar(true);
    try {
      const res = await emailsApi.createCalendarEvent(fullEmail.id);
      if (res.data) {
        toast.success('Added to Google Calendar', {
          action: res.data.htmlLink
            ? {
                label: 'View in Calendar',
                onClick: () => window.open(res.data.htmlLink!, '_blank'),
              }
            : undefined,
        });
      }
    } catch (err: any) {
      console.error('Calendar creation error:', err);
      const detail = err?.response?.data?.detail;
      const errorCode = detail?.code;

      if (errorCode === 'NO_EVENT_INFO' || err?.response?.status === 400) {
        const todayStr = new Date().toISOString().split('T')[0];
        setCalendarFormData({
          title: fullEmail.subject.replace(/^(Re|Fwd):\s*/i, ''),
          date: todayStr,
          startTime: '11:00 AM',
          endTime: '11:45 AM',
          timezone: 'Asia/Kolkata',
          location: 'Online',
          meetingUrl: 'Google Meet',
          description: fullEmail.summary || fullEmail.bodyPreview || fullEmail.subject,
        });
        setShowCalendarModal(true);
      } else {
        const errorMsg =
          detail?.message ||
          err?.response?.data?.error?.message ||
          'Unable to add this event to Google Calendar.';
        toast.error(errorMsg);
      }
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleManualCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarFormData.title.trim()) {
      toast.error('Event title is required.');
      return;
    }
    if (!calendarFormData.date.trim()) {
      toast.error('Event date is required.');
      return;
    }

    setIsSubmittingCalendarModal(true);
    try {
      const res = await emailsApi.createCalendarEvent(fullEmail.id, {
        title: calendarFormData.title,
        date: calendarFormData.date,
        time: calendarFormData.startTime,
        duration: '45 minutes',
        location: calendarFormData.location,
        description: calendarFormData.description,
      });

      setShowCalendarModal(false);
      toast.success('Added to Google Calendar', {
        action: res.data?.htmlLink
          ? {
              label: 'View in Calendar',
              onClick: () => window.open(res.data.htmlLink!, '_blank'),
            }
          : undefined,
      });
    } catch (err: any) {
      console.error('Manual calendar creation error:', err);
      const errMsg =
        err?.response?.data?.detail?.message ||
        err?.response?.data?.error?.message ||
        'Unable to add this event to Google Calendar.';
      toast.error(errMsg);
    } finally {
      setIsSubmittingCalendarModal(false);
    }
  };

  // ── 4. EXPLAIN EMAIL HANDLER ───────────────────────────────
  const handleExplainEmail = async () => {
    setIsExplaining(true);
    try {
      const res = await emailsApi.explainEmail(fullEmail.id);
      if (res.data) {
        setEmailExplanation(res.data);
      }
    } catch (err: any) {
      console.error('Explain email error:', err);
      toast.error('Unable to explain this email.');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out',
        isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-950' : 'relative'
      )}
    >
      {/* ── 1. EMAIL HEADER ──────────────────────────────────── */}
      <EmailHeader
        subject={fullEmail.subject}
        isImportant={fullEmail.isImportant}
        isUrgent={fullEmail.isUrgent}
        category={fullEmail.category}
        isFullscreen={isFullscreen}
        onClose={onClose}
        onToggleStar={() => markImportant(!fullEmail.isImportant)}
        onReply={() => {
          setShowReplyComposer(true);
          setReplyTo(fullEmail.senderEmail);
          setReplySubject(
            fullEmail.subject.toLowerCase().startsWith('re:')
              ? fullEmail.subject
              : `Re: ${fullEmail.subject}`
          );
          setTimeout(() => replyInputRef.current?.focus(), 100);
        }}
        onMarkUnread={() => markUnread()}
        onToggleFullscreen={onToggleFullscreen}
      />

      {/* ── 2. SCROLLABLE EMAIL READING VIEW ─────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div
          className={cn(
            'px-4 sm:px-8 py-5 sm:py-7 mx-auto space-y-5 sm:space-y-6',
            isFullscreen ? 'max-w-4xl' : 'max-w-3xl'
          )}
        >
          {/* Subject Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {fullEmail.isUrgent && (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Urgent Priority
                </span>
              )}
              {fullEmail.category && (
                <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {fullEmail.category}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug break-words">
              {fullEmail.subject || '(No Subject)'}
            </h1>
          </div>

          {/* Sender Card */}
          <EmailSenderCard
            senderName={fullEmail.senderName}
            senderEmail={fullEmail.senderEmail}
            recipientEmail={fullEmail.recipientEmail}
            receivedAt={fullEmail.receivedAt}
            subject={fullEmail.subject}
          />

          {/* ── NEXA AI SUMMARY BANNER ───────────────────────── */}
          {fullEmail.summary && (
            <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/20 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ✦
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    NEXA Summary
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                  AI Generated
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed mb-3.5">
                {fullEmail.summary}
              </p>

              {/* Key Metadata Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3.5 text-xs">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40">
                  <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {formatFullDate(fullEmail.receivedAt).split(',')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40">
                  <span className="text-indigo-500 font-bold">⏱</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {formatEmailTime(fullEmail.receivedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40 col-span-2 sm:col-span-1">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {fullEmail.requiresAction ? 'Action Required' : 'Informational'}
                  </span>
                </div>
              </div>

              {/* Key points bullets */}
              {fullEmail.keyPoints && fullEmail.keyPoints.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/50">
                  {fullEmail.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="text-indigo-500 font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action summary badge */}
              {fullEmail.actionSummary && (
                <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">Next Action:</strong> {fullEmail.actionSummary}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── 3. RICH EMAIL BODY CONTENT ───────────────────── */}
          <RichEmailBody
            body={fullEmail.body}
            bodyPreview={fullEmail.bodyPreview}
          />

          {/* ── 4. ATTACHMENTS ───────────────────────────────── */}
          <EmailAttachments attachments={fullEmail.attachments} />

          {/* ── 5. NEXA ACTIONS TOOLBAR ──────────────────────── */}
          <NexaActionsBar
            isDraftingReply={isDraftingReply}
            isExtractingTasks={isExtractingTasks}
            isAddingToCalendar={isAddingToCalendar}
            isExplaining={isExplaining}
            onDraftReply={handleDraftReply}
            onExtractTasks={handleExtractTasks}
            onAddToCalendar={handleAddToCalendar}
            onExplainEmail={handleExplainEmail}
          />

          {/* ── 6. REPLY COMPOSER ────────────────────────────── */}
          <EmailReplyComposer
            isOpen={showReplyComposer}
            senderName={fullEmail.senderName}
            replyTo={replyTo}
            replySubject={replySubject}
            replyBody={replyBody}
            isDraftingReply={isDraftingReply}
            isSendingReply={isSendingReply}
            onOpen={() => {
              setShowReplyComposer(true);
              setReplyTo(fullEmail.senderEmail);
              setReplySubject(
                fullEmail.subject.toLowerCase().startsWith('re:')
                  ? fullEmail.subject
                  : `Re: ${fullEmail.subject}`
              );
              setTimeout(() => replyInputRef.current?.focus(), 100);
            }}
            onClose={() => setShowReplyComposer(false)}
            onChangeTo={setReplyTo}
            onChangeSubject={setReplySubject}
            onChangeBody={setReplyBody}
            onAutoDraft={handleDraftReply}
            onSend={handleSendReply}
            textareaRef={replyInputRef}
          />
        </div>
      </div>

      {/* ── MODAL 1: EXTRACTED TASKS MODAL ───────────────────── */}
      {extractedTasks !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4 max-h-[85dvh] flex flex-col overflow-hidden animate-fade-in-scale">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Actionable Tasks
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExtractedTasks(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            {extractedTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No actionable tasks detected in this email.
              </p>
            ) : (
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                {extractedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-all flex items-start gap-3',
                      t.completed
                        ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800 opacity-60'
                        : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200/70 dark:border-zinc-700/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed || false}
                      onChange={() => toggleTaskCompletion(idx)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs font-bold text-zinc-800 dark:text-zinc-200',
                          t.completed && 'line-through text-zinc-400 dark:text-zinc-500'
                        )}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-zinc-400 flex-wrap">
                        {t.due && (
                          <span>
                            Due: <strong className="text-zinc-600 dark:text-zinc-300 font-semibold">{t.due}</strong>
                          </span>
                        )}
                        {t.sourceEmail && (
                          <span className="truncate max-w-[160px]">
                            {t.sourceEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0',
                        t.priority?.toLowerCase() === 'high'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!extractedTasks) return;
                  navigator.clipboard.writeText(
                    extractedTasks
                      .map((t) => `• [${t.completed ? 'x' : ' '}] ${t.title} (Due: ${t.due || 'N/A'}, Priority: ${t.priority})`)
                      .join('\n')
                  );
                  toast.success('Tasks copied to clipboard');
                }}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <Copy size={13} />
                <span>Copy Tasks</span>
              </button>
              <button
                type="button"
                onClick={() => setExtractedTasks(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer min-h-[38px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD TO CALENDAR MODAL ───────────────────── */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[85dvh] flex flex-col overflow-hidden animate-fade-in-scale">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Calendar size={16} />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Add to Google Calendar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCalendarModal(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2 flex-shrink-0">
              <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <span>Please verify the date, time, and location details before scheduling to Google Calendar.</span>
            </div>

            <form onSubmit={handleManualCalendarSubmit} className="space-y-3 text-xs flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={calendarFormData.title}
                  onChange={(e) => setCalendarFormData({ ...calendarFormData, title: e.target.value })}
                  placeholder="e.g. AI Engineer Interview"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={calendarFormData.date}
                  onChange={(e) => setCalendarFormData({ ...calendarFormData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={calendarFormData.startTime}
                    onChange={(e) => setCalendarFormData({ ...calendarFormData, startTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={calendarFormData.endTime}
                    onChange={(e) => setCalendarFormData({ ...calendarFormData, endTime: e.target.value })}
                    placeholder="11:45 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Timezone
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold">
                  <Globe size={13} className="text-zinc-400" />
                  <span>{calendarFormData.timezone} (IST · Indian Standard Time)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Location (Optional)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
                    <MapPin size={13} className="text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={calendarFormData.location}
                      onChange={(e) => setCalendarFormData({ ...calendarFormData, location: e.target.value })}
                      placeholder="Office / Online"
                      className="bg-transparent border-0 focus:outline-none w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Meeting URL (Optional)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
                    <Link2 size={13} className="text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={calendarFormData.meetingUrl}
                      onChange={(e) => setCalendarFormData({ ...calendarFormData, meetingUrl: e.target.value })}
                      placeholder="e.g. meet.google.com/..."
                      className="bg-transparent border-0 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCalendarModal}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[38px]"
                >
                  {isSubmittingCalendarModal && <Loader2 size={12} className="animate-spin" />}
                  <span>{isSubmittingCalendarModal ? 'Scheduling...' : 'Save to Google Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: EXPLAIN EMAIL MODAL ─────────────────────── */}
      {emailExplanation && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 space-y-4 max-h-[85dvh] flex flex-col overflow-hidden animate-fade-in-scale">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  NEXA Deep Email Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailExplanation(null)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              <div>
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  Executive Summary
                </h4>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                  {emailExplanation.summary || emailExplanation.explanation}
                </p>
              </div>

              {emailExplanation.importantDetails && emailExplanation.importantDetails.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Key Insights & Context
                  </h4>
                  <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300 pl-1">
                    {emailExplanation.importantDetails.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold mt-0.5">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {emailExplanation.actionsRequired && emailExplanation.actionsRequired.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Action Items
                  </h4>
                  <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300 pl-1 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                    {emailExplanation.actionsRequired.map((act, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setEmailExplanation(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer min-h-[38px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
