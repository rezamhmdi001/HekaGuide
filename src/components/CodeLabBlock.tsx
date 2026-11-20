import React, { useState } from 'react';
import { AlertTriangle, Check, Copy } from 'lucide-react';
import type { CodeSnippet } from '../types/atlas';
import { BidiText } from './BidiText';

interface CodeLabBlockProps {
  snippet: CodeSnippet;
  onOpenGlossaryTerm?: (term: string) => void;
}

export const CodeLabBlock: React.FC<CodeLabBlockProps> = ({
  snippet,
  onOpenGlossaryTerm,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored gracefully
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 py-2.5">
        <div className="min-w-0 text-xs font-medium text-[var(--ink-primary)] sm:text-sm">
          <BidiText text={snippet.title} onOpenGlossaryTerm={onOpenGlossaryTerm} />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] uppercase text-[var(--ink-muted)] bidi-ltr">
            {snippet.language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
            aria-label="کپی کد"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--ok-ink)]" />
                <span className="text-[var(--ok-ink)]">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div
        dir="ltr"
        className="max-w-full overflow-x-auto bg-[var(--code-block-bg)] p-4 text-left"
      >
        <pre className="m-0 font-mono text-[12.5px] leading-6 text-[var(--code-block-ink)] sm:text-[13px]">
          <code>{snippet.code}</code>
        </pre>
      </div>

      {snippet.explanations.length > 0 && (
        <div className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)] px-4 py-1">
          {snippet.explanations.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 py-2.5 text-xs leading-6 sm:flex-row sm:items-baseline sm:gap-3 sm:text-sm"
            >
              <code
                dir="ltr"
                className="bidi-code shrink-0 self-start font-semibold text-[var(--accent)]"
              >
                {item.token}
              </code>
              <span className="text-[var(--ink-secondary)]">
                <BidiText text={item.meaning} onOpenGlossaryTerm={onOpenGlossaryTerm} />
              </span>
            </div>
          ))}
        </div>
      )}

      {snippet.trap && (
        <div className="flex items-start gap-2.5 border-t border-[var(--warn-border)] bg-[var(--warn-bg)] px-4 py-3 text-xs leading-6 text-[var(--ink-primary)] sm:text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warn-ink)]" />
          <div>
            <span className="font-semibold text-[var(--warn-ink)] me-1.5">
              تله رایج:
            </span>
            <BidiText text={snippet.trap} onOpenGlossaryTerm={onOpenGlossaryTerm} />
          </div>
        </div>
      )}
    </div>
  );
};
