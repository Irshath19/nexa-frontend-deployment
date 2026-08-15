import { useState, useRef } from 'react';
import {
  X,
  ArrowLeft,
  Star,
  MailOpen,
  Reply,
  Maximize2,
  Minimize2,
  Paperclip,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  CheckSquare,
  Copy,
  Loader2,
  Globe,
  Link2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  emailsApi,
  type TaskItem,
  type ExplainEmailResult,
} from '@/services/api/emails';
import { QUERY_KEYS } from '@/constants';
import { formatFullDate, formatEmailTime, getInitials, formatFileSize, cn } from '@/utils';
import { toast } from 'sonner';
import type { Email } from '@/types';

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
  const [showFullMetadata, setShowFullMetadata] = useState(false);

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

  const { data } = useQuery({
    queryKey: QUERY_KEYS.EMAIL(email.id),
    queryFn: () => emailsApi.get(email.id),
    initialData: { data: email },
  });

  const fullEmail = data?.data ?? email;

  const { mutate: markImportant, isPending: isMarkingImportant } = useMutation({
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
      toast.error('Reply body cannot be empty.');
      return;
    }
    setIsSendingReply(true);
    try {
      await emailsApi.sendReply(fullEmail.id, {
        body: replyBody,
        subject: replySubject || `Re: ${fullEmail.subject}`,
        recipient: replyTo || fullEmail.senderEmail,
      });
      toast.success('Reply sent');
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
      const tasks = (res.data?.tasks || []).map((t) => ({
        ...t,
        sourceEmail: t.sourceEmail || fullEmail.subject,
        completed: false,
      }));
      setExtractedTasks(tasks);
      if (tasks.length === 0) {
        toast.info('No actionable tasks detected in this email.');
      }
    } catch (err: any) {
      console.error('Extract tasks error:', err);
      toast.error('Unable to extract tasks.');
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
      // Try PATH A: Direct automatic creation
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

      // PATH B: Missing / incomplete date or time info -> Open manual prefilled modal
      if (errorCode === 'NO_EVENT_INFO' || err?.response?.status === 400) {
        // Pre-fill whatever information is available
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

  // ── SUBMIT MANUAL CALENDAR MODAL ────────────────────────────
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
        'flex flex-col h-full bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out',
        isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-950' : 'relative'
      )}
    >
      {/* ── STICKY HEADER ────────────────────────────────────── */}
      <header className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
            title="Back to email list"
            aria-label="Back to email list"
          >
            <ArrowLeft size={16} />
          </button>

          <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {fullEmail.subject || '(No Subject)'}
          </h1>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => markImportant(!fullEmail.isImportant)}
            disabled={isMarkingImportant}
            className={cn(
              'p-2 rounded-lg text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
              fullEmail.isImportant && 'text-amber-500'
            )}
            title={fullEmail.isImportant ? 'Starred' : 'Star email'}
            aria-label={fullEmail.isImportant ? 'Starred' : 'Star email'}
          >
            <Star size={16} className={fullEmail.isImportant ? 'fill-amber-400 text-amber-400' : ''} />
          </button>

          <button
            onClick={() => {
              setShowReplyComposer(true);
              setReplyTo(fullEmail.senderEmail);
              setReplySubject(
                fullEmail.subject.toLowerCase().startsWith('re:')
                  ? fullEmail.subject
                  : `Re: ${fullEmail.subject}`
              );
              setTimeout(() => replyInputRef.current?.focus(), 100);
            }}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Reply"
            aria-label="Reply"
          >
            <Reply size={16} />
          </button>

          <button
            onClick={() => markUnread()}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Mark as unread"
            aria-label="Mark as unread"
          >
            <MailOpen size={16} />
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reading Mode'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Close email"
            aria-label="Close email"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* ── EMAIL READING BODY ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className={cn('p-6 sm:p-8 mx-auto space-y-6', isFullscreen ? 'max-w-4xl' : 'max-w-3xl')}>
          {/* Subject Title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {fullEmail.isUrgent && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Urgent Priority
                </span>
              )}
              {fullEmail.category && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {fullEmail.category}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
              {fullEmail.subject || '(No Subject)'}
            </h2>
          </div>

          {/* ── SENDER INFORMATION CARD ────────────────────────── */}
          <div className="bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                  {getInitials(fullEmail.senderName)}
                </div>

                {/* Sender Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {fullEmail.senderName}
                    </p>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate hidden sm:inline">
                      &lt;{fullEmail.senderEmail}&gt;
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    to me · {formatFullDate(fullEmail.receivedAt)} ({formatEmailTime(fullEmail.receivedAt)})
                  </p>
                </div>
              </div>

              {/* Expand Details Toggle */}
              <button
                onClick={() => setShowFullMetadata(!showFullMetadata)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition-colors flex-shrink-0"
                title="Toggle details"
              >
                {showFullMetadata ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Expandable Deep Metadata */}
            {showFullMetadata && (
              <div className="mt-3.5 pt-3.5 border-t border-zinc-200/60 dark:border-zinc-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 animate-fade-in">
                <div>
                  <span className="text-zinc-400 font-medium">From:</span> {fullEmail.senderName} &lt;{fullEmail.senderEmail}&gt;
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">To:</span> {fullEmail.recipientEmail}
                </div>
                <div>
                  <span className="text-zinc-400 font-medium">Date:</span> {formatFullDate(fullEmail.receivedAt)}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck size={13} />
                  <span>Verified via Google DKIM / TLS</span>
                </div>
              </div>
            )}
          </div>

          {/* ── NEXA AI SUMMARY BOX ────────────────────────────── */}
          {fullEmail.summary && (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-zinc-900 dark:to-purple-950/20 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ✦
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    NEXA SUMMARY
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                  AI Generated
                </span>
              </div>

              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed mb-3.5">
                {fullEmail.summary}
              </p>

              {/* Key metadata cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3.5">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40 text-xs">
                  <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {formatFullDate(fullEmail.receivedAt).split(',')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40 text-xs">
                  <Clock size={14} className="text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {formatEmailTime(fullEmail.receivedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-100/60 dark:border-indigo-900/40 text-xs col-span-2 sm:col-span-1">
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
                <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="font-bold">Next Action:</strong> {fullEmail.actionSummary}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EMAIL BODY CONTENT ─────────────────────────────── */}
          <article className="py-2">
            {fullEmail.body ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-4 font-normal"
                dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(fullEmail.body) }}
              />
            ) : (
              <div className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-normal">
                {fullEmail.bodyPreview || 'No content provided.'}
              </div>
            )}
          </article>

          {/* ── ATTACHMENTS SECTION ────────────────────────────── */}
          {fullEmail.attachments && fullEmail.attachments.length > 0 && (
            <section className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip size={14} className="text-zinc-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  ATTACHMENTS ({fullEmail.attachments.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fullEmail.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {file.filename}
                        </p>
                        <p className="text-[10px] text-zinc-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toast.success(`Downloading ${file.filename}`)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-700 transition-colors flex-shrink-0"
                      title="Download file"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── NEXA ACTIONS (BOTTOM ACTION BAR) ────────────────── */}
          <div className="pt-4">
            <div className="p-4 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <Sparkles size={14} />
                  <span>NEXA Actions</span>
                </div>
                {(isDraftingReply || isExtractingTasks || isAddingToCalendar || isExplaining) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Processing with NEXA...</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {/* 1. DRAFT REPLY */}
                <button
                  onClick={handleDraftReply}
                  disabled={isDraftingReply}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  {isDraftingReply ? <Loader2 size={13} className="animate-spin" /> : <Reply size={13} />}
                  <span>{isDraftingReply ? 'Generating reply...' : 'Draft Reply'}</span>
                </button>

                {/* 2. EXTRACT TASKS */}
                <button
                  onClick={handleExtractTasks}
                  disabled={isExtractingTasks}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  {isExtractingTasks ? <Loader2 size={13} className="animate-spin text-emerald-400" /> : <CheckSquare size={13} className="text-emerald-400" />}
                  <span>{isExtractingTasks ? 'Extracting tasks...' : 'Extract Tasks'}</span>
                </button>

                {/* 3. ADD TO CALENDAR */}
                <button
                  onClick={handleAddToCalendar}
                  disabled={isAddingToCalendar}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  {isAddingToCalendar ? <Loader2 size={13} className="animate-spin text-amber-400" /> : <Calendar size={13} className="text-amber-400" />}
                  <span>{isAddingToCalendar ? 'Adding...' : 'Add to Calendar'}</span>
                </button>

                {/* 4. EXPLAIN EMAIL */}
                <button
                  onClick={handleExplainEmail}
                  disabled={isExplaining}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
                >
                  {isExplaining ? <Loader2 size={13} className="animate-spin text-indigo-400" /> : <Sparkles size={13} className="text-indigo-400" />}
                  <span>{isExplaining ? 'Analyzing email...' : 'Explain Email'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── REPLY COMPOSER AREA ────────────────────────────── */}
          <div className="pt-2">
            {!showReplyComposer ? (
              <button
                onClick={() => {
                  setShowReplyComposer(true);
                  setReplyTo(fullEmail.senderEmail);
                  setReplySubject(
                    fullEmail.subject.toLowerCase().startsWith('re:')
                      ? fullEmail.subject
                      : `Re: ${fullEmail.subject}`
                  );
                  setTimeout(() => replyInputRef.current?.focus(), 100);
                }}
                className="w-full py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-left text-xs text-zinc-500 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>Reply to {fullEmail.senderName}...</span>
                <Reply size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            ) : (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-zinc-900 p-4 shadow-md space-y-3 animate-fade-in">
                {/* To & Subject Header */}
                <div className="space-y-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold w-12 text-zinc-700 dark:text-zinc-300">To:</span>
                      <input
                        type="text"
                        value={replyTo}
                        onChange={(e) => setReplyTo(e.target.value)}
                        placeholder="recipient@example.com"
                        className="bg-transparent border-0 focus:outline-none text-zinc-800 dark:text-zinc-200 w-full"
                      />
                    </div>
                    <button
                      onClick={() => setShowReplyComposer(false)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold w-12 text-zinc-700 dark:text-zinc-300">Subject:</span>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      placeholder="Subject"
                      className="bg-transparent border-0 focus:outline-none text-zinc-800 dark:text-zinc-200 w-full font-medium"
                    />
                  </div>
                </div>

                {/* Editable Body */}
                <textarea
                  ref={replyInputRef}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply here or click Draft Reply..."
                  rows={7}
                  className="w-full text-xs text-zinc-800 dark:text-zinc-200 bg-transparent border-0 focus:outline-none resize-none placeholder:text-zinc-400 leading-relaxed font-normal"
                />

                {/* Bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDraftReply}
                      disabled={isDraftingReply}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles size={11} /> {isDraftingReply ? 'Regenerating...' : 'Regenerate Draft'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowReplyComposer(false);
                        setReplyBody('');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyBody.trim()}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {isSendingReply ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      <span>{isSendingReply ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL 1: EXTRACTED TASKS MODAL ───────────────────── */}
      {extractedTasks !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className="text-emerald-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Tasks
                </h3>
              </div>
              <button
                onClick={() => setExtractedTasks(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            {extractedTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">
                No actionable tasks detected in this email.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {extractedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 rounded-xl border transition-all flex items-start gap-2.5',
                      t.completed
                        ? 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/50 dark:border-zinc-800 opacity-60'
                        : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200/70 dark:border-zinc-700/60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed || false}
                      onChange={() => toggleTaskCompletion(idx)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-xs font-semibold text-zinc-800 dark:text-zinc-200',
                          t.completed && 'line-through text-zinc-400 dark:text-zinc-500'
                        )}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-400">
                        {t.due && (
                          <span>
                            Due: <strong className="text-zinc-600 dark:text-zinc-300 font-medium">{t.due}</strong>
                          </span>
                        )}
                        {t.sourceEmail && (
                          <span className="truncate max-w-[160px]">
                            Source: {t.sourceEmail}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0',
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    extractedTasks
                      .map((t) => `• [${t.completed ? 'x' : ' '}] ${t.title} (Due: ${t.due || 'N/A'}, Priority: ${t.priority})`)
                      .join('\n')
                  );
                  toast.success('Tasks copied to clipboard');
                }}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy size={12} /> Copy Tasks
              </button>
              <button
                onClick={() => setExtractedTasks(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD TO CALENDAR (MANUAL ENTRY / FALLBACK) ─── */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Calendar size={16} />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Add to Calendar
                </h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Explanatory banner */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
              <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <span>We couldn't find a complete date and time in this email. Please enter or review the event details below.</span>
            </div>

            <form onSubmit={handleManualCalendarSubmit} className="space-y-3.5 text-xs">
              {/* Event title */}
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={calendarFormData.title}
                  onChange={(e) => setCalendarFormData({ ...calendarFormData, title: e.target.value })}
                  placeholder="e.g. AI Engineer Interview"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={calendarFormData.date}
                  onChange={(e) => setCalendarFormData({ ...calendarFormData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={calendarFormData.startTime}
                    onChange={(e) => setCalendarFormData({ ...calendarFormData, startTime: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={calendarFormData.endTime}
                    onChange={(e) => setCalendarFormData({ ...calendarFormData, endTime: e.target.value })}
                    placeholder="11:45 AM"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Timezone
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium">
                  <Globe size={13} className="text-zinc-400" />
                  <span>{calendarFormData.timezone} (IST · Indian Standard Time)</span>
                </div>
              </div>

              {/* Location & Meeting Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Location (Optional)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
                    <MapPin size={13} className="text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={calendarFormData.location}
                      onChange={(e) => setCalendarFormData({ ...calendarFormData, location: e.target.value })}
                      placeholder="e.g. Office / Online"
                      className="bg-transparent border-0 focus:outline-none w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Meeting Link (Optional)
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus-within:border-indigo-500">
                    <Link2 size={13} className="text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={calendarFormData.meetingUrl}
                      onChange={(e) => setCalendarFormData({ ...calendarFormData, meetingUrl: e.target.value })}
                      placeholder="e.g. Google Meet URL"
                      className="bg-transparent border-0 focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={calendarFormData.description}
                  onChange={(e) => setCalendarFormData({ ...calendarFormData, description: e.target.value })}
                  placeholder="Additional context from email..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCalendarModal}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingCalendarModal && <Loader2 size={12} className="animate-spin" />}
                  <span>{isSubmittingCalendarModal ? 'Adding...' : 'Add to Calendar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: EXPLAIN EMAIL MODAL ─────────────────────── */}
      {emailExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Email Summary
                </h3>
              </div>
              <button
                onClick={() => setEmailExplanation(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {/* Summary section */}
              <div>
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Summary
                </h4>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                  {emailExplanation.summary || emailExplanation.explanation}
                </p>
              </div>

              {/* Important details */}
              {emailExplanation.importantDetails && emailExplanation.importantDetails.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Important details:
                  </h4>
                  <div className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300 pl-1">
                    {emailExplanation.importantDetails.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What I need to do */}
              {emailExplanation.actionsRequired && emailExplanation.actionsRequired.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                    Action required:
                  </h4>
                  <div className="space-y-1 text-xs text-amber-700 dark:text-amber-300 pl-1 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
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

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEmailExplanation(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
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

function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}
