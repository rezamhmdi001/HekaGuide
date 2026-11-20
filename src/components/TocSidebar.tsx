import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronLeft } from 'lucide-react';
import { CHAPTERS_META, DOMAINS, TRACKS } from '../data/manifest';
import type { DomainId, TrackId } from '../types/atlas';
import { toPersianDigits } from '../utils/atlasLogic';

interface TocSidebarProps {
  activeChapterId: string;
  completedIds: string[];
  onSelectChapter: (chapterId: string) => void;
}

export const TocSidebar: React.FC<TocSidebarProps> = ({
  activeChapterId,
  completedIds,
  onSelectChapter,
}) => {
  const activeMeta = CHAPTERS_META.find((c) => c.id === activeChapterId);
  const completedSet = new Set(completedIds);

  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const d of DOMAINS) {
      initial[d.id] = activeMeta ? d.id === activeMeta.domainId : d.id === 'D01';
    }
    return initial;
  });

  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const t of TRACKS) {
      initial[t.id] = activeMeta ? t.id === activeMeta.trackId : t.id === 'T01';
    }
    return initial;
  });

  useEffect(() => {
    if (!activeMeta) return;
    setOpenDomains((prev) => ({ ...prev, [activeMeta.domainId]: true }));
    setOpenTracks((prev) => ({ ...prev, [activeMeta.trackId]: true }));
  }, [activeMeta]);

  const toggleDomain = (domainId: DomainId) => {
    setOpenDomains((prev) => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  const toggleTrack = (trackId: TrackId) => {
    setOpenTracks((prev) => ({ ...prev, [trackId]: !prev[trackId] }));
  };

  return (
    <nav aria-label="فهرست اطلس" className="space-y-1.5 text-sm">
      {DOMAINS.map((domain) => {
        const domainOpen = Boolean(openDomains[domain.id]);
        const domainTracks = TRACKS.filter((t) => t.domainId === domain.id);
        const domainDone = CHAPTERS_META.filter(
          (c) => c.domainId === domain.id && completedSet.has(c.id)
        ).length;

        return (
          <div key={domain.id} className="border-b border-[var(--border-hairline)] pb-1.5 last:border-b-0">
            <button
              type="button"
              onClick={() => toggleDomain(domain.id)}
              aria-expanded={domainOpen}
              className="flex min-h-[40px] w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-start hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--ink-muted)]">
                  <span dir="ltr" className="font-mono bidi-ltr">
                    {domain.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {toPersianDigits(domainDone)}/{toPersianDigits(24)}
                  </span>
                </div>
                <div className="truncate text-xs font-semibold text-[var(--ink-primary)]">
                  {domain.title}
                </div>
              </div>
              {domainOpen ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
              )}
            </button>

            {domainOpen && (
              <div className="mt-1 space-y-1 ps-2">
                {domainTracks.map((track) => {
                  const trackOpen = Boolean(openTracks[track.id]);
                  const trackChapters = CHAPTERS_META.filter((c) => c.trackId === track.id);
                  const trackDone = trackChapters.filter((c) => completedSet.has(c.id)).length;

                  return (
                    <div key={track.id}>
                      <button
                        type="button"
                        onClick={() => toggleTrack(track.id)}
                        aria-expanded={trackOpen}
                        className="flex min-h-[36px] w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-start text-xs hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                      >
                        <span className="truncate font-medium text-[var(--ink-secondary)]">
                          <span
                            dir="ltr"
                            className="inline-block font-mono text-[10px] text-[var(--ink-muted)] me-1.5 bidi-ltr"
                          >
                            {track.id}
                          </span>
                          {track.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--ink-muted)] tabular-nums">
                          {toPersianDigits(trackDone)}/{toPersianDigits(trackChapters.length)}
                        </span>
                      </button>

                      {trackOpen && (
                        <ul className="mt-0.5 space-y-0.5 border-s border-[var(--border-hairline)] ms-2.5 ps-2">
                          {trackChapters.map((ch) => {
                            const isActive = ch.id === activeChapterId;
                            const isDone = completedSet.has(ch.id);

                            return (
                              <li key={ch.id}>
                                <button
                                  type="button"
                                  onClick={() => onSelectChapter(ch.id)}
                                  aria-current={isActive ? 'page' : undefined}
                                  className={`flex min-h-[36px] w-full items-start justify-between gap-2 rounded-md px-2 py-1.5 text-start text-xs leading-5 transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)]'
                                      : 'text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]'
                                  }`}
                                >
                                  <span className="line-clamp-2">
                                    <span
                                      dir="ltr"
                                      className="inline-block font-mono text-[10px] text-[var(--ink-muted)] me-1.5 bidi-ltr"
                                    >
                                      C0{ch.order}
                                    </span>
                                    {ch.title.replace(/`/g, '')}
                                  </span>
                                  {isDone && (
                                    <Check
                                      aria-label="تکمیل شده"
                                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--ok-ink)]"
                                    />
                                  )}
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
            )}
          </div>
        );
      })}
    </nav>
  );
};
