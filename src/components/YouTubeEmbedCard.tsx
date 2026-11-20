import React, { useState } from 'react';
import { ExternalLink, Play, Video } from 'lucide-react';
import type { ChapterVideo } from '../data/chapterMedia';

interface YouTubeEmbedCardProps {
  video: ChapterVideo;
}

export const YouTubeEmbedCard: React.FC<YouTubeEmbedCardProps> = ({ video }) => {
  const [loaded, setLoaded] = useState(false);
  const watchUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&autoplay=1`;

  return (
    <section
      aria-label="ویدیوی آموزشی مکمل"
      className="my-6 overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-primary)]">
          <Video className="h-4 w-4 text-[var(--accent)]" />
          <span>ویدیوی آموزشی برگزیده (یوتیوب)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)]">
          <span dir="ltr" className="font-mono bidi-ltr">
            {video.channel}
          </span>
          <span aria-hidden="true">·</span>
          <span>{video.duration}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3
              dir="ltr"
              className="text-start font-mono text-xs font-semibold text-[var(--ink-primary)] sm:text-[13px] bidi-ltr"
            >
              {video.title}
            </h3>
            <p className="mt-1.5 text-xs leading-6 text-[var(--ink-secondary)]">
              <strong className="font-semibold text-[var(--ink-primary)]">
                چرا این ویدیو کمک می‌کند؟{' '}
              </strong>
              {video.whyWatch}
            </p>
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--ink-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            <span>باز کردن در یوتیوب</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-[var(--border-hairline)] bg-[var(--code-block-bg)]">
          {loaded ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={video.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="group flex aspect-video w-full flex-col items-center justify-center gap-3 px-4 text-center transition-colors hover:bg-white/[0.03] cursor-pointer"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-sm transition-transform group-hover:scale-105">
                <Play className="h-6 w-6 fill-current ms-0.5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-[var(--code-block-ink)]">
                  پخش مستقیم ویدیو داخل درسنامه
                </div>
                <div className="mt-1 text-xs text-[var(--code-block-muted)]">
                  بارگذاری تنبل (Lazy Embed) برای سرعت بالای صفحه — در صورت نیاز به فیلترشکن از لینک بالا استفاده کنید
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
