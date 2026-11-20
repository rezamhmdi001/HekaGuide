import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpLeft, BookOpen, Search, X } from 'lucide-react';
import { GLOSSARY } from '../data/glossary';
import { CHAPTER_MAP } from '../data/manifest';
import { normalizeSearchText, toPersianDigits } from '../utils/atlasLogic';
import { BidiText } from './BidiText';

interface GlossaryDrawerProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
}

const CATEGORIES = ['همه', ...Array.from(new Set(GLOSSARY.map((g) => g.category)))];

export const GlossaryDrawer: React.FC<GlossaryDrawerProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('همه');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      if (initialQuery) setCategory('همه');
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = normalizeSearchText(query);
    return GLOSSARY.filter((item) => {
      if (category !== 'همه' && item.category !== category) return false;
      if (!q) return true;
      const hay = normalizeSearchText(
        `${item.term} ${item.persianTitle} ${item.category} ${item.definition}`
      );
      return hay.includes(q);
    });
  }, [query, category]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="واژه‌نامه فنی اطلس"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-s border-[var(--border-hairline)] bg-[var(--bg-canvas)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-semibold text-[var(--ink-primary)]">
              واژه‌نامه فنی ({toPersianDigits(GLOSSARY.length)} اصطلاح)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن واژه‌نامه"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی اصطلاح (مثلاً TLS, WAL, KV-Cache)..."
              className="h-11 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] ps-9 pe-3 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[34px] shrink-0 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--ink-muted)]">
              اصطلاحی با این عبارت پیدا نشد.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-hairline)]">
              {filtered.map((entry) => {
                const related = entry.relatedChapterId
                  ? CHAPTER_MAP[entry.relatedChapterId]
                  : undefined;

                return (
                  <article key={entry.term} className="py-3.5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <code
                        dir="ltr"
                        className="font-mono text-sm font-semibold text-[var(--ink-primary)] bidi-ltr"
                      >
                        {entry.term}
                      </code>
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        {entry.category}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-[var(--ink-secondary)]">
                      {entry.persianTitle}
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-[var(--ink-primary)]">
                      <BidiText text={entry.definition} />
                    </p>
                    {related && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectChapter(related.id);
                          onClose();
                        }}
                        className="mt-2 inline-flex min-h-[36px] items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline cursor-pointer"
                      >
                        <span>مطالعه در فصل مرتبط</span>
                        <span className="font-mono text-[11px] bidi-ltr">
                          ({related.id})
                        </span>
                        <ArrowUpLeft className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
