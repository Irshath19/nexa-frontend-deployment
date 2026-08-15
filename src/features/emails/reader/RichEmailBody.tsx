import React, { useMemo } from 'react';
import {
  isHtmlContent,
  sanitizeAndEnhanceHtml,
  parsePlaintextEmailToHtml,
} from './emailSanitizer';

interface RichEmailBodyProps {
  body: string | null;
  bodyPreview?: string;
}

export function RichEmailBody({ body, bodyPreview }: RichEmailBodyProps) {
  const renderedHtml = useMemo(() => {
    if (body && body.trim()) {
      if (isHtmlContent(body)) {
        return sanitizeAndEnhanceHtml(body);
      }
      return parsePlaintextEmailToHtml(body);
    }
    if (bodyPreview && bodyPreview.trim()) {
      return parsePlaintextEmailToHtml(bodyPreview);
    }
    return '<p class="text-zinc-400 italic">No content available in this email.</p>';
  }, [body, bodyPreview]);

  return (
    <article className="nexa-email-reader-body py-3 sm:py-4">
      <div
        className="email-prose text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-[1.68] tracking-normal break-words overflow-hidden"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </article>
  );
}
