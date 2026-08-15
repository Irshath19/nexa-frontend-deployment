import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Check, Cpu } from 'lucide-react';
import { cn } from '@/utils';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  provider: string;
  description: string;
}

export const FREE_MODELS: ModelOption[] = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    badge: 'Free Tier · Ultra Fast',
    provider: 'Google',
    description: 'High-speed multimodal reasoning and general conversation',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    badge: 'Free Tier · Deep Context',
    provider: 'Google',
    description: 'Deep reasoning, complex code generation, and long-form analysis',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    badge: 'Free Tier · Next Gen',
    provider: 'Google',
    description: 'Next-generation fast multimodal assistance and coding',
  },
];

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeModel = FREE_MODELS.find((m) => m.id === selectedModel) || FREE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl leading-none">✦</span>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">NEXA</h1>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6">
            AI Assistant
          </p>
        </div>

        {/* Model Selector Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs font-medium text-zinc-800 dark:text-zinc-200"
            aria-label="Select AI Model"
          >
            <Cpu size={13} className="text-indigo-500" />
            <span className="truncate max-w-[140px] font-semibold">{activeModel.name}</span>
            <span className="hidden sm:inline text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
              {activeModel.badge.split('·')[1]?.trim() || 'Free'}
            </span>
            <ChevronDown size={13} className={cn('text-zinc-400 transition-transform', isOpen && 'rotate-180')} />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in-scale">
              <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Available AI Models (5 Free Models)
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                {FREE_MODELS.map((model) => {
                  const isSelected = model.id === activeModel.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-start gap-2.5 px-3 py-2 text-left transition-colors',
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      )}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {isSelected ? (
                          <Check size={13} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-zinc-300 dark:border-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold truncate">{model.name}</p>
                          <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            {model.provider}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
                          {model.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={config.dotClass} />
        <span className={cn('text-xs font-medium', config.labelClass)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
