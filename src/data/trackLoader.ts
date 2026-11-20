import type { Chapter, TrackContent, TrackId } from '../types/atlas';

const trackCache = new Map<TrackId, TrackContent>();

const trackImporters: Record<TrackId, () => Promise<{ default: TrackContent }>> = {
  T01: () => import('./tracks/t01'),
  T02: () => import('./tracks/t02'),
  T03: () => import('./tracks/t03'),
  T04: () => import('./tracks/t04'),
  T05: () => import('./tracks/t05'),
  T06: () => import('./tracks/t06'),
  T07: () => import('./tracks/t07'),
  T08: () => import('./tracks/t08'),
  T09: () => import('./tracks/t09'),
  T10: () => import('./tracks/t10'),
  T11: () => import('./tracks/t11'),
  T12: () => import('./tracks/t12'),
  T13: () => import('./tracks/t13'),
  T14: () => import('./tracks/t14'),
  T15: () => import('./tracks/t15'),
  T16: () => import('./tracks/t16'),
  T17: () => import('./tracks/t17'),
  T18: () => import('./tracks/t18'),
  T19: () => import('./tracks/t19'),
  T20: () => import('./tracks/t20'),
};

export async function loadTrack(trackId: TrackId): Promise<TrackContent> {
  const cached = trackCache.get(trackId);
  if (cached) {
    return cached;
  }
  const mod = await trackImporters[trackId]();
  const content = mod.default;
  trackCache.set(trackId, content);
  return content;
}

export async function loadChapter(chapterId: string): Promise<Chapter | null> {
  const trackId = chapterId.split('-')[0] as TrackId;
  if (!(trackId in trackImporters)) {
    return null;
  }
  const track = await loadTrack(trackId);
  return track.chapters.find((c) => c.id === chapterId) ?? null;
}

export function clearTrackCache(): void {
  trackCache.clear();
}
