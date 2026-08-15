import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { useContextStore } from '@/app/store';
import { useNexaStream } from '@/services/streaming/useNexaStream';
import { localId, cn } from '@/utils';
import { toast } from 'sonner';
import type { ChatMessage, ProgressStep } from '@/types';
import { ChatHeader, FREE_MODELS } from './ChatHeader';
import { ChatWelcome } from './ChatWelcome';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const VALID_MODEL_IDS = FREE_MODELS.map((m) => m.id);

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Initialize selectedModel safely from localStorage
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nexa_selected_model');
      if (saved && VALID_MODEL_IDS.includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return FREE_MODELS[0].id;
  });

  const [nexaStatus, setNexaStatus] = useState<'online' | 'thinking' | 'offline'>('online');

  const { selectedAccountId, selectedDate } = useContextStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Handle scroll detection for the scroll-to-bottom button
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(false);
    }
  }, [messages, streamingContent, showScrollBottom, scrollToBottom]);

  // Clean up any legacy or stale localStorage model values
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexa_selected_model');
      if (saved && !VALID_MODEL_IDS.includes(saved)) {
        localStorage.setItem('nexa_selected_model', FREE_MODELS[0].id);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectModel = useCallback((modelId: string) => {
    const safeModelId = VALID_MODEL_IDS.includes(modelId) ? modelId : FREE_MODELS[0].id;
    setSelectedModel(safeModelId);
    try {
      localStorage.setItem('nexa_selected_model', safeModelId);
    } catch {
      // ignore
    }
  }, []);

  const { sendMessage, isStreaming, cancel } = useNexaStream({
    onToken: (token) => {
      setStreamingContent((prev) => prev + token);
    },

    onProgress: (step) => {
      setProgressSteps((prev) => {
        const existing = prev.findIndex((s) => s.id === step.id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = step;
          return next;
        }
        return [...prev, step];
      });
    },

    onDone: (finalResponse: string, doneSessionId?: string) => {
      if (doneSessionId) {
        setSessionId(doneSessionId);
      }
      const contentToSave = finalResponse.trim() || 'No response generated.';
      setMessages((prev) => [
        ...prev,
        {
          id: localId(),
          role: 'assistant',
          content: contentToSave,
          progressSteps: progressSteps,
          createdAt: new Date().toISOString(),
        },
      ]);
      setStreamingContent('');
      setProgressSteps([]);
      setIsThinking(false);
      setNexaStatus('online');
    },

    onError: (message) => {
      setIsThinking(false);
      setNexaStatus('online');
      setStreamingContent('');
      setProgressSteps([]);
      toast.error(message);
    },
  });

  const handleSend = useCallback(
    async (query: string) => {
      if (!query.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: localId(),
        role: 'user',
        content: query,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      setNexaStatus('thinking');
      setProgressSteps([]);
      setStreamingContent('');

      await sendMessage({
        query,
        sessionId,
        accountId: selectedAccountId,
        date: selectedDate,
        modelId: selectedModel,
      });
    },
    [isStreaming, sendMessage, sessionId, selectedAccountId, selectedDate, selectedModel]
  );

  const handleRegenerate = useCallback(async () => {
    if (isStreaming || messages.length === 0) return;

    // Find the last user query
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    // Pop the last assistant message if exists
    if (messages[messages.length - 1].role === 'assistant') {
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsThinking(true);
    setNexaStatus('thinking');
    setProgressSteps([]);
    setStreamingContent('');

    await sendMessage({
      query: lastUserMsg.content,
      sessionId,
      accountId: selectedAccountId,
      date: selectedDate,
      modelId: selectedModel,
    });
  }, [isStreaming, messages, sendMessage, sessionId, selectedAccountId, selectedDate, selectedModel]);

  // Handle ?q= query param (from dashboard quick ask)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && messages.length === 0) {
      handleSend(decodeURIComponent(q));
    }
  }, []); // eslint-disable-line

  const hasMessages = messages.length > 0 || isThinking;

  return (
    <div className="flex flex-col h-full page-enter relative">
      <ChatHeader
        status={nexaStatus}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative scrollbar-thin"
      >
        {!hasMessages ? (
          <ChatWelcome onSelectPrompt={handleSend} />
        ) : (
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            progressSteps={progressSteps}
            isThinking={isThinking}
            messagesEndRef={messagesEndRef}
            onRegenerate={handleRegenerate}
          />
        )}
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 sm:right-10 z-10 w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all cursor-pointer animate-fade-in"
          title="Scroll to bottom"
        >
          <ArrowDown size={16} />
        </button>
      )}

      <ChatInput
        onSend={handleSend}
        isLoading={isStreaming}
        onCancel={cancel}
        disabled={false}
      />
    </div>
  );
}
