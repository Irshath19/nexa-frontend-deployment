import DOMPurify from 'dompurify';

/**
 * Intelligent tracking parameter removal and domain/action beautifier.
 * Retains full href for navigation while displaying a readable, non-ugly label.
 */
export function cleanTrackingUrlLabel(url: string, rawText?: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname;

    // Specific domain recognition
    if (host.includes('linkedin.com')) {
      if (pathname.includes('/pulse/') || pathname.includes('/newsletters/')) {
        return 'Read article on LinkedIn →';
      }
      return 'View on LinkedIn →';
    }
    if (host.includes('github.com')) {
      if (pathname.includes('/pull/')) return `GitHub PR #${pathname.split('/').pop()} →`;
      if (pathname.includes('/issues/')) return `GitHub Issue #${pathname.split('/').pop()} →`;
      return 'View on GitHub →';
    }
    if (host.includes('docs.google.com')) return 'Open Google Document →';
    if (host.includes('meet.google.com')) return 'Join Google Meet →';
    if (host.includes('zoom.us')) return 'Join Zoom Meeting →';
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'Watch on YouTube →';
    if (host.includes('twitter.com') || host.includes('x.com')) return 'View on X (Twitter) →';
    if (host.includes('substack.com')) return 'Read Substack post →';
    if (host.includes('medium.com')) return 'Read on Medium →';

    // If rawText was provided and is already a short human label (e.g. "Click here", "Download"), keep it
    if (rawText && rawText.trim() && !rawText.trim().startsWith('http') && rawText.length < 50) {
      return rawText.trim();
    }

    // Otherwise generate clean shortened domain + path
    const cleanPath = pathname === '/' ? '' : pathname.length > 25 ? pathname.slice(0, 22) + '…' : pathname;
    return `${host}${cleanPath}`;
  } catch {
    // Fallback if URL parsing fails
    if (url.length > 45) {
      return url.slice(0, 42) + '…';
    }
    return url;
  }
}

/**
 * Check if a text is likely raw HTML or plain text.
 */
export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return /<([a-z][a-z0-9]*)\b[^>]*>/i.test(content);
}

/**
 * Regex patterns for smart text parsing
 */
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const PHONE_REGEX = /(\+?\b[1-9]\d{0,2}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b)/g;
const URL_REGEX = /(https?:\/\/[^\s<>"']+)/g;

/**
 * Sanitize and post-process HTML emails
 */
export function sanitizeAndEnhanceHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // 1. Sanitize with DOMPurify
  const sanitized = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'strong', 'em', 'u', 's', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'img', 'span', 'div', 'pre', 'code', 'details', 'summary', 'font', 'small', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id',
      'style', 'width', 'height', 'align', 'valign', 'colspan', 'rowspan',
      'border', 'cellpadding', 'cellspacing', 'bgcolor', 'color', 'open',
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'canvas'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'action'],
    ALLOW_DATA_ATTR: false,
  });

  if (typeof window === 'undefined') return sanitized;

  // 2. Post-process with DOMParser for responsive polish
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');

    // A. Links: Clean up ugly tracking text and add security attributes
    const links = doc.querySelectorAll('a');
    links.forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.classList.add(
        'email-link',
        'text-indigo-600',
        'dark:text-indigo-400',
        'font-medium',
        'underline',
        'hover:text-indigo-800',
        'dark:hover:text-indigo-300',
        'transition-colors',
        'break-all'
      );

      const href = a.getAttribute('href') || '';
      const text = a.textContent?.trim() || '';

      // If link text is literally the URL, beautify it
      if (text.startsWith('http://') || text.startsWith('https://') || text.length > 50) {
        a.textContent = cleanTrackingUrlLabel(href, text);
      }
    });

    // B. Tables: Ensure responsive horizontal scrolling on mobile without breaking outer app
    const tables = doc.querySelectorAll('table');
    tables.forEach((table) => {
      if (table.parentElement && !table.parentElement.classList.contains('email-table-wrapper')) {
        const wrapper = doc.createElement('div');
        wrapper.className =
          'email-table-wrapper overflow-x-auto max-w-full my-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 shadow-2xs';
        table.parentElement.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        table.classList.add('w-full', 'border-collapse', 'text-xs', 'sm:text-sm');
      }
    });

    // C. Images: Responsive constraints
    const images = doc.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('max-w-full', 'h-auto', 'rounded-xl', 'my-2', 'object-contain');
      img.setAttribute('loading', 'lazy');
    });

    // D. Quoted reply blocks: Convert Gmail/Outlook quotes to collapsible accordion
    const quotes = doc.querySelectorAll('div.gmail_quote, div.quoted-text, blockquote, div.WordSection1');
    quotes.forEach((q) => {
      // If it looks like a large replied thread
      if (q.textContent && q.textContent.length > 100 && q.parentElement) {
        const details = doc.createElement('details');
        details.className =
          'email-quote-accordion my-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3 transition-all text-xs';

        const summary = doc.createElement('summary');
        summary.className =
          'cursor-pointer font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 select-none flex items-center gap-1.5 list-none';
        summary.innerHTML =
          '<span class="text-indigo-500">💬</span> <span>Quoted message conversation</span>';

        const content = doc.createElement('div');
        content.className =
          'mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 pl-2 space-y-2 opacity-90';

        // Move children
        while (q.firstChild) {
          content.appendChild(q.firstChild);
        }

        details.appendChild(summary);
        details.appendChild(content);
        q.parentElement.replaceChild(details, q);
      }
    });

    return doc.body.innerHTML;
  } catch (e) {
    console.error('Email HTML enhancement error:', e);
    return sanitized;
  }
}

/**
 * Format plain text email body into styled rich HTML
 */
export function parsePlaintextEmailToHtml(text: string): string {
  if (!text) return '<p class="text-zinc-400 italic">No content provided.</p>';

  const lines = text.split(/\r?\n/);
  const processedBlocks: string[] = [];
  let inQuoteBlock = false;
  let quoteLines: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const pText = currentParagraphLines.join('<br />');
      const enhanced = enhancePlaintextLine(pText);
      processedBlocks.push(`<p class="leading-relaxed mb-4 text-zinc-800 dark:text-zinc-200 text-sm sm:text-base">${enhanced}</p>`);
      currentParagraphLines = [];
    }
  };

  const flushQuote = () => {
    if (quoteLines.length > 0) {
      const qContent = quoteLines.map((l) => enhancePlaintextLine(l)).join('<br />');
      processedBlocks.push(`
        <details class="email-quote-accordion my-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 p-3 text-xs">
          <summary class="cursor-pointer font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 select-none flex items-center gap-1.5">
            <span class="text-indigo-500">💬</span> <span>Quoted message conversation</span>
          </summary>
          <div class="mt-3 pt-3 border-t border-zinc-200/70 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-400 pl-2 leading-relaxed">
            ${qContent}
          </div>
        </details>
      `);
      quoteLines = [];
      inQuoteBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for start of quoted block
    if (
      trimmed.startsWith('>') ||
      /^On\s+.+wrote:$/i.test(trimmed) ||
      /^---------- Forwarded message ---------/i.test(trimmed) ||
      /^-----Original Message-----/i.test(trimmed)
    ) {
      flushParagraph();
      inQuoteBlock = true;
      quoteLines.push(rawLine.replace(/^>\s?/, ''));
      continue;
    }

    if (inQuoteBlock) {
      quoteLines.push(rawLine.replace(/^>\s?/, ''));
      continue;
    }

    // Check for signature markers
    if (
      trimmed === '--' ||
      trimmed === '---' ||
      /^Best regards,?/i.test(trimmed) ||
      /^Warm regards,?/i.test(trimmed) ||
      /^Sincerely,?/i.test(trimmed) ||
      /^Thanks & Regards,?/i.test(trimmed)
    ) {
      flushParagraph();
      const remainingSignature = lines.slice(i).join('<br />');
      processedBlocks.push(`
        <div class="email-signature mt-6 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          ${enhancePlaintextLine(remainingSignature)}
        </div>
      `);
      break;
    }

    // Empty line -> paragraph break
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Bullet list items
    if (/^[•*-]\s+/.test(trimmed)) {
      flushParagraph();
      const bulletContent = enhancePlaintextLine(trimmed.replace(/^[•*-]\s+/, ''));
      processedBlocks.push(`
        <div class="flex items-start gap-2.5 my-1.5 pl-2 text-sm sm:text-base text-zinc-800 dark:text-zinc-200">
          <span class="text-indigo-500 font-bold mt-1">•</span>
          <span>${bulletContent}</span>
        </div>
      `);
      continue;
    }

    currentParagraphLines.push(rawLine);
  }

  flushParagraph();
  flushQuote();

  return processedBlocks.join('');
}

/**
 * Replace raw URLs, emails, and phone numbers in a plain text snippet with safe rich HTML
 */
function enhancePlaintextLine(text: string): string {
  if (!text) return '';

  // 1. URLs
  let result = text.replace(URL_REGEX, (url) => {
    const cleanLabel = cleanTrackingUrlLabel(url);
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="email-link text-indigo-600 dark:text-indigo-400 font-semibold underline hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 break-all">${cleanLabel}</a>`;
  });

  // 2. Email addresses
  result = result.replace(EMAIL_REGEX, (email) => {
    return `<a href="mailto:${email}" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">${email}</a>`;
  });

  // 3. Phone numbers (only if contains formatting/country code to avoid pure numeric False Positives)
  result = result.replace(PHONE_REGEX, (match) => {
    // Avoid dates like 2026-08-15
    if (/^\d{4}-\d{2}-\d{2}$/.test(match)) return match;
    const cleanDigits = match.replace(/[^\d+]/g, '');
    if (cleanDigits.length < 8 || cleanDigits.length > 15) return match;
    return `<a href="tel:${cleanDigits}" class="text-indigo-600 dark:text-indigo-400 font-medium hover:underline inline-flex items-center gap-1">📞 ${match}</a>`;
  });

  return result;
}
