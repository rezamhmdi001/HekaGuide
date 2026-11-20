import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Flame,
  LogIn,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Share2,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { CHAPTERS_META, CHAPTER_MAP } from '../data/manifest';
import type {
  AtlasUserState,
  GroupMember,
  GroupNote,
  StudyGroup,
} from '../types/atlas';
import { getLevelInfo, toPersianDigits } from '../utils/atlasLogic';

interface StudyGroupViewProps {
  user: User | null;
  authLoading: boolean;
  userState: AtlasUserState;
  group: StudyGroup | null;
  members: GroupMember[];
  notes: GroupNote[];
  initialInviteCode?: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onCreateGroup: (
    name: string,
    description: string,
    weeklyGoal: number
  ) => Promise<void>;
  onJoinGroup: (inviteCode: string) => Promise<{ ok: boolean; error?: string }>;
  onLeaveGroup: () => Promise<void>;
  onPostNote: (chapterId: string, body: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onSelectChapter: (chapterId: string) => void;
  onToast: (message: string) => void;
}

export const StudyGroupView: React.FC<StudyGroupViewProps> = ({
  user,
  authLoading,
  userState,
  group,
  members,
  notes,
  initialInviteCode = '',
  onSignIn,
  onSignOut,
  onCreateGroup,
  onJoinGroup,
  onLeaveGroup,
  onPostNote,
  onDeleteNote,
  onSelectChapter,
  onToast,
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState(6);
  const [inviteInput, setInviteInput] = useState(initialInviteCode);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [noteChapterId, setNoteChapterId] = useState(userState.lastReadId);
  const [noteBody, setNoteBody] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const levelInfo = getLevelInfo(userState.xp);

  const handleCopyCode = async () => {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.id);
      setCopiedCode(true);
      onToast('کد دعوت گروه کپی شد.');
      window.setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      onToast(`کد دعوت: ${group.id}`);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!group) return;
    const url = `${window.location.origin}/group/${group.id}`;
    try {
      await navigator.clipboard.writeText(url);
      onToast('لینک دعوت مستقیم گروه کپی شد. برای دوستانتان بفرستید!');
    } catch {
      onToast(`لینک دعوت: /group/${group.id}`);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim().length < 2 || busy) return;
    setBusy(true);
    try {
      await onCreateGroup(groupName, groupDesc, weeklyGoal);
      setGroupName('');
      setGroupDesc('');
    } finally {
      setBusy(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim() || busy) return;
    setBusy(true);
    setJoinError(null);
    try {
      const res = await onJoinGroup(inviteInput);
      if (!res.ok) {
        setJoinError(res.error ?? 'عضویت در گروه ممکن نشد.');
      } else {
        setInviteInput('');
      }
    } finally {
      setBusy(false);
    }
  };

  const handlePostNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteBody.trim() || postingNote) return;
    setPostingNote(true);
    try {
      await onPostNote(noteChapterId, noteBody);
      setNoteBody('');
    } finally {
      setPostingNote(false);
    }
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-7 w-52 rounded bg-[var(--bg-subtle)]" />
          <div className="h-32 w-full rounded-lg bg-[var(--bg-subtle)]" />
        </div>
      </div>
    );
  }

  // Signed-out Welcome & Google Sign-In Gate
  if (!user) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="border-b border-[var(--border-hairline)] pb-6">
          <div className="flex items-center gap-2 text-xs text-[var(--accent)] font-semibold">
            <Users className="h-4 w-4" />
            <span>مطالعه گروهی و همگام‌سازی ابری</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
            گروه مطالعه با دوستان (Study Circle)
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-secondary)]">
            تنها خواندن سخت است؛ وقتی کنار دوستانت فصل‌به‌فصل جلو می‌روی، هم انگیزه استمرار بالا می‌رود و هم درک عمیق‌تر می‌شود. با حساب گوگل وارد شو تا پیشرفتت در فضای ابری ذخیره شود و یک حلقه مطالعه مشترک بسازی.
          </p>
        </header>

        {initialInviteCode && (
          <div className="mt-6 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 text-sm text-[var(--ink-primary)]">
            شما با لینک دعوت{' '}
            <span dir="ltr" className="font-mono font-bold text-[var(--accent)] bidi-ltr">
              {initialInviteCode}
            </span>{' '}
            وارد شده‌اید. پس از ورود با حساب گوگل می‌توانید بلافاصله به گروه بپیوندید.
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <Trophy className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="mt-2.5 text-sm font-bold text-[var(--ink-primary)]">
              جدول پیشرفت زنده
            </h2>
            <p className="mt-1 text-xs leading-6 text-[var(--ink-secondary)]">
              ببین هر کدام از دوستانت روی کدام فصل است، چند روز استمرار دارد و امتیاز تجربه‌اش چقدر شده است.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <MessageSquare className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="mt-2.5 text-sm font-bold text-[var(--ink-primary)]">
              یادداشت مشترک روی فصل‌ها
            </h2>
            <p className="mt-1 text-xs leading-6 text-[var(--ink-secondary)]">
              وسط خواندن هر فصل، سوال یا خلاصه‌ات را برای هم‌گروهی‌ها بفرست تا همه زیر همان فصل ببینند.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
            <Flame className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="mt-2.5 text-sm font-bold text-[var(--ink-primary)]">
              همگام‌سازی خودکار دستگاه‌ها
            </h2>
            <p className="mt-1 text-xs leading-6 text-[var(--ink-secondary)]">
              تمام فصل‌های تکمیل‌شده، نشان‌شده‌ها و یادداشت‌های فعلی شما پس از ورود به‌طور امن با ابر ادغام می‌شوند.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center">
          <p className="text-xs leading-6 text-[var(--ink-secondary)]">
            پیشرفت فعلی شما در این مرورگر:{' '}
            <strong className="text-[var(--ink-primary)]">
              {toPersianDigits(userState.completedIds.length)} فصل تکمیل‌شده ·{' '}
              {toPersianDigits(userState.xp)} XP ({levelInfo.title})
            </strong>
          </p>
          <button
            type="button"
            onClick={() => void onSignIn()}
            className="mt-4 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-md bg-[var(--accent)] px-6 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            <LogIn className="h-4 w-4" />
            <span>ورود با حساب گوگل و فعال‌سازی همگام‌سازی</span>
          </button>
          <p className="mt-3 text-[11px] text-[var(--ink-muted)]">
            استفاده انفرادی از کل اطلس همیشه بدون نیاز به ورود نیز در دسترس است.
          </p>
        </div>
      </div>
    );
  }

  // Signed in, but not yet in a Study Group
  if (!group) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-6">
          <div>
            <div className="text-xs font-semibold text-[var(--ok-ink)]">
              حساب همگام‌شده: {user.displayName || user.email}
            </div>
            <h1 className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)]">
              شروع یا عضویت در گروه مطالعه
            </h1>
            <p className="mt-1.5 text-sm leading-7 text-[var(--ink-secondary)]">
              یک گروه جدید برای دوستانت بساز و کد دعوتش را بفرست، یا کد دعوتی که دوستانت داده‌اند را وارد کن.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void onSignOut()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>خروج از حساب</span>
          </button>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Join existing group */}
          <form
            onSubmit={handleJoinSubmit}
            className="flex flex-col justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink-primary)]">
                <UserPlus className="h-4 w-4 text-[var(--accent)]" />
                <h2>عضویت با کد دعوت دوستان</h2>
              </div>
              <p className="mt-1.5 text-xs leading-6 text-[var(--ink-secondary)]">
                اگر یکی از دوستانت قبلاً گروه ساخته است، کد دعوت (مثلاً{' '}
                <code className="bidi-code">ATLAS-7K4M2P</code>) را اینجا وارد کن.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="invite-code-input"
                  className="block text-xs font-medium text-[var(--ink-secondary)]"
                >
                  کد دعوت گروه
                </label>
                <input
                  id="invite-code-input"
                  type="text"
                  dir="ltr"
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                  placeholder="ATLAS-XXXXXX"
                  className="mt-1.5 min-h-[44px] w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
                {joinError && (
                  <p className="mt-2 text-xs text-[var(--err-ink)]">{joinError}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || !inviteInput.trim()}
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>{busy ? 'در حال بررسی...' : 'عضویت در گروه'}</span>
            </button>
          </form>

          {/* Create new group */}
          <form
            onSubmit={handleCreateSubmit}
            className="flex flex-col justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5"
          >
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink-primary)]">
                <Plus className="h-4 w-4 text-[var(--accent)]" />
                <h2>ساخت گروه مطالعه جدید</h2>
              </div>
              <p className="mt-1.5 text-xs leading-6 text-[var(--ink-secondary)]">
                حلقه‌ای تا سقف ۲۵ نفر بساز، هدف هفتگی تعیین کن و لینک دعوت را در تلگرام یا دیسکورد بفرست.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="group-name-input"
                    className="block text-xs font-medium text-[var(--ink-secondary)]"
                  >
                    نام گروه مطالعه
                  </label>
                  <input
                    id="group-name-input"
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="مثلاً: کلاب مهندسی سیستم ۱۴۰۵"
                    className="mt-1 min-h-[42px] w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="group-desc-input"
                    className="block text-xs font-medium text-[var(--ink-secondary)]"
                  >
                    توضیح کوتاه و قرار مطالعه (اختیاری)
                  </label>
                  <input
                    id="group-desc-input"
                    type="text"
                    maxLength={240}
                    value={groupDesc}
                    onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="مثلاً: هر هفته ۶ فصل می‌خوانیم و جمعه‌ها مرور می‌کنیم"
                    className="mt-1 min-h-[42px] w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-sm text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="group-goal-input"
                    className="block text-xs font-medium text-[var(--ink-secondary)]"
                  >
                    هدف هفتگی گروه (تعداد فصل برای هر نفر)
                  </label>
                  <input
                    id="group-goal-input"
                    type="number"
                    min={1}
                    max={30}
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(Number(e.target.value) || 6)}
                    className="mt-1 min-h-[42px] w-32 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 font-mono text-sm text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || groupName.trim().length < 2}
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{busy ? 'در حال ساخت گروه...' : 'ساخت گروه و دریافت کد دعوت'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Study Group Dashboard
  const totalGroupCompleted = members.reduce((sum, m) => sum + m.completedCount, 0);
  const groupTarget = Math.max(1, members.length * group.weeklyGoalChapters);
  const goalPercent = Math.min(100, Math.round((totalGroupCompleted / groupTarget) * 100));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Group Header */}
      <header className="border-b border-[var(--border-hairline)] pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ink-muted)]">
              <Users className="h-4 w-4 text-[var(--accent)]" />
              <span>گروه مطالعه فعال</span>
              <span aria-hidden="true">·</span>
              <span>{toPersianDigits(members.length)} عضو</span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold text-[var(--ink-primary)] sm:text-3xl">
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-1.5 text-sm leading-7 text-[var(--ink-secondary)]">
                {group.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 text-xs font-semibold text-[var(--accent)] cursor-pointer"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span dir="ltr" className="font-mono bidi-ltr">
                {group.id}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-primary)] hover:border-[var(--accent)] cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>کپی لینک دعوت</span>
            </button>

            <button
              type="button"
              onClick={() => void onSignOut()}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Collective Weekly Goal Bar */}
        <div className="mt-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--ink-primary)]">
              پیشرفت جمعی به سمت هدف مطالعه ({toPersianDigits(group.weeklyGoalChapters)} فصل برای هر عضو)
            </span>
            <span className="font-mono text-[var(--accent)] tabular-nums">
              {toPersianDigits(totalGroupCompleted)} / {toPersianDigits(groupTarget)} فصل (
              {toPersianDigits(goalPercent)}٪)
            </span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* Live Leaderboard */}
        <section aria-label="جدول پیشرفت زنده هم‌گروهی‌ها">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--ink-primary)]">
              <Trophy className="h-4 w-4 text-[var(--accent)]" />
              <span>جدول پیشرفت زنده اعضا</span>
            </h2>
            <span className="text-xs text-[var(--ink-muted)]">
              به‌روزرسانی آنی (Real-Time)
            </span>
          </div>

          <div className="divide-y divide-[var(--border-hairline)] overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            {members.map((member, idx) => {
              const memberLevel = getLevelInfo(member.xp);
              const isMe = member.uid === user.uid;
              const currentCh = CHAPTER_MAP[member.lastChapterId];
              return (
                <div
                  key={member.uid}
                  className={`flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between ${
                    isMe ? 'bg-[var(--accent-soft)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] font-mono text-xs font-bold text-[var(--ink-primary)]">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--ink-primary)]">
                          {member.displayName}
                        </span>
                        {isMe && (
                          <span className="text-[11px] font-semibold text-[var(--accent)]">
                            (شما)
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--ink-muted)]">
                          سطح {toPersianDigits(memberLevel.level)} · {memberLevel.title}
                        </span>
                      </div>

                      {currentCh && (
                        <button
                          type="button"
                          onClick={() => onSelectChapter(currentCh.id)}
                          className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--ink-secondary)] hover:text-[var(--accent)] cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            آخرین مطالعه:{' '}
                            <span dir="ltr" className="font-mono text-[11px] bidi-ltr">
                              {currentCh.id}
                            </span>{' '}
                            — {currentCh.title.replace(/`/g, '')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 text-xs tabular-nums ps-10 sm:ps-0">
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--accent)]">
                        {toPersianDigits(member.xp)}
                      </div>
                      <div className="text-[10px] text-[var(--ink-muted)]">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--ink-primary)]">
                        {toPersianDigits(member.completedCount)}
                      </div>
                      <div className="text-[10px] text-[var(--ink-muted)]">فصل</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono font-bold text-[var(--warn-ink)]">
                        {toPersianDigits(member.streakDays)}
                      </div>
                      <div className="text-[10px] text-[var(--ink-muted)]">روز</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leave group control */}
          <div className="mt-4 flex items-center justify-end">
            {!confirmLeave ? (
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--err-ink)] cursor-pointer"
              >
                ترک این گروه مطالعه
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-[var(--err-border)] bg-[var(--err-bg)] px-3 py-2 text-xs">
                <span className="text-[var(--err-ink)]">مطمئنید می‌خواهید گروه را ترک کنید؟</span>
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmLeave(false);
                    await onLeaveGroup();
                  }}
                  className="font-bold text-[var(--err-ink)] underline cursor-pointer"
                >
                  بله، ترک گروه
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLeave(false)}
                  className="text-[var(--ink-secondary)] cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Group Discussion & Shared Chapter Insights */}
        <section aria-label="یادداشت‌ها و گفت‌وگوهای مشترک گروه">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--ink-primary)]">
            <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
            <span>تخته یادداشت‌های مشترک گروه</span>
          </h2>

          <form
            onSubmit={handlePostNoteSubmit}
            className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4"
          >
            <label
              htmlFor="group-note-chapter"
              className="block text-[11px] font-medium text-[var(--ink-muted)]"
            >
              مربوط به فصل:
            </label>
            <select
              id="group-note-chapter"
              value={noteChapterId}
              onChange={(e) => setNoteChapterId(e.target.value)}
              className="mt-1 min-h-[40px] w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2.5 text-xs text-[var(--ink-primary)] focus:border-[var(--accent)] focus:outline-none"
            >
              {CHAPTERS_META.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.id} — {ch.title.replace(/`/g, '')}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              maxLength={800}
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="نکته مهم، سوال چالشی یا لینک تجربه عملی خود را با دوستانت به اشتراک بگذار..."
              className="mt-2.5 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 text-xs leading-6 text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
            />

            <button
              type="submit"
              disabled={postingNote || !noteBody.trim()}
              className="mt-2.5 inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{postingNote ? 'در حال ارسال...' : 'ثبت روی تخته گروه'}</span>
            </button>
          </form>

          <div className="mt-4 space-y-2.5">
            {notes.length === 0 ? (
              <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 text-center text-xs leading-6 text-[var(--ink-muted)]">
                هنوز یادداشتی در گروه ثبت نشده است. اولین نکته را بنویس تا گفتگو شروع شود!
              </div>
            ) : (
              notes.slice(0, 25).map((note) => {
                const ch = CHAPTER_MAP[note.chapterId];
                const canDelete =
                  note.authorUid === user.uid || group.ownerId === user.uid;
                return (
                  <div
                    key={note.id}
                    className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--ink-primary)]">
                        {note.authorName}
                      </span>
                      <div className="flex items-center gap-1">
                        {ch && (
                          <button
                            type="button"
                            onClick={() => onSelectChapter(ch.id)}
                            className="inline-flex items-center gap-1 rounded bg-[var(--bg-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--accent)] hover:underline cursor-pointer"
                          >
                            <span dir="ltr" className="bidi-ltr">
                              {ch.id}
                            </span>
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void onDeleteNote(note.id)}
                            aria-label="حذف یادداشت"
                            className="inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ink-muted)] hover:text-[var(--err-ink)] cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[var(--ink-secondary)]">
                      {note.body}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
