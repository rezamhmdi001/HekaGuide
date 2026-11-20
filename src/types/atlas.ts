export type DomainId = 'D01' | 'D02' | 'D03' | 'D04' | 'D05';
export type TrackId =
  | 'T01' | 'T02' | 'T03' | 'T04'
  | 'T05' | 'T06' | 'T07' | 'T08'
  | 'T09' | 'T10' | 'T11' | 'T12'
  | 'T13' | 'T14' | 'T15' | 'T16'
  | 'T17' | 'T18' | 'T19' | 'T20';

export type DifficultyLevel = 'مبانی عمیق' | 'میدانی' | 'چالشی';

export type StudyPathId = 'architect' | 'fullstack' | 'devops' | 'ai';

export type ReaderTheme = 'paper' | 'sepia' | 'dark';

export type AppTab = 'atlas' | 'read' | 'group' | 'search' | 'progress';

export interface DomainMeta {
  id: DomainId;
  order: number;
  title: string;
  englishTitle: string;
  summary: string;
  trackIds: TrackId[];
}

export interface ChapterMeta {
  id: string;
  code: string;
  domainId: DomainId;
  trackId: TrackId;
  order: number;
  title: string;
  subtitle: string;
  readMinutes: number;
  difficulty: DifficultyLevel;
  keywords: string[];
}

export interface TrackMeta {
  id: TrackId;
  domainId: DomainId;
  order: number;
  title: string;
  subtitle: string;
  chapterIds: string[];
}

export interface StudyPath {
  id: StudyPathId;
  title: string;
  subtitle: string;
  trackIds: TrackId[];
}

export interface DiagramNode {
  label: string;
  sublabel?: string;
  accent?: boolean;
}

export interface VisualDiagram {
  kind: 'flow' | 'layers' | 'split' | 'cycle';
  caption: string;
  nodes: DiagramNode[];
}

export interface CodeExplanation {
  token: string;
  meaning: string;
}

export interface CodeSnippet {
  title: string;
  language: string;
  code: string;
  explanations: CodeExplanation[];
  trap?: string;
}

export interface WarStory {
  title: string;
  symptom: string;
  rootCause: string;
  preventionRule: string;
}

export interface DeepDive {
  title: string;
  content: string[];
  takeAway: string;
}

export interface TriageCheck {
  type: 'triage';
  prompt: string;
  logSnippet?: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface SpotBugCheck {
  type: 'spot_bug';
  prompt: string;
  lines: {
    lineNumber: number;
    code: string;
    isBug?: boolean;
  }[];
  explanation: string;
}

export interface PredictCheck {
  type: 'predict';
  prompt: string;
  snippet: string;
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export interface RecallCheck {
  type: 'recall';
  question: string;
  modelAnswer: string;
}

export type InteractiveCheck =
  | TriageCheck
  | SpotBugCheck
  | PredictCheck
  | RecallCheck;

export interface CrossLink {
  targetId: string;
  reason: string;
}

export interface Chapter {
  id: string;
  code: string;
  domainId: DomainId;
  trackId: TrackId;
  title: string;
  subtitle: string;
  readMinutes: number;
  difficulty: DifficultyLevel;
  originStory: string[];
  mentalModel: {
    paragraphs: string[];
    rulesOfThumb: string[];
    diagram: VisualDiagram;
  };
  lab: CodeSnippet[];
  warStory: WarStory;
  deepDive: DeepDive;
  check: InteractiveCheck;
  crossLinks: CrossLink[];
}

export interface TrackContent {
  trackId: TrackId;
  chapters: Chapter[];
}

export interface GlossaryEntry {
  term: string;
  persianTitle: string;
  category: string;
  definition: string;
  relatedChapterId?: string;
}

export type CheckOutcome = 'passed' | 'review' | 'failed';

export interface AtlasUserState {
  version: 1;
  completedIds: string[];
  bookmarkedIds: string[];
  checkOutcomes: Record<string, CheckOutcome>;
  notes: Record<string, string>;
  lastReadId: string;
  theme: ReaderTheme;
  fontScale: number;
  activePathId: StudyPathId;
  // Gamification, ADHD & Cloud Study Circle extensions
  xp: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  focusMinutes: number;
  activeGroupId: string;
  adhdMode: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  levelMinXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface BadgeMeta {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressLabel: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  weeklyGoalChapters: number;
  memberUids: string[];
  createdAtMs?: number;
}

export interface GroupMember {
  uid: string;
  groupId: string;
  displayName: string;
  role: 'owner' | 'member';
  xp: number;
  completedCount: number;
  streakDays: number;
  lastChapterId: string;
  updatedAtMs?: number;
}

export interface GroupNote {
  id: string;
  groupId: string;
  chapterId: string;
  authorUid: string;
  authorName: string;
  body: string;
  createdAtMs?: number;
}
