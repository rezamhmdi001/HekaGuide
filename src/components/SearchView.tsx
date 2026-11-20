import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, Search, X } from 'lucide-react';
import { searchAtlas, toPersianDigits } from '../utils/atlasLogic';
import { BidiText } from './BidiText';

interface SearchViewProps {
  completedIds: string[];
  onSelectChapter: (chapterId: string) => void;
  onOpenGlossaryTerm: (term: string) => void;
}

const SUGGESTIONS = [
  'TLS',
  'KV-Cache',
  'systemd',
  '525',
  'WAL',
  'CORS',
  'MCP',
  'Docker UFW',
  'Idempotency',
  'reflog',
];

export const SearchView: React.FC<SearchViewProps> = ({
  completedIds,
  onSelectChapter,
  onOpenGlossaryTerm,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const completedSet = new Set(completedIds);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => searchAtlas(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink-primary)]">
          جستجو در کل اطلس
        </h1>
        <p className="mt-1.5 text-xs leading-6 text-[var(--ink-secondary)] sm:text-sm">
          جستجوی آنی در عناوین فارسی، اصطلاحات انگلیسی، دستورهای CLI، کد خطاها و واژه‌نامه فنی.
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="مثلاً: KV-Cache، خطای 525، WAL، systemd، توکن فارسی..."
          aria-label="جستجو در فصل‌ها و واژه‌نامه"
          className="h-12 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] ps-10 pe-10 text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="پاک کردن جستجو"
            className="absolute end-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick suggestions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-[var(--ink-muted)] me-1">پیشنهاد سریع:</span>
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            dir="ltr"
            onClick={() => setQuery(item)}
            className="min-h-[34px] rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 font-mono text-xs text-[var(--ink-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Results */}
      {!hasQuery ? (
        <div className="mt-10 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center">
          <p className="text-sm text-[var(--ink-secondary)]">
            عبارتی بنویسید یا روی یکی از کلیدواژه‌های بالا بزنید تا در میان{' '}
            {toPersianDigits(120)} فصل و واژه‌نامه جستجو شود.
          </p>
        </div>
      ) : results.chapters.length === 0 && results.glossary.length === 0 ? (
        <div className="mt-10 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center">
          <p className="text-sm font-medium text-[var(--ink-primary)]">
            نتیجه‌ای برای «{query}» پیدا نشد.
          </p>
          <p className="mt-1.5 text-xs text-[var(--ink-muted)]">
            املای انگلیسی (مثلاً `TLS` یا `Postgres`) یا یک واژه کوتاه‌تر را امتحان کنید.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-8">
          {results.chapters.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                <h2 className="text-xs font-semibold text-[var(--ink-muted)]">
                  فصل‌های مرتبط ({toPersianDigits(results.chapters.length)})
                </h2>
              </div>
              <ul className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {results.chapters.slice(0, 30).map((ch) => {
                  const isDone = completedSet.has(ch.id);
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        onClick={() => onSelectChapter(ch.id)}
                        className="flex min-h-[60px] w-full items-start justify-between gap-3 p-4 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--ink-muted)]">
                            <span className="font-mono text-[var(--accent)] bidi-ltr">
                              {ch.code}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{toPersianDigits(ch.readMinutes)} دقیقه</span>
                            <span aria-hidden="true">·</span>
                            <span>{ch.difficulty}</span>
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[var(--ink-primary)]">
                            <BidiText text={ch.title} />
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[var(--ink-secondary)]">
                            <BidiText text={ch.subtitle} />
                          </p>
                        </div>
                        <div className="mt-1 shrink-0">
                          {isDone ? (
                            <Check className="h-4 w-4 text-[var(--ok-ink)]" />
                          ) : (
                            <ArrowLeft className="h-4 w-4 text-[var(--ink-muted)]" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {results.glossary.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                <h2 className="text-xs font-semibold text-[var(--ink-muted)]">
                  مدخل‌های واژه‌نامه ({toPersianDigits(results.glossary.length)})
                </h2>
              </div>
              <ul className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {results.glossary.map((entry) => (
                  <li key={entry.term}>
                    <button
                      type="button"
                      onClick={() => onOpenGlossaryTerm(entry.term)}
                      className="flex min-h-[56px] w-full items-start justify-between gap-3 p-4 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <code
                            dir="ltr"
                            className="font-mono text-xs font-semibold text-[var(--accent)]"
                          >
                            {entry.term}
                          </code>
                          <span className="text-xs font-medium text-[var(--ink-primary)]">
                            — {entry.persianTitle}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-6 text-[var(--ink-secondary)]">
                          <BidiText text={entry.definition} />
                        </p>
                      </div>
                      <BookOpen className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
