import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Cpu, Lock } from 'lucide-react';
import { cn } from '@/utils';
import api from '@/services/api/client';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  available?: boolean;
}

export const VERIFIED_FREE_MODELS: ModelOption[] = [
  // ── Anthropic & OpenAI ───────────────────────────────────────
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Deep reasoning, complex architecture design, and advanced coding',
  },
  {
    id: 'gpt-4o',
    name: 'ChatGPT (GPT-4o)',
    provider: 'OpenAI',
    description: 'Flagship multimodal intelligence and structured reasoning',
  },

  // ── Google Gemini Provider ───────────────────────────────────
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Next-generation multimodal reasoning and speed',
    available: true,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'High-speed multimodal reasoning and general conversation',
    available: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'Deep reasoning, complex coding, and long-form analysis',
    available: true,
  },

  // ── Groq Provider ────────────────────────────────────────────
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Large-scale open-weight reasoning, synthesis, and coding',
  },
  {
    id: 'deepseek-r1-distill-70b',
    name: 'DeepSeek R1 Distill 70B',
    provider: 'Groq',
    description: 'Step-by-step logic, math, and code reasoning',
  },

  // ── OpenRouter Provider ──────────────────────────────────────
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'OpenRouter',
    description: 'Advanced multilingual reasoning and code generation',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'OpenRouter',
    description: 'Large-scale conversational reasoning and synthesis',
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B Instruct',
    provider: 'OpenRouter',
    description: 'Compact general instruction following and reasoning',
  },
];

// Aliases for compatibility
export const FREE_MODELS = VERIFIED_FREE_MODELS;
export const AVAILABLE_MODELS = VERIFIED_FREE_MODELS;

interface ChatHeaderProps {
  status: 'online' | 'thinking' | 'offline';
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

const statusConfig = {
  online: {
    label: 'Online',
    dotClass: 'nexa-dot-online',
    labelClass: 'text-emerald-600 dark:text-emerald-400',
  },
  thinking: {
    label: 'Thinking...',
    dotClass: 'nexa-dot-thinking',
    labelClass: 'text-amber-600 dark:text-amber-400',
  },
  offline: {
    label: 'Offline',
    dotClass: 'nexa-dot-offline',
    labelClass: 'text-zinc-500',
  },
};

export function ChatHeader({ status, selectedModel, onSelectModel }: ChatHeaderProps) {
  const config = statusConfig[status];
  const [isOpen, setIsOpen] = useState(false);
  const [modelsList, setModelsList] = useState<ModelOption[]>(VERIFIED_FREE_MODELS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic availability from backend
  useEffect(() => {
    let isMounted = true;
    api.get('/chat/models')
      .then((res) => {
        if (isMounted && res.data?.data && Array.isArray(res.data.data)) {
          const serverModels = res.data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            provider:
              m.provider === 'google'
                ? 'Google'
                : m.provider === 'groq'
                ? 'Groq'
                : m.provider === 'openrouter'
                ? 'OpenRouter'
                : m.provider === 'anthropic'
                ? 'Anthropic'
                : m.provider === 'openai'
                ? 'OpenAI'
                : m.provider,
            description: m.description,
            available: m.available,
          }));
          setModelsList(serverModels);
        }
      })
      .catch(() => {
        // Fallback to static verified list
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeModel =
    modelsList.find((m) => m.id === selectedModel) ||
    modelsList.find((m) => m.available) ||
    modelsList[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
      <div className="flex items-center gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg leading-none">✦</span>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">NEXA</h1>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 pl-5 hidden sm:block">
            AI Assistant
          </p>
        </div>

        {/* Minimal Enterprise Model Selector */}
        <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-2xs"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Select AI Model"
          >
            <Cpu size={13} className="text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[170px]">
              {activeModel.name}
            </span>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-normal hidden sm:inline">
              · {activeModel.provider}
            </span>
            <ChevronDown
              size={12}
              className={cn(
                'text-zinc-400 transition-transform duration-150 flex-shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div
              className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 max-h-[80vh] overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl py-1.5 z-50 animate-fade-in-scale scrollbar-thin"
              role="listbox"
              aria-label="AI Models"
            >
              <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs z-10">
                <span>SELECT AI MODEL</span>
                <span className="text-[10px] text-zinc-400 font-normal">Multi-Provider</span>
              </div>

              <div className="p-1 space-y-0.5">
                {modelsList.map((model) => {
                  const isSelected = model.id === activeModel.id;
                  const isAvailable = model.available !== false;

                  return (
                    <button
                      key={model.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={!isAvailable}
                      title={!isAvailable ? `${model.provider} API key required in .env` : undefined}
                      onClick={() => {
                        if (!isAvailable) return;
                        onSelectModel(model.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg transition-colors flex items-start justify-between gap-2.5',
                        isAvailable ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed select-none bg-transparent hover:bg-transparent',
                        isSelected && isAvailable
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60'
                          : isAvailable
                          ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent'
                          : 'border border-transparent'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {model.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                            {model.provider}
                          </span>
                          <span
                            className={cn(
                              'text-[9px] px-1.5 py-0.2 rounded-full font-medium ml-auto flex items-center gap-1',
                              isAvailable
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50'
                                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50'
                            )}
                          >
                            {!isAvailable && <Lock size={9} className="opacity-70" />}
                            {isAvailable ? 'Available' : 'Key required'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {model.description}
                        </p>
                      </div>

                      {isSelected && isAvailable && (
                        <Check
                          size={14}
                          className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Online Status Indicator */}
      <div className="flex items-center gap-2">
        <span className={config.dotClass} />
        <span className={cn('text-xs font-medium', config.labelClass)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
