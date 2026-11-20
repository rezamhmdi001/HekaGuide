import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronLeft,
  Compass,
  Flame,
  Users,
  Video,
} from 'lucide-react';
import { CHAPTER_VIDEOS } from '../data/chapterMedia';
import {
  CHAPTERS_META,
  CHAPTER_MAP,
  DOMAINS,
  STUDY_PATHS,
} from '../data/manifest';
import type { StudyGroup, StudyPathId, TrackId } from '../types/atlas';
import {
  getFilteredTracks,
  getLevelInfo,
  toPersianDigits,
} from '../utils/atlasLogic';
import { BidiText } from './BidiText';
import { DomainVisualPlate } from './DomainVisualPlate';

interface AtlasHomeProps {
  activePathId: StudyPathId;
  completedIds: string[];
  lastReadId: string;
  xp: number;
  streakDays: number;
  adhdMode: boolean;
  activeGroup: StudyGroup | null;
  onSelectPath: (pathId: StudyPathId) => void;
  onSelectChapter: (chapterId: string) => void;
  onToggleAdhdMode: () => void;
  onOpenGroupTab: () => void;
}

export const AtlasHome: React.FC<AtlasHomeProps> = ({
  activePathId,
  completedIds,
  lastReadId,
  xp,
  streakDays,
  adhdMode,
  activeGroup,
  onSelectPath,
  onSelectChapter,
  onToggleAdhdMode,
  onOpenGroupTab,
}) => {
  const [expandedTracks, setExpandedTracks] = useState<Record<string, boolean>>({
    T01: true,
  });

  const completedSet = new Set(completedIds);
  const filteredTracks = getFilteredTracks(activePathId);
  const filteredTrackSet = new Set(filteredTracks.map((t) => t.id));
  const activePath = STUDY_PATHS.find((p) => p.id === activePathId) ?? STUDY_PATHS[0];
  const lastReadChapter = CHAPTER_MAP[lastReadId] ?? CHAPTERS_META[0];
  const hasProgress = completedIds.length > 0 || lastReadId !== 'T01-C01';
  const levelInfo = getLevelInfo(xp);

  const toggleTrack = (trackId: TrackId) => {
    setExpandedTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Editorial Hero */}
      <section className="border-b border-[var(--border-hairline)] pb-8">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-muted)]">
          <span dir="ltr" className="font-mono tracking-wide bidi-ltr">
            THE MODERN ENGINEERING ATLAS
          </span>
          <span aria-hidden="true">·</span>
          <span>۵ حوزه · ۲۰ مسیر · ۱۲۰ فصل تعاملی</span>
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--ink-primary)] sm:text-4xl">
          اطلس مهندسی مدرن
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-8 text-[var(--ink-secondary)] sm:text-base">
          یادگیری عمیق و بی‌دردسر مهندسی نرم‌افزار به زبان فارسیِ روان؛ از فیزیک پردازنده،
          لینوکس و شبکه تا معماری وب، دیتابیس، امنیت، کانتینرها و سیستم‌های هوش مصنوعی.
          همراه با مثال‌های واقعی، ویدیوهای برگزیده، حالت تمرکز ویژه ADHD و مطالعه گروهی با دوستان.
        </p>

        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onSelectChapter(lastReadChapter.id)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            <span>{hasProgress ? 'ادامه مطالعه' : 'شروع از فصل اول'}</span>
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToggleAdhdMode}
            aria-pressed={adhdMode}
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border px-4 text-xs font-semibold transition-colors cursor-pointer ${
              adhdMode
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-strong)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:border-[var(--accent)]'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>
              {adhdMode ? 'حالت گام‌به‌گام ADHD: روشن' : 'فعال‌سازی حالت گام‌به‌گام ADHD'}
            </span>
          </button>
        </div>

        {/* Quiet Editorial Status Strip: Level, XP, Streak & Study Circle */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                <Award className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>سطح {toPersianDigits(levelInfo.level)}</span>
              </div>
              <div className="mt-0.5 truncate text-xs font-bold text-[var(--ink-primary)]">
                {levelInfo.title}
              </div>
            </div>
            <div className="text-end font-mono text-xs font-bold text-[var(--accent)] tabular-nums">
              {toPersianDigits(xp)} XP
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                <Flame className="h-3.5 w-3.5 text-[var(--warn-ink)]" />
                <span>استمرار مطالعه</span>
              </div>
              <div className="mt-0.5 text-xs font-bold text-[var(--ink-primary)] tabular-nums">
                {toPersianDigits(streakDays)} روز متوالی
              </div>
            </div>
            <div className="text-end text-xs text-[var(--ink-secondary)] tabular-nums">
              {toPersianDigits(completedIds.length)} / {toPersianDigits(120)} فصل
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenGroupTab}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-start hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                <Users className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>گروه مطالعه دوستان</span>
              </div>
              <div className="mt-0.5 truncate text-xs font-bold text-[var(--ink-primary)]">
                {activeGroup ? activeGroup.name : 'ساخت یا عضویت در گروه'}
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--accent)]" />
          </button>
        </div>
      </section>

      {/* 4 Curated Study Paths */}
      <section aria-label="مسیرهای مطالعه پیشنهادی" className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[var(--accent)]" />
            <h2 className="text-sm font-bold text-[var(--ink-primary)]">
              انتخاب مسیر مطالعه (Study Path)
            </h2>
          </div>
          <span className="text-xs text-[var(--ink-muted)] tabular-nums">
            {toPersianDigits(filteredTracks.length)} مسیر ·{' '}
            {toPersianDigits(filteredTracks.length * 6)} فصل در این مسیر
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {STUDY_PATHS.map((path) => {
            const isActive = path.id === activePathId;
            return (
              <button
                key={path.id}
                type="button"
                onClick={() => onSelectPath(path.id)}
                aria-pressed={isActive}
                className={`flex min-h-[76px] flex-col justify-between rounded-lg border p-3.5 text-start transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className={`text-xs font-bold leading-5 ${
                    isActive ? 'text-[var(--accent)]' : 'text-[var(--ink-primary)]'
                  }`}
                >
                  {path.title}
                </div>
                <p className="mt-1.5 text-[11px] leading-5 text-[var(--ink-secondary)]">
                  {path.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          مسیر فعال:{' '}
          <strong className="text-[var(--ink-primary)]">{activePath.title}</strong> —{' '}
          {activePath.subtitle}
        </p>
      </section>

      {/* 5 Domains & 20 Tracks Catalog with Architectural Illustrations */}
      <section aria-label="حوزه‌ها و مسیرهای اطلس" className="mt-10 space-y-12">
        {DOMAINS.map((domain) => {
          const domainTracks = filteredTracks.filter(
            (t) => t.domainId === domain.id && filteredTrackSet.has(t.id)
          );
          if (domainTracks.length === 0) return null;

          const domainChapterCount = domainTracks.length * 6;
          const domainCompleted = CHAPTERS_META.filter(
            (c) =>
              c.domainId === domain.id &&
              filteredTrackSet.has(c.trackId) &&
              completedSet.has(c.id)
          ).length;

          return (
            <div key={domain.id}>
              <div className="mb-5 grid grid-cols-1 items-stretch gap-5 border-b border-[var(--border-hairline)] pb-5 md:grid-cols-[minmax(0,1fr)_280px]">
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="font-mono text-xs text-[var(--accent)] bidi-ltr">
                        {domain.id} · {domain.englishTitle}
                      </div>
                      <div className="text-xs text-[var(--ink-muted)] tabular-nums">
                        {toPersianDigits(domainCompleted)} از {toPersianDigits(domainChapterCount)}{' '}
                        فصل تکمیل‌شده
                      </div>
                    </div>
                    <h2 className="mt-1.5 text-xl font-bold text-[var(--ink-primary)]">
                      {domain.title}
                    </h2>
                    <p className="mt-2 text-xs leading-7 text-[var(--ink-secondary)] sm:text-sm">
                      {domain.summary}
                    </p>
                  </div>

                  {/* Subtle progress line */}
                  <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                    <div
                      className="h-full bg-[var(--accent)] transition-all"
                      style={{
                        width: `${Math.round((domainCompleted / domainChapterCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <DomainVisualPlate domainId={domain.id} compact showCaption={false} />
              </div>

              <div className="space-y-3">
                {domainTracks.map((track) => {
                  const isExpanded = Boolean(expandedTracks[track.id]);
                  const chapters = CHAPTERS_META.filter((c) => c.trackId === track.id);
                  const trackDone = chapters.filter((c) => completedSet.has(c.id)).length;

                  return (
                    <div
                      key={track.id}
                      className="overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTrack(track.id)}
                        aria-expanded={isExpanded}
                        className="flex min-h-[68px] w-full items-center justify-between gap-4 px-4 py-3.5 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-[var(--ink-muted)]">
                            <span className="font-mono text-[11px] font-semibold text-[var(--accent)] bidi-ltr">
                              {track.id}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">
                              {toPersianDigits(trackDone)}/{toPersianDigits(chapters.length)} فصل
                            </span>
                          </div>
                          <h3 className="mt-0.5 text-sm font-bold text-[var(--ink-primary)] sm:text-[15px]">
                            {track.title}
                          </h3>
                          <p className="mt-0.5 text-xs leading-5 text-[var(--ink-secondary)]">
                            {track.subtitle}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[var(--bg-subtle)] sm:block"
                          >
                            <div
                              className="h-full bg-[var(--accent)] transition-all"
                              style={{ width: `${(trackDone / chapters.length) * 100}%` }}
                            />
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-[var(--ink-muted)]" />
                          ) : (
                            <ChevronLeft className="h-4 w-4 text-[var(--ink-muted)]" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <ul className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
                          {chapters.map((ch) => {
                            const isDone = completedSet.has(ch.id);
                            const isLast = ch.id === lastReadId;
                            const hasVideo = Boolean(CHAPTER_VIDEOS[ch.id]);
                            return (
                              <li key={ch.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelectChapter(ch.id)}
                                  className="flex min-h-[56px] w-full items-start justify-between gap-3 px-4 py-3 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--ink-muted)]">
                                      <span className="font-mono bidi-ltr">{ch.id}</span>
                                      <span aria-hidden="true">·</span>
                                      <span>{toPersianDigits(ch.readMinutes)} دقیقه</span>
                                      <span aria-hidden="true">·</span>
                                      <span>{ch.difficulty}</span>
                                      {hasVideo && (
                                        <>
                                          <span aria-hidden="true">·</span>
                                          <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                                            <Video className="h-3 w-3" />
                                            <span>ویدیو</span>
                                          </span>
                                        </>
                                      )}
                                      {isLast && (
                                        <>
                                          <span aria-hidden="true">·</span>
                                          <span className="font-semibold text-[var(--accent)]">
                                            در حال مطالعه
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <div className="mt-1 text-sm font-medium leading-6 text-[var(--ink-primary)]">
                                      <BidiText text={ch.title} />
                                    </div>
                                  </div>

                                  <div className="mt-1 shrink-0">
                                    {isDone ? (
                                      <span
                                        aria-label="تکمیل‌شده"
                                        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ok-bg)] text-[var(--ok-ink)]"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </span>
                                    ) : (
                                      <ArrowLeft className="h-4 w-4 text-[var(--ink-muted)]" />
                                    )}
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
