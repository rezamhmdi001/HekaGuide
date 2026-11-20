import React, { useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Compass,
  Search,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { AtlasHome } from './components/AtlasHome';
import { ChapterReader } from './components/ChapterReader';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { ProgressView } from './components/ProgressView';
import { ReaderSettingsPopover } from './components/ReaderSettingsPopover';
import { SearchView } from './components/SearchView';
import { StudyGroupView } from './components/StudyGroupView';
import { loadChapter } from './data/trackLoader';
import { auth } from './firebase';
import {
  createStudyGroup,
  deleteGroupNote,
  joinStudyGroup,
  leaveStudyGroup,
  loadAndMergeUserProfile,
  postGroupNote,
  saveCloudUserProfile,
  signInWithGoogle,
  signOutUser,
  subscribeGroupMembers,
  subscribeGroupNotes,
  subscribeStudyGroup,
  syncMemberProgress,
} from './services/studyCloud';
import type {
  AppTab,
  AtlasUserState,
  Chapter,
  CheckOutcome,
  GroupMember,
  GroupNote,
  ReaderTheme,
  StudyGroup,
  StudyPathId,
} from './types/atlas';
import {
  getLevelInfo,
  loadUserState,
  parseRoute,
  saveUserState,
  toPersianDigits,
  touchStudyStreak,
  XP_REWARDS,
} from './utils/atlasLogic';

function navigateUrl(path: string) {
  try {
    if (window.location.pathname !== path || window.location.hash) {
      window.history.pushState({}, '', path);
    }
  } catch {
    window.location.hash = `#${path}`;
  }
}

export function App() {
  const [userState, setUserState] = useState<AtlasUserState>(() => loadUserState());

  const initialRoute = parseRoute(window.location.pathname, window.location.hash);
  const [activeTab, setActiveTab] = useState<AppTab>(initialRoute.tab);
  const [activeChapterId, setActiveChapterId] = useState<string>(
    initialRoute.chapterId ?? loadUserState().lastReadId
  );
  const [pendingInviteCode, setPendingInviteCode] = useState<string>(
    initialRoute.inviteCode ?? ''
  );

  // Chapter state
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Firebase Auth & Study Circle state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudReady, setCloudReady] = useState(false);
  const [activeGroup, setActiveGroup] = useState<StudyGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupNotes, setGroupNotes] = useState<GroupNote[]>([]);

  // UI chrome state
  const [focusMode, setFocusMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const userStateRef = useRef(userState);
  userStateRef.current = userState;

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Persist user state locally
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  // Sync theme & font scale on root HTML element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', userState.theme);
    root.classList.toggle('dark', userState.theme === 'dark');
    root.style.setProperty('--reader-font-size', `${userState.fontScale}rem`);
  }, [userState.theme, userState.fontScale]);

  // Listen to Firebase Auth state & merge local + cloud profile on sign-in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      if (!nextUser) {
        setCloudReady(false);
        setActiveGroup(null);
        setGroupMembers([]);
        setGroupNotes([]);
        return;
      }

      try {
        const merged = await loadAndMergeUserProfile(nextUser, userStateRef.current);
        setUserState(merged);
        setCloudReady(true);
      } catch (err) {
        console.error('Cloud profile merge failed:', err);
        setCloudReady(false);
      }
    });
    return () => unsub();
  }, []);

  // Debounced cloud sync for profile + member leaderboard card when signed in
  useEffect(() => {
    if (!user || !cloudReady) return;
    const timer = window.setTimeout(() => {
      void saveCloudUserProfile(user, userState).catch((err) => {
        console.error('Cloud save failed:', err);
      });
      if (userState.activeGroupId) {
        void syncMemberProgress(user, userState.activeGroupId, userState).catch(
          (err) => {
            console.error('Member progress sync failed:', err);
          }
        );
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [user, cloudReady, userState]);

  // Real-time Study Group subscriptions (strictly gated on auth + activeGroupId)
  useEffect(() => {
    if (!user || !cloudReady || !userState.activeGroupId) {
      setActiveGroup(null);
      setGroupMembers([]);
      setGroupNotes([]);
      return;
    }

    const gid = userState.activeGroupId;
    const unsubGroup = subscribeStudyGroup(
      gid,
      (grp) => {
        setActiveGroup(grp);
        if (!grp) {
          setUserState((prev) =>
            prev.activeGroupId === gid ? { ...prev, activeGroupId: '' } : prev
          );
        }
      },
      (err) => console.error('StudyGroup snapshot error:', err)
    );
    const unsubMembers = subscribeGroupMembers(
      gid,
      setGroupMembers,
      (err) => console.error('GroupMembers snapshot error:', err)
    );
    const unsubNotes = subscribeGroupNotes(
      gid,
      setGroupNotes,
      (err) => console.error('GroupNotes snapshot error:', err)
    );

    return () => {
      unsubGroup();
      unsubMembers();
      unsubNotes();
    };
  }, [user, cloudReady, userState.activeGroupId]);

  // Handle browser back/forward and hash routes
  useEffect(() => {
    const syncFromLocation = () => {
      const parsed = parseRoute(window.location.pathname, window.location.hash);
      setActiveTab(parsed.tab);
      if (parsed.chapterId) {
        setActiveChapterId(parsed.chapterId);
      }
      if (parsed.inviteCode) {
        setPendingInviteCode(parsed.inviteCode);
      }
      if (parsed.tab !== 'read') {
        setFocusMode(false);
      }
    };
    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  // Lazy load chapter when in reading tab
  useEffect(() => {
    if (activeTab !== 'read') return;
    let cancelled = false;
    setChapterLoading(true);
    setChapterError(null);

    loadChapter(activeChapterId)
      .then((ch) => {
        if (cancelled) return;
        if (!ch) {
          setChapterError('فصل مورد نظر در اطلس پیدا نشد.');
          setChapterData(null);
        } else {
          setChapterData(ch);
          setUserState((prev) =>
            prev.lastReadId === ch.id ? prev : { ...prev, lastReadId: ch.id }
          );
        }
        setChapterLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setChapterError('بارگذاری محتوای این فصل با خطا مواجه شد.');
        setChapterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, activeChapterId]);

  const openChapter = useCallback((chapterId: string) => {
    setActiveChapterId(chapterId);
    setActiveTab('read');
    navigateUrl(`/chapter/${chapterId}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const switchTab = useCallback(
    (tab: AppTab) => {
      setActiveTab(tab);
      if (tab !== 'read') setFocusMode(false);
      if (tab === 'atlas') navigateUrl('/');
      else if (tab === 'read') navigateUrl(`/chapter/${activeChapterId}`);
      else if (tab === 'group') navigateUrl('/group');
      else if (tab === 'search') navigateUrl('/search');
      else if (tab === 'progress') navigateUrl('/progress');
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [activeChapterId]
  );

  const awardXpAndStreak = useCallback(
    (
      updater: (prev: AtlasUserState) => {
        next: AtlasUserState;
        gainedXp: number;
        reason?: string;
      }
    ) => {
      let toastMsg: string | null = null;
      setUserState((prev) => {
        const prevLevel = getLevelInfo(prev.xp).level;
        const { next, gainedXp, reason } = updater(prev);
        if (gainedXp > 0) {
          const streak = touchStudyStreak(next.streakDays, next.lastActiveDate);
          const finalXp = next.xp + gainedXp;
          const nextLevelInfo = getLevelInfo(finalXp);
          if (nextLevelInfo.level > prevLevel) {
            toastMsg = `تبریک! به سطح ${toPersianDigits(nextLevelInfo.level)} (${nextLevelInfo.title}) رسیدید! (+${toPersianDigits(gainedXp)} XP)`;
          } else if (reason) {
            toastMsg = `${reason} (+${toPersianDigits(gainedXp)} XP)`;
          }
          return {
            ...next,
            xp: finalXp,
            streakDays: streak.streakDays,
            lastActiveDate: streak.lastActiveDate,
          };
        }
        return next;
      });
      if (toastMsg) {
        showToast(toastMsg);
      }
    },
    [showToast]
  );

  const handleToggleComplete = useCallback(
    (chapterId: string) => {
      awardXpAndStreak((prev) => {
        const exists = prev.completedIds.includes(chapterId);
        const completedIds = exists
          ? prev.completedIds.filter((id) => id !== chapterId)
          : [...prev.completedIds, chapterId];
        return {
          next: { ...prev, completedIds },
          gainedXp: exists ? 0 : XP_REWARDS.CHAPTER_COMPLETE,
          reason: exists ? undefined : 'فصل با موفقیت تکمیل شد',
        };
      });
    },
    [awardXpAndStreak]
  );

  const handleToggleBookmark = useCallback((chapterId: string) => {
    setUserState((prev) => {
      const exists = prev.bookmarkedIds.includes(chapterId);
      const bookmarkedIds = exists
        ? prev.bookmarkedIds.filter((id) => id !== chapterId)
        : [chapterId, ...prev.bookmarkedIds];
      return { ...prev, bookmarkedIds };
    });
  }, []);

  const handleShareChapter = useCallback(
    async (chapterId: string) => {
      const shareUrl = `${window.location.origin}/chapter/${chapterId}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('لینک مستقیم این فصل کپی شد.');
      } catch {
        showToast(`لینک فصل: /chapter/${chapterId}`);
      }
    },
    [showToast]
  );

  const handleRecordCheck = useCallback(
    (chapterId: string, outcome: CheckOutcome) => {
      awardXpAndStreak((prev) => {
        const alreadyPassed = prev.checkOutcomes[chapterId] === 'passed';
        const gainedXp =
          outcome === 'passed' && !alreadyPassed ? XP_REWARDS.CHECK_PASSED : 0;
        return {
          next: {
            ...prev,
            checkOutcomes: { ...prev.checkOutcomes, [chapterId]: outcome },
          },
          gainedXp,
          reason: gainedXp > 0 ? 'پاسخ دقیق در آزمون تعاملی' : undefined,
        };
      });
    },
    [awardXpAndStreak]
  );

  const handleUpdateNote = useCallback(
    (chapterId: string, text: string) => {
      awardXpAndStreak((prev) => {
        const hadNote = Boolean(prev.notes[chapterId]?.trim());
        const hasNow = text.trim().length > 0;
        const nextNotes = { ...prev.notes };
        if (!hasNow) {
          delete nextNotes[chapterId];
        } else {
          nextNotes[chapterId] = text;
        }
        return {
          next: { ...prev, notes: nextNotes },
          gainedXp: !hadNote && hasNow ? XP_REWARDS.FIELD_NOTE : 0,
          reason: !hadNote && hasNow ? 'یادداشت میدانی ثبت شد' : undefined,
        };
      });
    },
    [awardXpAndStreak]
  );

  const handleCompleteFocusSprint = useCallback(
    (minutes: number) => {
      awardXpAndStreak((prev) => ({
        next: { ...prev, focusMinutes: prev.focusMinutes + minutes },
        gainedXp: XP_REWARDS.FOCUS_SPRINT,
        reason: `اسپرینت ${toPersianDigits(minutes)} دقیقه‌ای تمرکز تکمیل شد`,
      }));
    },
    [awardXpAndStreak]
  );

  const handleToggleAdhdMode = useCallback(() => {
    setUserState((prev) => {
      const next = !prev.adhdMode;
      showToast(
        next
          ? 'حالت مطالعه گام‌به‌گام (ویژه ADHD) فعال شد.'
          : 'نمایش پیوسته کامل درسنامه فعال شد.'
      );
      return { ...prev, adhdMode: next };
    });
  }, [showToast]);

  const handleChangeTheme = useCallback((theme: ReaderTheme) => {
    setUserState((prev) => ({ ...prev, theme }));
  }, []);

  const handleChangeFontScale = useCallback((fontScale: number) => {
    setUserState((prev) => ({ ...prev, fontScale }));
  }, []);

  const handleSelectPath = useCallback((activePathId: StudyPathId) => {
    setUserState((prev) => ({ ...prev, activePathId }));
  }, []);

  const handleOpenGlossary = useCallback((term = '') => {
    setGlossaryQuery(term);
    setGlossaryOpen(true);
  }, []);

  // Study Group Auth & Cloud Actions
  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGoogle();
      showToast('ورود با موفقیت انجام شد. پیشرفت شما همگام‌سازی شد.');
    } catch {
      showToast('ورود با حساب گوگل لغو شد یا با خطا مواجه گردید.');
    }
  }, [showToast]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    showToast('از حساب ابری خارج شدید. پیشرفت محلی شما محفوظ است.');
  }, [showToast]);

  const handleCreateGroup = useCallback(
    async (name: string, description: string, weeklyGoal: number) => {
      if (!user) return;
      const created = await createStudyGroup(
        user,
        name,
        description,
        weeklyGoal,
        userStateRef.current
      );
      setUserState((prev) => ({ ...prev, activeGroupId: created.id }));
      showToast(`گروه «${created.name}» ساخته شد! کد دعوت: ${created.id}`);
    },
    [user, showToast]
  );

  const handleJoinGroup = useCallback(
    async (inviteCode: string) => {
      if (!user) return { ok: false, error: 'ابتدا با حساب گوگل وارد شوید.' };
      const res = await joinStudyGroup(user, inviteCode, userStateRef.current);
      if (res.ok && res.group) {
        setUserState((prev) => ({ ...prev, activeGroupId: res.group!.id }));
        setPendingInviteCode('');
        showToast(`به گروه «${res.group.name}» خوش آمدید!`);
      }
      return { ok: res.ok, error: res.error };
    },
    [user, showToast]
  );

  const handleLeaveGroup = useCallback(async () => {
    if (!user || !activeGroup) return;
    await leaveStudyGroup(user, activeGroup);
    setUserState((prev) => ({ ...prev, activeGroupId: '' }));
    showToast('از گروه مطالعه خارج شدید.');
  }, [user, activeGroup, showToast]);

  const handlePostGroupNote = useCallback(
    async (chapterId: string, body: string) => {
      if (!user || !activeGroup) return;
      await postGroupNote(user, activeGroup.id, chapterId, body);
      showToast('یادداشت شما روی تخته گروه ثبت شد.');
    },
    [user, activeGroup, showToast]
  );

  const handleDeleteGroupNote = useCallback(
    async (noteId: string) => {
      if (!activeGroup) return;
      await deleteGroupNote(activeGroup.id, noteId);
      showToast('یادداشت حذف شد.');
    },
    [activeGroup, showToast]
  );

  const navItems: {
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'atlas', label: 'اطلس', icon: Compass },
    { id: 'read', label: 'مطالعه', icon: BookOpen },
    { id: 'group', label: 'گروه', icon: Users },
    { id: 'search', label: 'جستجو', icon: Search },
    { id: 'progress', label: 'پیشرفت', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink-primary)]">
      {/* Top Bar — Slim 48px on Mobile, 56px 3-zone on Desktop; hidden in Focus Mode */}
      {!focusMode && (
        <header className="sticky top-0 z-30 border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]/95 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-14">
            {/* Start: Wordmark */}
            <button
              type="button"
              onClick={() => switchTab('atlas')}
              className="flex items-center gap-2 text-start cursor-pointer"
            >
              <span className="font-mono text-xs font-bold tracking-tight text-[var(--accent)] bidi-ltr">
                ATLAS
              </span>
              <span className="text-sm font-bold text-[var(--ink-primary)]">
                اطلس مهندسی مدرن
              </span>
            </button>

            {/* Center: Desktop 5-tab navigation */}
            <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => switchTab(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`min-h-[38px] rounded-md px-3.5 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                        : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* End: Glossary + Settings */}
            <div className="relative flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenGlossary('')}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
              >
                <BookMarked className="h-3.5 w-3.5" />
                <span>واژه‌نامه</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsOpen((v) => !v)}
                aria-expanded={settingsOpen}
                aria-label="تنظیمات نمایش و مطالعه"
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>

              <ReaderSettingsPopover
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                theme={userState.theme}
                onChangeTheme={handleChangeTheme}
                fontScale={userState.fontScale}
                onChangeFontScale={handleChangeFontScale}
                focusMode={focusMode}
                onToggleFocusMode={() => setFocusMode((v) => !v)}
                showFocusToggle={activeTab === 'read'}
              />
            </div>
          </div>
        </header>
      )}

      {/* Main View */}
      <main className={focusMode ? 'pb-12' : 'pb-20 md:pb-12'}>
        {activeTab === 'atlas' && (
          <AtlasHome
            activePathId={userState.activePathId}
            completedIds={userState.completedIds}
            lastReadId={userState.lastReadId}
            xp={userState.xp}
            streakDays={userState.streakDays}
            adhdMode={userState.adhdMode}
            activeGroup={activeGroup}
            onSelectPath={handleSelectPath}
            onSelectChapter={openChapter}
            onToggleAdhdMode={handleToggleAdhdMode}
            onOpenGroupTab={() => switchTab('group')}
          />
        )}

        {activeTab === 'read' && (
          <ChapterReader
            chapter={chapterData}
            loading={chapterLoading}
            error={chapterError}
            isCompleted={userState.completedIds.includes(activeChapterId)}
            isBookmarked={userState.bookmarkedIds.includes(activeChapterId)}
            savedCheckOutcome={userState.checkOutcomes[activeChapterId]}
            noteValue={userState.notes[activeChapterId] ?? ''}
            completedIds={userState.completedIds}
            focusMode={focusMode}
            adhdMode={userState.adhdMode}
            currentUid={user?.uid}
            activeGroup={activeGroup}
            groupNotes={groupNotes}
            onExitFocusMode={() => setFocusMode(false)}
            onToggleAdhdMode={handleToggleAdhdMode}
            onCompleteFocusSprint={handleCompleteFocusSprint}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onShareChapter={handleShareChapter}
            onRecordCheck={handleRecordCheck}
            onUpdateNote={handleUpdateNote}
            onPostGroupNote={handlePostGroupNote}
            onDeleteGroupNote={handleDeleteGroupNote}
            onOpenGroupTab={() => switchTab('group')}
            onSelectChapter={openChapter}
            onOpenGlossaryTerm={(term) => handleOpenGlossary(term)}
          />
        )}

        {activeTab === 'group' && (
          <StudyGroupView
            user={user}
            authLoading={authLoading}
            userState={userState}
            group={activeGroup}
            members={groupMembers}
            notes={groupNotes}
            initialInviteCode={pendingInviteCode}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
            onLeaveGroup={handleLeaveGroup}
            onPostNote={handlePostGroupNote}
            onDeleteNote={handleDeleteGroupNote}
            onSelectChapter={openChapter}
            onToast={showToast}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            completedIds={userState.completedIds}
            onSelectChapter={openChapter}
            onOpenGlossaryTerm={(term) => handleOpenGlossary(term)}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            userState={userState}
            isSignedIn={Boolean(user)}
            hasStudyGroup={Boolean(activeGroup)}
            onSelectChapter={openChapter}
            onImportState={(next) => setUserState(next)}
            onToast={showToast}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation (56px, 5 crisp tabs, <= 15% viewport height) */}
      {!focusMode && (
        <nav
          aria-label="ناوبری پایین موبایل"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-sm pb-safe md:hidden"
        >
          <div className="grid h-14 grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => switchTab(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                    active ? 'text-[var(--accent)] font-semibold' : 'text-[var(--ink-muted)]'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Glossary Slide-over Drawer */}
      <GlossaryDrawer
        isOpen={glossaryOpen}
        initialQuery={glossaryQuery}
        onClose={() => setGlossaryOpen(false)}
        onSelectChapter={openChapter}
      />

      {/* Toast Confirmation */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 truncate rounded-md border border-[var(--border-strong)] bg-[var(--ink-primary)] px-4 py-2.5 text-xs font-medium text-[var(--bg-canvas)] shadow-lg md:bottom-6"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
