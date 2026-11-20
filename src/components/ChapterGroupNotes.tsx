import React, { useState } from 'react';
import { MessageSquare, Send, Trash2, Users } from 'lucide-react';
import type { GroupNote, StudyGroup } from '../types/atlas';

interface ChapterGroupNotesProps {
  chapterId: string;
  currentUid?: string;
  group: StudyGroup | null;
  notes: GroupNote[];
  onPostNote: (chapterId: string, body: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onOpenGroupTab: () => void;
}

export const ChapterGroupNotes: React.FC<ChapterGroupNotesProps> = ({
  chapterId,
  currentUid,
  group,
  notes,
  onPostNote,
  onDeleteNote,
  onOpenGroupTab,
}) => {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const chapterNotes = notes.filter((n) => n.chapterId === chapterId);

  if (!group) {
    return (
      <section className="my-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] p-4">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2.5">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <div>
              <h3 className="text-xs font-bold text-[var(--ink-primary)]">
                مطالعه گروهی این فصل با دوستان
              </h3>
              <p className="mt-0.5 text-xs leading-5 text-[var(--ink-secondary)]">
                یک گروه مطالعه بسازید یا با کد دعوت وارد شوید تا خلاصه‌ها و سوال‌های این فصل را هم‌زمان با دوستانتان به اشتراک بگذارید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenGroupTab}
            className="inline-flex min-h-[40px] shrink-0 items-center rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            ورود به بخش گروه
          </button>
        </div>
      </section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onPostNote(chapterId, draft);
      setDraft('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="my-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--accent)]" />
          <h3 className="text-xs font-bold text-[var(--ink-primary)]">
            گفت‌وگو و یادداشت‌های گروه «{group.name}» برای این فصل
          </h3>
        </div>
        <span className="font-mono text-[11px] text-[var(--ink-muted)] bidi-ltr">
          {group.id}
        </span>
      </div>

      {chapterNotes.length === 0 ? (
        <p className="py-4 text-xs text-[var(--ink-muted)]">
          هنوز کسی از گروه روی این فصل نکته‌ای ننوشته است. اولین سوال یا خلاصه کاربردی را بنویسید!
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border-hairline)]">
          {chapterNotes.map((note) => {
            const canDelete =
              currentUid === note.authorUid || currentUid === group.ownerId;
            return (
              <li key={note.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--ink-primary)]">
                    {note.authorName}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => void onDeleteNote(note.id)}
                      aria-label="حذف یادداشت گروهی"
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ink-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--err-ink)] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-[var(--ink-secondary)]">
                  {note.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          maxLength={800}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="نکته، مثال واقعی یا سوال خود برای هم‌گروهی‌ها بنویسید..."
          className="min-h-[42px] flex-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-md bg-[var(--accent)] px-4 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{submitting ? 'در حال ارسال...' : 'ارسال در گروه'}</span>
        </button>
      </form>
    </section>
  );
};
