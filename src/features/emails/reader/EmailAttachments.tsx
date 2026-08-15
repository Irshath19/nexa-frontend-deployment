import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Download,
  Paperclip,
  Eye,
  File,
} from 'lucide-react';
import { formatFileSize } from '@/utils';
import { toast } from 'sonner';
import type { EmailAttachment } from '@/types';

interface EmailAttachmentsProps {
  attachments: EmailAttachment[];
}

function getAttachmentIcon(filename: string, mimeType?: string) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) {
    return {
      icon: <FileText size={16} />,
      bg: 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60',
      label: 'PDF',
    };
  }
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mimeType?.includes('word')) {
    return {
      icon: <FileText size={16} />,
      bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      label: 'DOC',
    };
  }
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mimeType?.includes('sheet') || mimeType?.includes('csv')) {
    return {
      icon: <FileSpreadsheet size={16} />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      label: 'SPREADSHEET',
    };
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext) || mimeType?.includes('image')) {
    return {
      icon: <ImageIcon size={16} />,
      bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      label: 'IMAGE',
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip')) {
    return {
      icon: <FileArchive size={16} />,
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      label: 'ARCHIVE',
    };
  }
  if (['ts', 'tsx', 'js', 'py', 'json', 'html', 'css'].includes(ext)) {
    return {
      icon: <FileCode size={16} />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      label: 'CODE',
    };
  }

  return {
    icon: <File size={16} />,
    bg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
    label: 'FILE',
  };
}

export function EmailAttachments({ attachments }: EmailAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  const handleDownload = (file: EmailAttachment) => {
    toast.success(`Downloading ${file.filename}...`);
  };

  return (
    <section className="pt-5 border-t border-zinc-200/80 dark:border-zinc-800">
      <div className="flex items-center gap-2 mb-3">
        <Paperclip size={14} className="text-zinc-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Attachments ({attachments.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map((file) => {
          const { icon, bg, label } = getAttachmentIcon(file.filename, file.mimeType);

          return (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}
                  title={label}
                >
                  {icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate"
                    title={file.filename}
                  >
                    {file.filename}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <span>{label}</span>
                    <span>·</span>
                    <span>{formatFileSize(file.size)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={`Download ${file.filename}`}
                  aria-label={`Download ${file.filename}`}
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
