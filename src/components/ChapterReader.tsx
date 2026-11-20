import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Layers,
  Lightbulb,
  Link2,
  ListTree,
  Minimize2,
  NotebookPen,
  Share2,
  Timer,
  X,
} from 'lucide-react';
import { getChapterCognitiveMeta } from '../data/chapterMedia';
import { CHAPTER_MAP, DOMAIN_MAP, TRACK_MAP } from '../data/manifest';
import type { Chapter, CheckOutcome, GroupNote, StudyGroup } from '../types/atlas';
import { getAdjacentChapters, toPersianDigits } from '../utils/atlasLogic';
import { BidiText } from './BidiText';
import { ChapterGroupNotes } from './ChapterGroupNotes';
import { CodeLabBlock } from './CodeLabBlock';
import { DiagramView } from './DiagramView';
import { DomainVisualPlate } from './DomainVisualPlate';
import { FocusSprintTimer } from './FocusSprintTimer';
import { InteractiveCheckCard } from './InteractiveCheckCard';
import { TocSidebar } from './TocSidebar';
import { YouTubeEmbedCard } from './YouTubeEmbedCard';

interface ChapterReaderProps {
  chapter: Chapter | null;
  loading: boolean;
  error: string | null;
  isCompleted: boolean;
  isBookmarked: boolean;
  savedCheckOutcome?: CheckOutcome;
  noteValue: string;
  completedIds: string[];
  focusMode: boolean;
  adhdMode: boolean;
  currentUid?: string;
  activeGroup: StudyGroup | null;
  groupNotes: GroupNote[];
  onExitFocusMode: () => void;
  onToggleAdhdMode: () => void;
  onCompleteFocusSprint: (minutes: number) => void;
  onToggleComplete: (chapterId: string) => void;
  onToggleBookmark: (chapterId: string) => void;
  onShareChapter: (chapterId: string) => void;
  onRecordCheck: (chapterId: string, outcome: CheckOutcome) => void;
  onUpdateNote: (chapterId: string, text: string) => void;
  onPostGroupNote: (chapterId: string, body: string) => Promise<void>;
  onDeleteGroupNote: (noteId: string) => Promise<void>;
  onOpenGroupTab: () => void;
  onSelectChapter: (chapterId: string) => void;
  onOpenGlossaryTerm: (term: string) => void;
}

const ADHD_STEPS = [
  { id: 0, shortLabel: '۱. تصویر بزرگ' },
  { id: 1, shortLabel: '۲. داستان مسئله' },
  { id: 2, shortLabel: '۳. مدل ذهنی' },
  { id: 3, shortLabel: '۴. آزمایشگاه کد' },
  { id: 4, shortLabel: '۵. تجربه تولید' },
  { id: 5, shortLabel: '۶. آزمون و تکمیل' },
];

export const ChapterReader: React.FC<ChapterReaderProps> = ({
  chapter,
  loading,
  error,
  isCompleted,
  isBookmarked,
  savedCheckOutcome,
  noteValue,
  completedIds,
  focusMode,
  adhdMode,
  currentUid,
  activeGroup,
  groupNotes,
  onExitFocusMode,
  onToggleAdhdMode,
  onCompleteFocusSprint,
  onToggleComplete,
  onToggleBookmark,
  onShareChapter,
  onRecordCheck,
  onUpdateNote,
  onPostGroupNote,
  onDeleteGroupNote,
  onOpenGroupTab,
  onSelectChapter,
  onOpenGlossaryTerm,
}) => {
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(Boolean(noteValue));
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [timerOpen, setTimerOpen] = useState(false);
  const [adhdStep, setAdhdStep] = useState(0);

  useEffect(() => {
    setDeepDiveOpen(false);
    setNoteOpen(Boolean(noteValue));
    setMobileTocOpen(false);
    setAdhdStep(0);
  }, [chapter?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter?.id, adhdMode, adhdStep]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-40 rounded bg-[var(--bg-subtle)]" />
          <div className="h-8 w-3/4 rounded bg-[var(--bg-subtle)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--bg-subtle)]" />
          <div className="mt-8 h-32 w-full rounded-lg bg-[var(--bg-subtle)]" />
          <div className="h-48 w-full rounded-lg bg-[var(--bg-subtle)]" />
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--ink-secondary)]">
          {error ?? 'فصل مورد نظر بارگذاری نشد.'}
        </p>
        <button
          type="button"
          onClick={() => onSelectChapter('T01-C01')}
          className="mt-4 inline-flex min-h-[44px] items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 text-sm font-medium text-[var(--ink-primary)] hover:border-[var(--accent)] cursor-pointer"
        >
          بازگشت به فصل اول
        </button>
      </div>
    );
  }

  const domain = DOMAIN_MAP[chapter.domainId];
  const track = TRACK_MAP[chapter.trackId];
  const { prev, next, isNextNewTrack } = getAdjacentChapters(chapter.id);
  const cognitive = getChapterCognitiveMeta(
    chapter.id,
    chapter.domainId,
    chapter.subtitle,
    chapter.mentalModel.rulesOfThumb[0] ?? chapter.deepDive.takeAway
  );

  const showStep = (stepIndex: number) => !adhdMode || adhdStep === stepIndex;

  const goAdhdStep = (nextStep: number) => {
    setAdhdStep(Math.min(ADHD_STEPS.length - 1, Math.max(0, nextStep)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Subtle 2px top reading progress bar */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-[2px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-75"
          style={{
            width: `${
              adhdMode
                ? Math.round(((adhdStep + 1) / ADHD_STEPS.length) * 100)
                : scrollProgress
            }%`,
          }}
        />
      </div>

      {/* Focus mode exit bar */}
      {focusMode && (
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 px-4 py-2 backdrop-blur-sm">
          <span className="font-mono text-xs text-[var(--ink-muted)] bidi-ltr">
            {chapter.code}
          </span>
          <button
            type="button"
            onClick={onExitFocusMode}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--accent)] cursor-pointer"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>خروج از حالت تمرکز</span>
          </button>
        </div>
      )}

      <div
        className={`mx-auto w-full px-4 py-6 sm:px-6 lg:py-8 ${
          focusMode
            ? 'max-w-[720px]'
            : 'max-w-7xl lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10'
        }`}
      >
        {/* Desktop Collapsible Hierarchical TOC */}
        {!focusMode && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pe-2">
              <div className="mb-3 flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                <span className="text-xs font-semibold text-[var(--ink-muted)]">
                  فهرست اطلس
                </span>
                <span className="font-mono text-[11px] text-[var(--ink-muted)] tabular-nums">
                  {toPersianDigits(completedIds.length)}/{toPersianDigits(120)}
                </span>
              </div>
              <TocSidebar
                activeChapterId={chapter.id}
                completedIds={completedIds}
                onSelectChapter={onSelectChapter}
              />
            </div>
          </aside>
        )}

        {/* Main Reading Column */}
        <article className="mx-auto w-full max-w-[700px] min-w-0">
          {/* 1. Chapter Header */}
          <header className="border-b border-[var(--border-hairline)] pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-muted)]">
                <span
                  dir="ltr"
                  className="inline-block font-mono text-[11.5px] font-medium text-[var(--accent)] bidi-ltr"
                >
                  {chapter.code}
                </span>
                <span aria-hidden="true">·</span>
                <span>{toPersianDigits(chapter.readMinutes)} دقیقه مطالعه</span>
                <span aria-hidden="true">·</span>
                <span>{chapter.difficulty}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {!focusMode && (
                  <button
                    type="button"
                    onClick={() => setMobileTocOpen(true)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] lg:hidden cursor-pointer"
                    aria-label="باز کردن فهرست فصل‌ها"
                  >
                    <ListTree className="h-3.5 w-3.5" />
                    <span>فهرست</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleBookmark(chapter.id)}
                  aria-pressed={isBookmarked}
                  aria-label={isBookmarked ? 'حذف نشان فصل' : 'نشان‌گذاری فصل'}
                  className={`inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  <Bookmark
                    className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                  />
                  <span className="hidden sm:inline">
                    {isBookmarked ? 'نشان‌شده' : 'نشان'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onShareChapter(chapter.id)}
                  aria-label="اشتراک‌گذاری لینک مستقیم فصل"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">اشتراک‌گذاری</span>
                </button>
              </div>
            </div>

            {domain && track && (
              <div className="mt-3 text-xs text-[var(--ink-muted)]">
                {domain.title} / {track.title}
              </div>
            )}

            <h1 className="mt-2.5 text-2xl font-bold leading-snug tracking-tight text-[var(--ink-primary)] sm:text-[28px]">
              <BidiText text={chapter.title} onOpenGlossaryTerm={onOpenGlossaryTerm} />
            </h1>

            <p className="mt-3 text-sm leading-7 text-[var(--ink-secondary)] sm:text-base">
              <BidiText text={chapter.subtitle} onOpenGlossaryTerm={onOpenGlossaryTerm} />
            </p>

            {/* Cognitive & ADHD Reading Workspace Controls (In-content, Zero Sticky Bloat) */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onToggleAdhdMode}
                aria-pressed={adhdMode}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-3.5 text-xs font-semibold transition-colors cursor-pointer ${
                  adhdMode
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>
                  {adhdMode
                    ? 'حالت گام‌به‌گام ADHD فعال است'
                    : 'حالت مطالعه گام‌به‌گام (مناسب ADHD)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimerOpen((v) => !v)}
                aria-expanded={timerOpen}
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors cursor-pointer ${
                  timerOpen
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <Timer className="h-3.5 w-3.5" />
                <span>اسپرینت تمرکز</span>
              </button>
            </div>

            {timerOpen && (
              <div className="mt-3">
                <FocusSprintTimer onCompleteSprint={onCompleteFocusSprint} />
              </div>
            )}

            {/* ADHD Step-by-Step Progress Stepper */}
            {adhdMode && (
              <nav
                aria-label="گام‌های مطالعه خردشده"
                className="mt-4 rounded-lg border border-[var(--accent-border)] bg-[var(--bg-surface)] p-3"
              >
                <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
                  <span>
                    گام {toPersianDigits(adhdStep + 1)} از {toPersianDigits(ADHD_STEPS.length)} — بدون شلوغی و بار اضافی ذهن
                  </span>
                  <span className="font-mono text-[var(--accent)]">
                    {toPersianDigits(
                      Math.round(((adhdStep + 1) / ADHD_STEPS.length) * 100)
                    )}
                    ٪
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {ADHD_STEPS.map((step) => {
                    const active = adhdStep === step.id;
                    const passed = adhdStep > step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goAdhdStep(step.id)}
                        className={`min-h-[36px] rounded-md border px-2.5 text-start text-[11px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white font-semibold'
                            : passed
                            ? 'border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-ink)]'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                        }`}
                      >
                        {step.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </nav>
            )}
          </header>

          {/* STEP 0: 30-Second Cognitive Hook, Intuition Analogy & Visual Plate */}
          {showStep(0) && (
            <section className="mt-6">
              <div className="rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)]">
                  <Lightbulb className="h-4 w-4" />
                  <span>در ۳۰ ثانیه: تصویر بزرگ و تشبیه شهودی</span>
                </div>
                <p className="mt-2.5 text-sm font-medium leading-7 text-[var(--ink-primary)]">
                  <BidiText text={cognitive.hook} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </p>
                <div className="mt-3 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-xs leading-7 text-[var(--ink-secondary)] sm:text-sm">
                  <span className="font-bold text-[var(--ink-primary)] me-1.5">
                    تصویر ذهنی ساده:
                  </span>
                  <BidiText text={cognitive.analogy} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </div>
              </div>

              {cognitive.showVisualPlate && (
                <DomainVisualPlate domainId={chapter.domainId} />
              )}
            </section>
          )}

          {/* STEP 1: Origin Story */}
          {showStep(1) && (
            <section className="atlas-prose mt-7">
              <h2 className="mb-3 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                داستان پیدایش و مسئله واقعی
              </h2>
              <div className="space-y-4">
                {chapter.originStory.map((p, i) => (
                  <p key={i} className="text-[var(--ink-primary)]">
                    <BidiText text={p} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* STEP 2: Mental Model, Diagram & Optional Curated YouTube Video */}
          {showStep(2) && (
            <section
              className={`atlas-prose mt-8 ${
                !adhdMode ? 'border-t border-[var(--border-hairline)] pt-7' : ''
              }`}
            >
              <h2 className="mb-3 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                مدل ذهنی و سازوکار زیر کاپوت
              </h2>
              <div className="space-y-4">
                {chapter.mentalModel.paragraphs.map((p, i) => (
                  <p key={i} className="text-[var(--ink-primary)]">
                    <BidiText text={p} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                  </p>
                ))}
              </div>

              <DiagramView
                diagram={chapter.mentalModel.diagram}
                onOpenGlossaryTerm={onOpenGlossaryTerm}
              />

              {cognitive.video && <YouTubeEmbedCard video={cognitive.video} />}

              <div className="mt-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4 sm:p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                  قواعد سرانگشتی مهندسی (Rules of Thumb)
                </h3>
                <ul className="space-y-2.5 text-sm leading-7 text-[var(--ink-primary)]">
                  {chapter.mentalModel.rulesOfThumb.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>
                        <BidiText text={rule} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* STEP 3: Under the Hood Lab */}
          {showStep(3) && (
            <section
              className={`mt-8 ${
                !adhdMode ? 'border-t border-[var(--border-hairline)] pt-7' : ''
              }`}
            >
              <h2 className="mb-2 text-base font-bold text-[var(--ink-primary)] sm:text-lg">
                آزمایشگاه عملی (دستور، کد و تحلیل)
              </h2>
              <p className="mb-4 text-xs leading-6 text-[var(--ink-secondary)]">
                کدها و دستورهای زیر برای بررسی دقیق و اجرای واقعی در محیط کار طراحی شده‌اند؛ هر خط مهم زیرش توضیح داده شده است.
              </p>
              {chapter.lab.map((snippet, idx) => (
                <CodeLabBlock
                  key={idx}
                  snippet={snippet}
                  onOpenGlossaryTerm={onOpenGlossaryTerm}
                />
              ))}
            </section>
          )}

          {/* STEP 4: Production War Story + Deep Dive */}
          {showStep(4) && (
            <>
              <section
                className={`mt-8 ${
                  !adhdMode ? 'border-t border-[var(--border-hairline)] pt-7' : ''
                }`}
              >
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[var(--err-ink)]">
                    <Flame className="h-4 w-4" />
                    <span>روایت خطای واقعی در تولید (Production War Story)</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--ink-primary)]">
                    <BidiText
                      text={chapter.warStory.title}
                      onOpenGlossaryTerm={onOpenGlossaryTerm}
                    />
                  </h3>

                  <dl className="mt-4 divide-y divide-[var(--border-hairline)] text-sm leading-7">
                    <div className="py-3 first:pt-0">
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        نشانه (Symptom)
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        <BidiText
                          text={chapter.warStory.symptom}
                          onOpenGlossaryTerm={onOpenGlossaryTerm}
                        />
                      </dd>
                    </div>
                    <div className="py-3">
                      <dt className="text-xs font-semibold text-[var(--ink-muted)]">
                        ریشه واقعی (Root Cause)
                      </dt>
                      <dd className="mt-1 text-[var(--ink-primary)]">
                        <BidiText
                          text={chapter.warStory.rootCause}
                          onOpenGlossaryTerm={onOpenGlossaryTerm}
                        />
                      </dd>
                    </div>
                    <div className="pt-3">
                      <dt className="text-xs font-semibold text-[var(--ok-ink)]">
                        قاعده پیشگیری (Prevention Rule)
                      </dt>
                      <dd className="mt-1 font-medium text-[var(--ink-primary)]">
                        <BidiText
                          text={chapter.warStory.preventionRule}
                          onOpenGlossaryTerm={onOpenGlossaryTerm}
                        />
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section className="mt-6">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                  <button
                    type="button"
                    onClick={() => setDeepDiveOpen((v) => !v)}
                    aria-expanded={deepDiveOpen}
                    className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Layers className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-[var(--ink-muted)]">
                          کاوش عمیق‌تر (اختیاری)
                        </div>
                        <div className="text-sm font-semibold text-[var(--ink-primary)]">
                          <BidiText
                            text={chapter.deepDive.title}
                            onOpenGlossaryTerm={onOpenGlossaryTerm}
                          />
                        </div>
                      </div>
                    </div>
                    {deepDiveOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                    )}
                  </button>

                  {deepDiveOpen && (
                    <div className="border-t border-[var(--border-hairline)] px-4 py-4 sm:px-5">
                      <div className="atlas-prose space-y-3.5 text-sm">
                        {chapter.deepDive.content.map((p, idx) => (
                          <p key={idx}>
                            <BidiText text={p} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3.5 py-2.5 text-xs leading-6 text-[var(--ink-primary)]">
                        <span className="font-semibold text-[var(--accent)] me-1.5">
                          جمع‌بندی کلیدی:
                        </span>
                        <BidiText
                          text={chapter.deepDive.takeAway}
                          onOpenGlossaryTerm={onOpenGlossaryTerm}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* STEP 5: Interactive Check, Links, Personal & Group Notes, Completion */}
          {showStep(5) && (
            <>
              <InteractiveCheckCard
                chapterId={chapter.id}
                check={chapter.check}
                savedOutcome={savedCheckOutcome}
                onOutcome={(outcome) => onRecordCheck(chapter.id, outcome)}
                onOpenGlossaryTerm={onOpenGlossaryTerm}
              />

              {/* Study Group Inline Discussion */}
              <ChapterGroupNotes
                chapterId={chapter.id}
                currentUid={currentUid}
                group={activeGroup}
                notes={groupNotes}
                onPostNote={onPostGroupNote}
                onDeleteNote={onDeleteGroupNote}
                onOpenGroupTab={onOpenGroupTab}
              />

              {/* Personal Field Note */}
              <section className="my-6">
                <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                  <button
                    type="button"
                    onClick={() => setNoteOpen((v) => !v)}
                    aria-expanded={noteOpen}
                    className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-primary)]">
                      <NotebookPen className="h-4 w-4 text-[var(--accent)]" />
                      <span>
                        یادداشت شخصی شما برای این فصل (+۱۵ XP)
                        {noteValue.trim().length > 0 ? ' — ذخیره‌شده' : ''}
                      </span>
                    </span>
                    {noteOpen ? (
                      <ChevronUp className="h-4 w-4 text-[var(--ink-muted)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--ink-muted)]" />
                    )}
                  </button>

                  {noteOpen && (
                    <div className="border-t border-[var(--border-hairline)] p-4">
                      <label htmlFor="chapter-field-note" className="sr-only">
                        یادداشت شخصی فصل
                      </label>
                      <textarea
                        id="chapter-field-note"
                        rows={4}
                        value={noteValue}
                        onChange={(e) => onUpdateNote(chapter.id, e.target.value)}
                        placeholder="خلاصه به زبان خودت بهترین روش تثبیت در حافظه بلندمدت است؛ نکته کلیدی یا دستور پرکاربردت را اینجا بنویس..."
                        className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-sm leading-7 text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Interconnected Knowledge Graph */}
              <section className="my-8 border-t border-[var(--border-hairline)] pt-7">
                <div className="mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-[var(--accent)]" />
                  <h2 className="text-sm font-bold text-[var(--ink-primary)]">
                    پیوندهای مرتبط در نقشه دانش اطلس
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {chapter.crossLinks.map((link) => {
                    const target = CHAPTER_MAP[link.targetId];
                    if (!target) return null;
                    return (
                      <button
                        key={link.targetId}
                        type="button"
                        onClick={() => onSelectChapter(target.id)}
                        className="flex min-h-[52px] w-full items-start justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-start hover:border-[var(--accent)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-start">
                            <span
                              dir="ltr"
                              className="inline-block font-mono text-[11px] text-[var(--accent)] bidi-ltr"
                            >
                              {target.code}
                            </span>
                          </div>
                          <div className="mt-0.5 text-sm font-semibold text-[var(--ink-primary)]">
                            <BidiText text={target.title} />
                          </div>
                          <p className="mt-1 text-xs leading-5 text-[var(--ink-secondary)]">
                            <BidiText text={link.reason} />
                          </p>
                        </div>
                        <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ADHD Step Next/Prev Bar */}
          {adhdMode && (
            <div className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3">
              <button
                type="button"
                disabled={adhdStep === 0}
                onClick={() => goAdhdStep(adhdStep - 1)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-xs font-medium text-[var(--ink-primary)] disabled:opacity-40 cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" />
                <span>گام قبلی</span>
              </button>

              <span className="text-xs text-[var(--ink-muted)]">
                {ADHD_STEPS[adhdStep]?.shortLabel}
              </span>

              {adhdStep < ADHD_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goAdhdStep(adhdStep + 1)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] cursor-pointer"
                >
                  <span>گام بعدی</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleComplete(chapter.id)}
                  className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-md px-4 text-xs font-semibold cursor-pointer ${
                    isCompleted
                      ? 'bg-[var(--ok-bg)] text-[var(--ok-ink)]'
                      : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>{isCompleted ? 'تکمیل شد' : 'ثبت تکمیل (+۵۰ XP)'}</span>
                </button>
              )}
            </div>
          )}

          {/* Footer Completion & Chapter Navigation */}
          <footer className="mt-9 border-t border-[var(--border-hairline)] pt-6 pb-8">
            <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => onToggleComplete(chapter.id)}
                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border px-5 text-sm font-semibold transition-colors cursor-pointer ${
                  isCompleted
                    ? 'border-[var(--ok-border)] bg-[var(--ok-bg)] text-[var(--ok-ink)]'
                    : 'border-[var(--accent)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>
                  {isCompleted ? 'فصل تکمیل شد ✓' : 'تکمیل فصل (+۵۰ XP) ✓'}
                </span>
              </button>

              <span className="text-xs text-[var(--ink-muted)] text-center sm:text-end">
                پیشرفت شما به‌صورت خودکار ذخیره و در صورت ورود با ابر همگام می‌شود.
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {prev ? (
                <button
                  type="button"
                  onClick={() => onSelectChapter(prev.id)}
                  className="flex min-h-[64px] items-center gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-start hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-[var(--ink-muted)]">فصل قبلی</div>
                    <div className="truncate text-xs font-semibold text-[var(--ink-primary)]">
                      {prev.title.replace(/`/g, '')}
                    </div>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {next && (
                <button
                  type="button"
                  onClick={() => onSelectChapter(next.id)}
                  className="flex min-h-[64px] items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5 text-end hover:border-[var(--accent)] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-[var(--accent)]">
                      {isNextNewTrack ? 'شروع مسیر بعدی' : 'فصل بعدی'}
                    </div>
                    <div className="truncate text-xs font-semibold text-[var(--ink-primary)]">
                      {next.title.replace(/`/g, '')}
                    </div>
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                </button>
              )}
            </div>
          </footer>
        </article>
      </div>

      {/* Mobile TOC Sheet */}
      {mobileTocOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-black/40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="فهرست فصل‌ها"
          onClick={() => setMobileTocOpen(false)}
        >
          <div
            className="flex h-full w-[86vw] max-w-sm flex-col border-e border-[var(--border-hairline)] bg-[var(--bg-canvas)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--ink-primary)]">
                فهرست کل اطلس
              </span>
              <button
                type="button"
                onClick={() => setMobileTocOpen(false)}
                aria-label="بستن فهرست"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <TocSidebar
                activeChapterId={chapter.id}
                completedIds={completedIds}
                onSelectChapter={(id) => {
                  onSelectChapter(id);
                  setMobileTocOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
