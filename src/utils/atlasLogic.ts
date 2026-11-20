import { CHAPTERS_META, CHAPTER_MAP, DOMAINS, STUDY_PATHS, TRACKS } from '../data/manifest';
import { GLOSSARY } from '../data/glossary';
import type {
  AppTab,
  AtlasUserState,
  BadgeMeta,
  ChapterMeta,
  CheckOutcome,
  DomainId,
  GlossaryEntry,
  LevelInfo,
  ReaderTheme,
  StudyPathId,
  TrackMeta,
} from '../types/atlas';

export const STORAGE_KEY = 'engineering_atlas_v1';

export const XP_REWARDS = {
  CHAPTER_COMPLETE: 50,
  CHECK_PASSED: 25,
  FIELD_NOTE: 15,
  FOCUS_SPRINT: 15,
} as const;

export function getTodayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const DEFAULT_USER_STATE: AtlasUserState = {
  version: 1,
  completedIds: [],
  bookmarkedIds: [],
  checkOutcomes: {},
  notes: {},
  lastReadId: 'T01-C01',
  theme: 'paper',
  fontScale: 1,
  activePathId: 'architect',
  xp: 0,
  streakDays: 0,
  lastActiveDate: getTodayIsoDate(),
  focusMinutes: 0,
  activeGroupId: '',
  adhdMode: false,
};

const VALID_THEMES: ReaderTheme[] = ['paper', 'sepia', 'dark'];
const VALID_PATHS: StudyPathId[] = ['architect', 'fullstack', 'devops', 'ai'];
const VALID_OUTCOMES: CheckOutcome[] = ['passed', 'review', 'failed'];
const DATE_PATTERN = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const GROUP_ID_PATTERN = /^[a-zA-Z0-9_-]{4,64}$/;

export function computeBaselineXp(
  completedIds: string[],
  checkOutcomes: Record<string, CheckOutcome>,
  notes: Record<string, string>,
  focusMinutes: number
): number {
  const completedXp = completedIds.length * XP_REWARDS.CHAPTER_COMPLETE;
  const passedChecks = Object.values(checkOutcomes).filter((v) => v === 'passed').length;
  const checkXp = passedChecks * XP_REWARDS.CHECK_PASSED;
  const noteCount = Object.values(notes).filter((v) => v.trim().length > 0).length;
  const noteXp = noteCount * XP_REWARDS.FIELD_NOTE;
  const sprintXp = Math.floor(focusMinutes / 5) * 5;
  return completedXp + checkXp + noteXp + sprintXp;
}

export function sanitizeUserState(raw: unknown): AtlasUserState {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_USER_STATE, lastActiveDate: getTodayIsoDate() };
  }
  const obj = raw as Record<string, unknown>;

  const completedIds = Array.isArray(obj.completedIds)
    ? Array.from(
        new Set(
          obj.completedIds.filter(
            (id): id is string => typeof id === 'string' && id in CHAPTER_MAP
          )
        )
      )
    : [];

  const bookmarkedIds = Array.isArray(obj.bookmarkedIds)
    ? Array.from(
        new Set(
          obj.bookmarkedIds.filter(
            (id): id is string => typeof id === 'string' && id in CHAPTER_MAP
          )
        )
      )
    : [];

  const checkOutcomes: Record<string, CheckOutcome> = {};
  if (obj.checkOutcomes && typeof obj.checkOutcomes === 'object') {
    for (const [k, v] of Object.entries(obj.checkOutcomes as Record<string, unknown>)) {
      if (k in CHAPTER_MAP && typeof v === 'string' && VALID_OUTCOMES.includes(v as CheckOutcome)) {
        checkOutcomes[k] = v as CheckOutcome;
      }
    }
  }

  const notes: Record<string, string> = {};
  if (obj.notes && typeof obj.notes === 'object') {
    for (const [k, v] of Object.entries(obj.notes as Record<string, unknown>)) {
      if (k in CHAPTER_MAP && typeof v === 'string' && v.trim().length > 0) {
        notes[k] = v.slice(0, 4000);
      }
    }
  }

  const lastReadId =
    typeof obj.lastReadId === 'string' && obj.lastReadId in CHAPTER_MAP
      ? obj.lastReadId
      : 'T01-C01';

  const theme: ReaderTheme =
    typeof obj.theme === 'string' && VALID_THEMES.includes(obj.theme as ReaderTheme)
      ? (obj.theme as ReaderTheme)
      : 'paper';

  const rawScale = typeof obj.fontScale === 'number' ? obj.fontScale : 1;
  const fontScale = Math.min(1.25, Math.max(0.88, Number(rawScale.toFixed(2))));

  const activePathId: StudyPathId =
    typeof obj.activePathId === 'string' && VALID_PATHS.includes(obj.activePathId as StudyPathId)
      ? (obj.activePathId as StudyPathId)
      : 'architect';

  const focusMinutes =
    typeof obj.focusMinutes === 'number' && Number.isFinite(obj.focusMinutes)
      ? Math.min(500000, Math.max(0, Math.round(obj.focusMinutes)))
      : 0;

  const baselineXp = computeBaselineXp(completedIds, checkOutcomes, notes, focusMinutes);
  const rawXp =
    typeof obj.xp === 'number' && Number.isFinite(obj.xp)
      ? Math.min(1000000, Math.max(0, Math.round(obj.xp)))
      : baselineXp;
  const xp = Math.max(rawXp, baselineXp);

  const streakDays =
    typeof obj.streakDays === 'number' && Number.isFinite(obj.streakDays)
      ? Math.min(3650, Math.max(0, Math.round(obj.streakDays)))
      : completedIds.length > 0
      ? 1
      : 0;

  const lastActiveDate =
    typeof obj.lastActiveDate === 'string' && DATE_PATTERN.test(obj.lastActiveDate)
      ? obj.lastActiveDate
      : getTodayIsoDate();

  const activeGroupId =
    typeof obj.activeGroupId === 'string' && GROUP_ID_PATTERN.test(obj.activeGroupId)
      ? obj.activeGroupId
      : '';

  const adhdMode = typeof obj.adhdMode === 'boolean' ? obj.adhdMode : false;

  return {
    version: 1,
    completedIds,
    bookmarkedIds,
    checkOutcomes,
    notes,
    lastReadId,
    theme,
    fontScale,
    activePathId,
    xp,
    streakDays,
    lastActiveDate,
    focusMinutes,
    activeGroupId,
    adhdMode,
  };
}

export function loadUserState(): AtlasUserState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_USER_STATE, lastActiveDate: getTodayIsoDate() };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_STATE, lastActiveDate: getTodayIsoDate() };
    return sanitizeUserState(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_USER_STATE, lastActiveDate: getTodayIsoDate() };
  }
}

export function saveUserState(state: AtlasUserState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function exportUserStateJson(state: AtlasUserState): string {
  return JSON.stringify(state, null, 2);
}

export function importUserStateJson(jsonText: string): {
  ok: boolean;
  state?: AtlasUserState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'فرمت فایل JSON نامعتبر است.' };
    }
    return { ok: true, state: sanitizeUserState(parsed) };
  } catch {
    return { ok: false, error: 'خواندن JSON ممکن نشد؛ ساختار فایل را بررسی کنید.' };
  }
}

// -----------------------------------------------------------------------------
// Gamification: Levels, Streaks, Badges & Local-Cloud Merging
// -----------------------------------------------------------------------------

const LEVEL_THRESHOLDS: { minXp: number; title: string }[] = [
  { minXp: 0, title: 'کاوشگر تازه‌نفس' },
  { minXp: 150, title: 'کارآموز زیرساخت' },
  { minXp: 350, title: 'مهندس سیستم جوان' },
  { minXp: 650, title: 'سازنده وب و API' },
  { minXp: 1050, title: 'کاوشگر کرنل و شبکه' },
  { minXp: 1550, title: 'معمار داده و تراکنش' },
  { minXp: 2150, title: 'نگهبان امنیت و تولید' },
  { minXp: 2850, title: 'مهندس DevOps ارشد' },
  { minXp: 3700, title: 'طراح سیستم‌های توزیع‌شده' },
  { minXp: 4700, title: 'مهندس سیستم‌های AI' },
  { minXp: 5900, title: 'معمار اصلی (Staff Engineer)' },
  { minXp: 7300, title: 'استاد کامل اطلس' },
];

export function getLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.round(xp));
  let idx = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i].minXp) {
      idx = i;
      break;
    }
  }
  const current = LEVEL_THRESHOLDS[idx];
  const next = LEVEL_THRESHOLDS[idx + 1];
  if (!next) {
    return {
      level: idx + 1,
      title: current.title,
      currentXp: safeXp,
      levelMinXp: current.minXp,
      nextLevelXp: current.minXp,
      progressPercent: 100,
    };
  }
  const span = next.minXp - current.minXp;
  const gained = safeXp - current.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));
  return {
    level: idx + 1,
    title: current.title,
    currentXp: safeXp,
    levelMinXp: current.minXp,
    nextLevelXp: next.minXp,
    progressPercent,
  };
}

function daysBetweenIsoDates(olderIso: string, newerIso: string): number {
  if (!DATE_PATTERN.test(olderIso) || !DATE_PATTERN.test(newerIso)) return 999;
  const [y1, m1, d1] = olderIso.split('-').map(Number);
  const [y2, m2, d2] = newerIso.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export function touchStudyStreak(
  prevStreak: number,
  lastActiveDate: string,
  todayIso = getTodayIsoDate()
): { streakDays: number; lastActiveDate: string } {
  if (prevStreak <= 0) {
    return { streakDays: 1, lastActiveDate: todayIso };
  }
  const diff = daysBetweenIsoDates(lastActiveDate, todayIso);
  if (diff <= 0) {
    return { streakDays: prevStreak, lastActiveDate: todayIso };
  }
  if (diff === 1) {
    return { streakDays: prevStreak + 1, lastActiveDate: todayIso };
  }
  return { streakDays: 1, lastActiveDate: todayIso };
}

export function computeBadges(state: AtlasUserState, hasStudyGroup: boolean): BadgeMeta[] {
  const completedCount = state.completedIds.length;
  const passedChecks = Object.values(state.checkOutcomes).filter((v) => v === 'passed').length;
  const noteCount = Object.values(state.notes).filter((v) => v.trim().length > 0).length;
  const domainStats = computeDomainProgress(state.completedIds);
  const domainsTouched = domainStats.filter((d) => d.completed > 0).length;
  const anyDomainComplete = domainStats.some((d) => d.completed === d.total && d.total > 0);

  return [
    {
      id: 'first-step',
      title: 'گام اول مهندسی',
      description: 'تکمیل اولین فصل در اطلس مهندسی مدرن',
      unlocked: completedCount >= 1,
      progressLabel: `${Math.min(completedCount, 1)}/1 فصل`,
    },
    {
      id: 'active-thinker',
      title: 'یادگیرنده فعال',
      description: 'پاسخ درست به ۵ آزمون تعاملی پایان فصل',
      unlocked: passedChecks >= 5,
      progressLabel: `${Math.min(passedChecks, 5)}/5 آزمون`,
    },
    {
      id: 'deep-focus',
      title: 'تک‌تمرکز عمیق',
      description: 'ثبت دست‌کم ۱۵ دقیقه اسپرینت تمرکز (Pomodoro)',
      unlocked: state.focusMinutes >= 15,
      progressLabel: `${Math.min(state.focusMinutes, 15)}/15 دقیقه`,
    },
    {
      id: 'field-chronicler',
      title: 'یادداشت‌بردار میدانی',
      description: 'نوشتن یادداشت عملی برای ۳ فصل مختلف',
      unlocked: noteCount >= 3,
      progressLabel: `${Math.min(noteCount, 3)}/3 یادداشت`,
    },
    {
      id: 'streak-3',
      title: 'استمرار ۳ روزه',
      description: 'مطالعه پیوسته در ۳ روز متوالی',
      unlocked: state.streakDays >= 3,
      progressLabel: `${Math.min(state.streakDays, 3)}/3 روز`,
    },
    {
      id: 'polymath',
      title: 'مهندس چندبُعدی',
      description: 'تکمیل دست‌کم یک فصل در هر ۵ حوزه اطلس',
      unlocked: domainsTouched >= 5,
      progressLabel: `${domainsTouched}/5 حوزه`,
    },
    {
      id: 'study-circle',
      title: 'هم‌مسیر مطالعه',
      description: 'عضویت یا ساخت یک گروه مطالعه با دوستان',
      unlocked: hasStudyGroup || Boolean(state.activeGroupId),
      progressLabel: hasStudyGroup || Boolean(state.activeGroupId) ? 'فعال' : 'عضو نشده',
    },
    {
      id: 'domain-master',
      title: 'استاد یک حوزه کامل',
      description: 'تکمیل صددرصدی تمام ۲۴ فصل یک حوزه',
      unlocked: anyDomainComplete,
      progressLabel: anyDomainComplete ? 'تکمیل شد' : 'در حال مسیر',
    },
  ];
}

export function mergeUserStates(local: AtlasUserState, cloud: AtlasUserState): AtlasUserState {
  const completedIds = Array.from(new Set([...local.completedIds, ...cloud.completedIds]));
  const bookmarkedIds = Array.from(new Set([...local.bookmarkedIds, ...cloud.bookmarkedIds]));

  const outcomeRank: Record<CheckOutcome, number> = { failed: 1, review: 2, passed: 3 };
  const checkOutcomes: Record<string, CheckOutcome> = { ...local.checkOutcomes };
  for (const [k, v] of Object.entries(cloud.checkOutcomes)) {
    const prev = checkOutcomes[k];
    if (!prev || outcomeRank[v] >= outcomeRank[prev]) {
      checkOutcomes[k] = v;
    }
  }

  const notes: Record<string, string> = { ...cloud.notes };
  for (const [k, v] of Object.entries(local.notes)) {
    if (!notes[k] || v.length > notes[k].length) {
      notes[k] = v;
    }
  }

  const focusMinutes = Math.max(local.focusMinutes, cloud.focusMinutes);
  const baseline = computeBaselineXp(completedIds, checkOutcomes, notes, focusMinutes);
  const xp = Math.max(local.xp, cloud.xp, baseline);
  const streakDays = Math.max(local.streakDays, cloud.streakDays);
  const lastActiveDate =
    local.lastActiveDate >= cloud.lastActiveDate ? local.lastActiveDate : cloud.lastActiveDate;

  return sanitizeUserState({
    ...local,
    completedIds,
    bookmarkedIds,
    checkOutcomes,
    notes,
    xp,
    streakDays,
    lastActiveDate,
    focusMinutes,
    activeGroupId: cloud.activeGroupId || local.activeGroupId,
    lastReadId: local.lastReadId !== 'T01-C01' ? local.lastReadId : cloud.lastReadId,
  });
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ATLAS-${suffix}`;
}

export function getSpacedReviewQueue(state: AtlasUserState): {
  chapterId: string;
  reason: 'failed' | 'review' | 'reinforce';
}[] {
  const items: { chapterId: string; reason: 'failed' | 'review' | 'reinforce' }[] = [];
  const seen = new Set<string>();

  for (const [id, outcome] of Object.entries(state.checkOutcomes)) {
    if (id in CHAPTER_MAP && (outcome === 'failed' || outcome === 'review')) {
      items.push({ chapterId: id, reason: outcome });
      seen.add(id);
    }
  }

  // Also suggest completed chapters whose check hasn't been passed yet for active recall reinforcement
  for (const id of state.completedIds) {
    if (!seen.has(id) && state.checkOutcomes[id] !== 'passed' && id in CHAPTER_MAP) {
      items.push({ chapterId: id, reason: 'reinforce' });
      seen.add(id);
    }
  }

  return items;
}

// -----------------------------------------------------------------------------
// Search, Filtering, Progress & Routing
// -----------------------------------------------------------------------------

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌\u200c]/g, ' ')
    .replace(/[`'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface SearchResults {
  chapters: ChapterMeta[];
  glossary: GlossaryEntry[];
}

export function searchAtlas(query: string): SearchResults {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return { chapters: [], glossary: [] };
  }
  const tokens = normalized.split(' ').filter(Boolean);

  const scoredChapters: { chapter: ChapterMeta; score: number }[] = [];
  for (const chapter of CHAPTERS_META) {
    const haystack = normalizeSearchText(
      `${chapter.id} ${chapter.code} ${chapter.title} ${chapter.subtitle} ${chapter.keywords.join(' ')}`
    );
    const titleNorm = normalizeSearchText(chapter.title);
    const idNorm = chapter.id.toLowerCase();

    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      if (idNorm === token) {
        score += 120;
      } else if (chapter.keywords.some((k) => normalizeSearchText(k) === token)) {
        score += 90;
      } else if (titleNorm.includes(token)) {
        score += 60;
      } else if (haystack.includes(token)) {
        score += 25;
      } else {
        matchedAll = false;
        break;
      }
    }
    if (matchedAll && score > 0) {
      scoredChapters.push({ chapter, score });
    }
  }

  scoredChapters.sort((a, b) => b.score - a.score || a.chapter.id.localeCompare(b.chapter.id));

  const matchedGlossary = GLOSSARY.filter((entry) => {
    const haystack = normalizeSearchText(
      `${entry.term} ${entry.persianTitle} ${entry.category} ${entry.definition}`
    );
    return tokens.every((t) => haystack.includes(t));
  });

  return {
    chapters: scoredChapters.map((s) => s.chapter),
    glossary: matchedGlossary,
  };
}

export function getFilteredTracks(pathId: StudyPathId): TrackMeta[] {
  const path = STUDY_PATHS.find((p) => p.id === pathId) ?? STUDY_PATHS[0];
  const allowed = new Set(path.trackIds);
  return TRACKS.filter((t) => allowed.has(t.id));
}

export interface DomainProgress {
  domainId: DomainId;
  title: string;
  completed: number;
  total: number;
  percent: number;
}

export function computeDomainProgress(completedIds: string[]): DomainProgress[] {
  const done = new Set(completedIds);
  return DOMAINS.map((domain) => {
    const domainChapters = CHAPTERS_META.filter((c) => c.domainId === domain.id);
    const completed = domainChapters.filter((c) => done.has(c.id)).length;
    const total = domainChapters.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      domainId: domain.id,
      title: domain.title,
      completed,
      total,
      percent,
    };
  });
}

export function getAdjacentChapters(chapterId: string): {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
  isNextNewTrack: boolean;
} {
  const idx = CHAPTERS_META.findIndex((c) => c.id === chapterId);
  if (idx === -1) {
    return { prev: null, next: null, isNextNewTrack: false };
  }
  const current = CHAPTERS_META[idx];
  const prev = idx > 0 ? CHAPTERS_META[idx - 1] : null;
  const next = idx < CHAPTERS_META.length - 1 ? CHAPTERS_META[idx + 1] : null;
  const isNextNewTrack = Boolean(next && next.trackId !== current.trackId);
  return { prev, next, isNextNewTrack };
}

export function parseRoute(pathname: string, hash: string): {
  tab: AppTab;
  chapterId?: string;
  inviteCode?: string;
} {
  const effectivePath =
    hash && hash.startsWith('#/') ? hash.slice(1) : pathname;
  const cleaned = effectivePath.replace(/\/+$/, '') || '/';

  if (cleaned.startsWith('/chapter/')) {
    const id = decodeURIComponent(cleaned.slice('/chapter/'.length)).toUpperCase();
    if (id in CHAPTER_MAP) {
      return { tab: 'read', chapterId: id };
    }
  }
  if (cleaned === '/group') {
    return { tab: 'group' };
  }
  if (cleaned.startsWith('/group/')) {
    const code = decodeURIComponent(cleaned.slice('/group/'.length))
      .trim()
      .toUpperCase();
    if (GROUP_ID_PATTERN.test(code)) {
      return { tab: 'group', inviteCode: code };
    }
    return { tab: 'group' };
  }
  if (cleaned === '/search') {
    return { tab: 'search' };
  }
  if (cleaned === '/progress') {
    return { tab: 'progress' };
  }
  return { tab: 'atlas' };
}

export function toPersianDigits(input: number | string): string {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/\d/g, (d) => digits[Number(d)]);
}
