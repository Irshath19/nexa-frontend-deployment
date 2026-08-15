import { useCallback, useRef, useState } from 'react';
import type { SSEEvent, ProgressStep } from '@/types';
import { localId } from '@/utils';

export interface UseNexaStreamOptions {
  onToken: (token: string) => void;
  onProgress: (step: ProgressStep) => void;
  onDone: (finalResponse: string, sessionId?: string) => void;
  onError: (message: string) => void;
}

export interface SendMessagePayload {
  query: string;
  sessionId: string | null;
  accountId: string | null;
  date: string | null;
  modelId?: string;
}

export function useNexaStream(options: UseNexaStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedRef = useRef<string>('');
  const isDoneRef = useRef<boolean>(false);
  const optionsRef = useRef<UseNexaStreamOptions>(options);
  optionsRef.current = options;

  const sendMessage = useCallback(
    async (payload: SendMessagePayload) => {
      // Cancel any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      accumulatedRef.current = '';
      isDoneRef.current = false;
      setIsStreaming(true);

      try {
        const token = localStorage.getItem('nexa_access_token');
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            query: payload.query,
            session_id: payload.sessionId,
            account_id: payload.accountId,
            date: payload.date,
            model_id: payload.modelId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || 'Failed to connect to NEXA');
        }

        if (!response.body) {
          throw new Error('No response body received');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events (split by double newlines)
          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? ''; // Keep incomplete chunk

          for (const block of blocks) {
            if (!block.trim()) continue;

            let eventType = 'message';
            let dataStr = '';

            const lines = block.split('\n');
            for (const line of lines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice('event: '.length).trim();
              } else if (line.startsWith('data: ')) {
                dataStr = line.slice('data: '.length).trim();
              }
            }

            if (!dataStr || dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              handleParsedSSE(eventType, parsed);
            } catch {
              // Skip malformed JSON
            }
          }
        }

        if (!isDoneRef.current) {
          isDoneRef.current = true;
          optionsRef.current.onDone(accumulatedRef.current);
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'NEXA encountered an error';
        optionsRef.current.onError(message);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  function handleParsedSSE(eventType: string, data: any) {
    switch (eventType) {
      case 'token': {
        const tokenChunk = data.token ?? data.content ?? '';
        accumulatedRef.current += tokenChunk;
        optionsRef.current.onToken(tokenChunk);
        break;
      }

      case 'progress':
        optionsRef.current.onProgress({
          id: data.id || localId(),
          message: data.message || data.content || '',
          status: data.status || data.stepStatus || 'active',
        });
        break;

      case 'done': {
        if (data.response) {
          accumulatedRef.current = data.response;
        }
        if (!isDoneRef.current) {
          isDoneRef.current = true;
          optionsRef.current.onDone(accumulatedRef.current, data.session_id);
        }
        break;
      }

      case 'error':
        optionsRef.current.onError(data.message || data.content || 'Something went wrong');
        break;

      default:
        if (data.token) {
          accumulatedRef.current += data.token;
          optionsRef.current.onToken(data.token);
        } else if (data.response) {
          accumulatedRef.current = data.response;
        }
        break;
    }
  }

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { sendMessage, isStreaming, cancel };
}
