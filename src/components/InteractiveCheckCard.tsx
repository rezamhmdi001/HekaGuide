import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import type { CheckOutcome, InteractiveCheck } from '../types/atlas';
import { BidiText } from './BidiText';

interface InteractiveCheckCardProps {
  chapterId: string;
  check: InteractiveCheck;
  savedOutcome?: CheckOutcome;
  onOutcome: (outcome: CheckOutcome) => void;
  onOpenGlossaryTerm?: (term: string) => void;
}

const CHECK_LABELS: Record<InteractiveCheck['type'], string> = {
  triage: 'آزمون تریاژ میدانی',
  spot_bug: 'شکار باگ در کد',
  predict: 'پیش‌بینی رفتار سیستم',
  recall: 'کارت بازیابی فعال (Active Recall)',
};

export const InteractiveCheckCard: React.FC<InteractiveCheckCardProps> = ({
  chapterId,
  check,
  savedOutcome,
  onOutcome,
  onOpenGlossaryTerm,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [revealedRecall, setRevealedRecall] = useState(false);

  useEffect(() => {
    setSelectedOptionId(null);
    setSelectedLine(null);
    setRevealedRecall(false);
  }, [chapterId]);

  const handleReset = () => {
    setSelectedOptionId(null);
    setSelectedLine(null);
    setRevealedRecall(false);
  };

  return (
    <section
      aria-label="سنجش تعاملی فصل"
      className="my-8 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
            {CHECK_LABELS[check.type]}
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {savedOutcome === 'passed' && (
            <span className="inline-flex items-center gap-1 font-medium text-[var(--ok-ink)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              تسلط ثبت‌شده
            </span>
          )}
          {savedOutcome === 'review' && (
            <span className="font-medium text-[var(--warn-ink)]">
              در لیست مرور مجدد
            </span>
          )}
          {savedOutcome === 'failed' && (
            <span className="font-medium text-[var(--err-ink)]">
              نیازمند تمرین مجدد
            </span>
          )}
          {(selectedOptionId || selectedLine !== null || revealedRecall) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              تلاش دوباره
            </button>
          )}
        </div>
      </div>

      {/* TRIAGE OR PREDICT */}
      {(check.type === 'triage' || check.type === 'predict') && (
        <div>
          <p className="mb-4 text-sm leading-7 text-[var(--ink-primary)] sm:text-[15px]">
            <BidiText text={check.prompt} onOpenGlossaryTerm={onOpenGlossaryTerm} />
          </p>

          {(check.type === 'triage' ? check.logSnippet : check.snippet) && (
            <div
              dir="ltr"
              className="mb-4 max-w-full overflow-x-auto rounded-md border border-[var(--code-block-border)] bg-[var(--code-block-bg)] p-3.5 text-left"
            >
              <pre className="m-0 font-mono text-xs leading-6 text-[var(--code-block-ink)]">
                <code>{check.type === 'triage' ? check.logSnippet : check.snippet}</code>
              </pre>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {check.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const hasAnswered = selectedOptionId !== null;
              let stateStyle =
                'border-[var(--border-hairline)] bg-[var(--bg-canvas)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]';

              if (hasAnswered) {
                if (opt.isCorrect) {
                  stateStyle = 'border-[var(--ok-border)] bg-[var(--ok-bg)]';
                } else if (isSelected && !opt.isCorrect) {
                  stateStyle = 'border-[var(--err-border)] bg-[var(--err-bg)]';
                } else {
                  stateStyle = 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOptionId(opt.id);
                    onOutcome(opt.isCorrect ? 'passed' : 'failed');
                  }}
                  className={`min-h-[46px] w-full rounded-md border px-4 py-3 text-start text-sm leading-6 transition-colors cursor-pointer ${stateStyle}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[var(--ink-primary)]">
                      <BidiText text={opt.label} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                    </span>
                    {hasAnswered && opt.isCorrect && (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ok-ink)]" />
                    )}
                    {hasAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--err-ink)]" />
                    )}
                  </div>
                  {isSelected && (
                    <p
                      className={`mt-2 border-t pt-2 text-xs leading-6 ${
                        opt.isCorrect
                          ? 'border-[var(--ok-border)] text-[var(--ok-ink)]'
                          : 'border-[var(--err-border)] text-[var(--err-ink)]'
                      }`}
                    >
                      <BidiText text={opt.feedback} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SPOT BUG */}
      {check.type === 'spot_bug' && (
        <div>
          <p className="mb-4 text-sm leading-7 text-[var(--ink-primary)] sm:text-[15px]">
            <BidiText text={check.prompt} onOpenGlossaryTerm={onOpenGlossaryTerm} />
          </p>

          <div
            dir="ltr"
            className="overflow-x-auto rounded-md border border-[var(--code-block-border)] bg-[var(--code-block-bg)] py-2 text-left"
          >
            {check.lines.map((line) => {
              const isSelected = selectedLine === line.lineNumber;
              const showBugHighlight = selectedLine !== null && line.isBug;
              const showWrongHighlight = isSelected && !line.isBug;

              let rowClass = 'hover:bg-white/5 text-[var(--code-block-ink)]';
              if (showBugHighlight) {
                rowClass = 'bg-emerald-500/20 text-emerald-200';
              } else if (showWrongHighlight) {
                rowClass = 'bg-red-500/20 text-red-200';
              }

              return (
                <button
                  key={line.lineNumber}
                  type="button"
                  onClick={() => {
                    setSelectedLine(line.lineNumber);
                    onOutcome(line.isBug ? 'passed' : 'failed');
                  }}
                  className={`flex min-h-[38px] w-full items-center gap-3 px-3 py-1 font-mono text-xs leading-6 transition-colors cursor-pointer text-left ${rowClass}`}
                >
                  <span className="w-6 shrink-0 select-none text-right text-[var(--code-block-muted)] tabular-nums">
                    {line.lineNumber}
                  </span>
                  <code className="whitespace-pre">{line.code}</code>
                </button>
              );
            })}
          </div>

          {selectedLine !== null && (
            <div
              className={`mt-4 rounded-md border p-3.5 text-xs leading-6 sm:text-sm ${
                check.lines.find((l) => l.lineNumber === selectedLine)?.isBug
                  ? 'border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ink-primary)]'
                  : 'border-[var(--err-border)] bg-[var(--err-bg)] text-[var(--ink-primary)]'
              }`}
            >
              <div className="mb-1 font-semibold">
                {check.lines.find((l) => l.lineNumber === selectedLine)?.isBug
                  ? 'دقیقاً همین خط مقصر است!'
                  : 'این خط مشکل اصلی نیست؛ خط سبزرنگ بالا را ببینید:'}
              </div>
              <BidiText text={check.explanation} onOpenGlossaryTerm={onOpenGlossaryTerm} />
            </div>
          )}
        </div>
      )}

      {/* RECALL */}
      {check.type === 'recall' && (
        <div>
          <p className="mb-4 text-sm leading-7 text-[var(--ink-primary)] sm:text-[15px]">
            <BidiText text={check.question} onOpenGlossaryTerm={onOpenGlossaryTerm} />
          </p>

          {!revealedRecall ? (
            <button
              type="button"
              onClick={() => setRevealedRecall(true)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-sm font-medium text-[var(--ink-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              <span>مشاهده پاسخ مرجع</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4 text-sm leading-7 text-[var(--ink-primary)]">
                <div className="mb-1.5 text-xs font-semibold text-[var(--ink-muted)]">
                  پاسخ مرجع
                </div>
                <BidiText text={check.modelAnswer} onOpenGlossaryTerm={onOpenGlossaryTerm} />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOutcome('passed')}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors cursor-pointer ${
                    savedOutcome === 'passed'
                      ? 'border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-ink)]'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[var(--ok-border)]'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>مسلط شدم</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOutcome('review')}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors cursor-pointer ${
                    savedOutcome === 'review'
                      ? 'border-[var(--warn-border)] bg-[var(--warn-bg)] text-[var(--warn-ink)]'
                      : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:border-[var(--warn-border)]'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>نیاز به مرور مجدد</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
