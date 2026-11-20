import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bookmark,
  CheckCircle2,
  Copy,
  Download,
  Flame,
  Lock,
  NotebookPen,
  RotateCcw,
  Timer,
  Upload,
} from 'lucide-react';
import { CHAPTER_MAP } from '../data/manifest';
import type { AtlasUserState } from '../types/atlas';
import {
  computeBadges,
  computeDomainProgress,
  exportUserStateJson,
  getLevelInfo,
  getSpacedReviewQueue,
  importUserStateJson,
  toPersianDigits,
} from '../utils/atlasLogic';
import { BidiText } from './BidiText';

interface ProgressViewProps {
  userState: AtlasUserState;
  isSignedIn: boolean;
  hasStudyGroup: boolean;
  onSelectChapter: (chapterId: string) => void;
  onImportState: (state: AtlasUserState) => void;
  onToast: (message: string) => void;
}

type SubTab = 'review' | 'bookmarks' | 'notes' | 'completed';

const Ring: React.FC<{ percent: number }> = ({ percent }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0" aria-hidden="true">
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke="var(--border-hairline)"
        strokeWidth="3.5"
      />
      <circle
        cx="26"
        cy="26"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="29"
        textAnchor="middle"
        className="fill-[var(--ink-primary)] font-mono text-[10px] font-semibold"
      >
        {percent}%
      </text>
    </svg>
  );
};

export const ProgressView: React.FC<ProgressViewProps> = ({
  userState,
  isSignedIn,
  hasStudyGroup,
  onSelectChapter,
  onImportState,
  onToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('review');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [showImportBox, setShowImportBox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const domainProgress = useMemo(
    () => computeDomainProgress(userState.completedIds),
    [userState.completedIds]
  );

  const levelInfo = useMemo(() => getLevelInfo(userState.xp), [userState.xp]);

  const badges = useMemo(
    () => computeBadges(userState, hasStudyGroup),
    [userState, hasStudyGroup]
  );

  const reviewQueue = useMemo(() => getSpacedReviewQueue(userState), [userState]);

  const noteEntries = useMemo(
    () =>
      Object.entries(userState.notes).filter(
        ([id, text]) => id in CHAPTER_MAP && text.trim().length > 0
      ),
    [userState.notes]
  );

  const totalPercent = Math.round((userState.completedIds.length / 120) * 100);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportUserStateJson(userState));
      onToast('فایل JSON پیشرفت در کلیپ‌بورد کپی شد.');
    } catch {
      onToast('کپی خودکار ممکن نشد؛ از دانلود JSON استفاده کنید.');
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([exportUserStateJson(userState)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modern-engineering-atlas-progress.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast('فایل بکاپ پیشرفت دانلود شد.');
  };

  const handleApplyImport = (raw: string) => {
    const res = importUserStateJson(raw);
    if (!res.ok || !res.state) {
      setImportError(res.error ?? 'خطا در بازیابی JSON');
      return;
    }
    setImportError(null);
    onImportState(res.state);
    setImportText('');
    setShowImportBox(false);
    onToast('پیشرفت و یادداشت‌ها با موفقیت بازیابی شد.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleApplyImport(reader.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="border-b border-[var(--border-hairline)] pb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold text-[var(--ink-primary)]">
            پیشرفت، امتیاز تجربه و تسلط
          </h1>
          <span className="font-mono text-sm font-semibold text-[var(--accent)] tabular-nums">
            {toPersianDigits(userState.completedIds.length)} / {toPersianDigits(120)} فصل (
            {toPersianDigits(totalPercent)}٪)
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-6 text-[var(--ink-secondary)] sm:text-sm">
          {isSignedIn
            ? 'پیشرفت، استمرار، نشان‌ها و یادداشت‌های شما به‌صورت زنده با حساب ابری همگام‌سازی می‌شوند.'
            : 'پیشرفت شما روی این دستگاه ذخیره می‌شود؛ برای همگام‌سازی ابری و رقابت سالم با دوستان، در تب «گروه» وارد شوید.'}
        </p>

        {/* Gamification Level + Streak + Focus Summary */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--ink-primary)]">
                  سطح {toPersianDigits(levelInfo.level)} — {levelInfo.title}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--accent)] tabular-nums">
                {toPersianDigits(levelInfo.currentXp)} XP
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--ink-muted)] tabular-nums">
              <span>پیشرفت سطح فعلی: {toPersianDigits(levelInfo.progressPercent)}٪</span>
              {levelInfo.nextLevelXp > levelInfo.currentXp ? (
                <span>
                  تا سطح بعدی: {toPersianDigits(levelInfo.nextLevelXp - levelInfo.currentXp)} XP
                </span>
              ) : (
                <span>به بالاترین سطح اطلس رسیدید!</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-1">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
                <Flame className="h-4 w-4 text-[var(--warn-ink)]" />
                <span>استمرار</span>
              </span>
              <span className="font-mono text-xs font-bold text-[var(--ink-primary)] tabular-nums">
                {toPersianDigits(userState.streakDays)} روز
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
                <Timer className="h-4 w-4 text-[var(--accent)]" />
                <span>تمرکز عمیق</span>
              </span>
              <span className="font-mono text-xs font-bold text-[var(--ink-primary)] tabular-nums">
                {toPersianDigits(userState.focusMinutes)} دقیقه
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mastery Ring per Domain */}
      <section aria-label="تسلط بر ۵ حوزه اطلس" className="mt-7">
        <h2 className="mb-3 text-xs font-semibold text-[var(--ink-muted)]">
          حلقه تسلط بر ۵ حوزه اصلی
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {domainProgress.map((item) => (
            <div
              key={item.domainId}
              className="flex items-center gap-3.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5"
            >
              <Ring percent={item.percent} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
                  <span dir="ltr" className="font-mono bidi-ltr">
                    {item.domainId}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {toPersianDigits(item.completed)}/{toPersianDigits(item.total)}
                  </span>
                </div>
                <div className="mt-0.5 text-xs font-bold leading-5 text-[var(--ink-primary)]">
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestone Badges Grid */}
      <section aria-label="نشان‌های افتخار و دستاوردها" className="mt-9">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[var(--ink-muted)]">
            نشان‌های یادگیری و دستاوردها
          </h2>
          <span className="font-mono text-xs text-[var(--accent)] tabular-nums">
            {toPersianDigits(unlockedCount)} از {toPersianDigits(badges.length)} بازشده
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-lg border p-3.5 transition-colors ${
                badge.unlocked
                  ? 'border-[var(--ok-border)] bg-[var(--ok-bg)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold ${
                    badge.unlocked ? 'text-[var(--ok-ink)]' : 'text-[var(--ink-primary)]'
                  }`}
                >
                  {badge.title}
                </span>
                {badge.unlocked ? (
                  <Award className="h-4 w-4 shrink-0 text-[var(--ok-ink)]" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
                )}
              </div>
              <p className="mt-1 text-[11px] leading-5 text-[var(--ink-secondary)]">
                {badge.description}
              </p>
              <div className="mt-2 font-mono text-[10px] text-[var(--ink-muted)]">
                {badge.progressLabel}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sub-tabs: Spaced Review Queue, Bookmarks, Notes, Completed */}
      <section className="mt-9">
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--border-hairline)] pb-2.5">
          {[
            { id: 'review' as SubTab, label: 'صف مرور فعال', count: reviewQueue.length, icon: RotateCcw },
            { id: 'bookmarks' as SubTab, label: 'نشان‌شده‌ها', count: userState.bookmarkedIds.length, icon: Bookmark },
            { id: 'notes' as SubTab, label: 'یادداشت‌ها', count: noteEntries.length, icon: NotebookPen },
            { id: 'completed' as SubTab, label: 'تکمیل‌شده‌ها', count: userState.completedIds.length, icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] tabular-nums">
                  ({toPersianDigits(tab.count)})
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {activeSubTab === 'review' &&
            (reviewQueue.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center text-xs leading-6 text-[var(--ink-muted)]">
                صف مرور شما فعلاً خالی است. هر فصل که در آزمون پایان فصل آن نیاز به مرور ثبت کنید یا هنوز آزمونش را پاس نکرده باشید، برای بازیابی فعال اینجا قرار می‌گیرد.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {reviewQueue.map((item) => {
                  const ch = CHAPTER_MAP[item.chapterId];
                  if (!ch) return null;
                  return (
                    <li key={item.chapterId}>
                      <button
                        type="button"
                        onClick={() => onSelectChapter(item.chapterId)}
                        className="flex min-h-[56px] w-full items-center justify-between gap-3 p-3.5 text-start hover:bg-[var(--bg-subtle)] cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span dir="ltr" className="inline-block font-mono text-[var(--accent)] bidi-ltr">
                              {ch.code}
                            </span>
                            <span
                              className={
                                item.reason === 'failed'
                                  ? 'text-[var(--err-ink)]'
                                  : item.reason === 'review'
                                  ? 'text-[var(--warn-ink)]'
                                  : 'text-[var(--ink-muted)]'
                              }
                            >
                              {item.reason === 'failed'
                                ? 'پاسخ نادرست قبلی — مرور فوری'
                                : item.reason === 'review'
                                ? 'نشانه‌گذاری برای مرور مجدد'
                                : 'تثبیت حافظه با آزمون فعال'}
                            </span>
                          </div>
                          <div className="mt-0.5 text-sm font-medium text-[var(--ink-primary)]">
                            <BidiText text={ch.title} />
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

          {activeSubTab === 'bookmarks' &&
            (userState.bookmarkedIds.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center text-xs leading-6 text-[var(--ink-muted)]">
                هنوز فصلی نشان‌گذاری نشده است. داخل هر فصل دکمه «نشان» را بزنید تا سریع به آن برگردید.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {userState.bookmarkedIds.map((id) => {
                  const ch = CHAPTER_MAP[id];
                  if (!ch) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onSelectChapter(id)}
                        className="flex min-h-[56px] w-full items-center justify-between gap-3 p-3.5 text-start hover:bg-[var(--bg-subtle)] cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-[var(--accent)] bidi-ltr text-start">
                            {ch.code}
                          </div>
                          <div className="mt-0.5 text-sm font-medium text-[var(--ink-primary)]">
                            <BidiText text={ch.title} />
                          </div>
                        </div>
                        <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}

          {activeSubTab === 'notes' &&
            (noteEntries.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center text-xs leading-6 text-[var(--ink-muted)]">
                هنوز یادداشتی ننوشته‌اید. در پایین هر فصل بخش «یادداشت شخصی» برای تثبیت دانش و گرفتن +۱۵ XP آماده است.
              </div>
            ) : (
              <div className="space-y-2.5">
                {noteEntries.map(([id, text]) => {
                  const ch = CHAPTER_MAP[id];
                  return (
                    <div
                      key={id}
                      className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectChapter(id)}
                        className="flex w-full items-center justify-between gap-2 text-start hover:text-[var(--accent)] cursor-pointer"
                      >
                        <span className="text-xs font-bold text-[var(--ink-primary)]">
                          <span className="font-mono text-[var(--accent)] me-1.5 bidi-ltr">
                            {ch.id}
                          </span>
                          {ch.title}
                        </span>
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
                      </button>
                      <p className="mt-2 whitespace-pre-wrap border-t border-[var(--border-hairline)] pt-2 text-xs leading-6 text-[var(--ink-secondary)]">
                        {text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}

          {activeSubTab === 'completed' &&
            (userState.completedIds.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center text-xs leading-6 text-[var(--ink-muted)]">
                هنوز فصلی تکمیل نشده است. پس از مطالعه هر فصل دکمه «تکمیل فصل ✓» را بزنید.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-hairline)] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {userState.completedIds.map((id) => {
                  const ch = CHAPTER_MAP[id];
                  if (!ch) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onSelectChapter(id)}
                        className="flex min-h-[52px] w-full items-center justify-between gap-3 p-3.5 text-start hover:bg-[var(--bg-subtle)] cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span
                            dir="ltr"
                            className="inline-block font-mono text-[11px] text-[var(--ok-ink)] me-2 bidi-ltr"
                          >
                            {ch.id}
                          </span>
                          <span className="text-sm text-[var(--ink-primary)]">
                            <BidiText text={ch.title} />
                          </span>
                        </div>
                        <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}
        </div>
      </section>

      {/* Export / Import JSON Progress */}
      <section className="mt-10 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5">
        <h2 className="text-sm font-bold text-[var(--ink-primary)]">
          پشتیبان‌گیری آفلاین (Export / Import JSON)
        </h2>
        <p className="mt-1 text-xs leading-6 text-[var(--ink-secondary)]">
          علاوه بر همگام‌سازی ابری، هر زمان بخواهید می‌توانید از کل پیشرفت و یادداشت‌هایتان فایل بکاپ JSON بگیرید.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--border-strong)] bg-[var(--bg-canvas)] px-4 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--accent)] cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>دانلود فایل JSON</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <Copy className="h-4 w-4" />
            <span>کپی JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>بارگذاری فایل JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowImportBox((v) => !v)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <span>چسباندن دستی JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {showImportBox && (
          <div className="mt-4 space-y-2.5 border-t border-[var(--border-hairline)] pt-4">
            <textarea
              dir="ltr"
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"version":1,"completedIds":["T01-C01"],...}'
              className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 font-mono text-xs text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
            {importError && (
              <p className="text-xs text-[var(--err-ink)]">{importError}</p>
            )}
            <button
              type="button"
              onClick={() => handleApplyImport(importText)}
              className="inline-flex min-h-[42px] items-center rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] cursor-pointer"
            >
              بازیابی داده‌ها
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
