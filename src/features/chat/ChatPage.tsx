import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContextStore } from '@/app/store';
import { useNexaStream } from '@/services/streaming/useNexaStream';
import { localId } from '@/utils';
import { toast } from 'sonner';
import type { ChatMessage, ProgressStep } from '@/types';
import { ChatHeader, FREE_MODELS } from './ChatHeader';
import { ChatWelcome } from './ChatWelcome';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const VALID_GEMINI_MODEL_IDS = FREE_MODELS.map((m) => m.id);

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize selectedModel safely from localStorage, guaranteeing a valid Gemini model
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nexa_selected_model');
      if (saved && VALID_GEMINI_MODEL_IDS.includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'gemini-1.5-flash';
  });

  const [nexaStatus, setNexaStatus] = useState<'online' | 'thinking' | 'offline'>('online');

  const { selectedAccountId, selectedDate } = useContextStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, streamingContent]);

  // Clean up any legacy or stale localStorage model values
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexa_selected_model');
      if (saved && !VALID_GEMINI_MODEL_IDS.includes(saved)) {
        localStorage.setItem('nexa_selected_model', 'gemini-1.5-flash');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectModel = useCallback((modelId: string) => {
    const safeModelId = VALID_GEMINI_MODEL_IDS.includes(modelId) ? modelId : 'gemini-1.5-flash';
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

  // Handle ?q= query param (from dashboard quick ask)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && messages.length === 0) {
      handleSend(decodeURIComponent(q));
    }
  }, []); // eslint-disable-line

  const hasMessages = messages.length > 0 || isThinking;

  return (
    <div className="flex flex-col h-full page-enter">
      <ChatHeader
        status={nexaStatus}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
      />

      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <ChatWelcome onSelectPrompt={handleSend} />
        ) : (
          <MessageList
            messages={messages}
            streamingContent={streamingContent}
            progressSteps={progressSteps}
            isThinking={isThinking}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        isLoading={isStreaming}
        onCancel={cancel}
        disabled={false}
      />
    </div>
  );
}
