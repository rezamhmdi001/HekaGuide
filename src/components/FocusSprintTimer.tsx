import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { toPersianDigits } from '../utils/atlasLogic';

interface FocusSprintTimerProps {
  onCompleteSprint: (minutes: number) => void;
}

const PRESETS = [
  { minutes: 5, label: '۵ دقیقه (شروع سریع)' },
  { minutes: 15, label: '۱۵ دقیقه (اسپرینت)' },
  { minutes: 25, label: '۲۵ دقیقه (عمیق)' },
];

export const FocusSprintTimer: React.FC<FocusSprintTimerProps> = ({
  onCompleteSprint,
}) => {
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setRunning(false);
          onCompleteSprint(durationMinutes);
          return durationMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, durationMinutes, onCompleteSprint]);

  const handleSelectDuration = (mins: number) => {
    setRunning(false);
    setDurationMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const totalSeconds = durationMinutes * 60;
  const elapsedPercent = Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100);

  return (
    <div className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-xs font-semibold text-[var(--ink-primary)]">
            اسپرینت تمرکز (ویژه ADHD)
          </span>
          <span
            dir="ltr"
            className="rounded border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-primary)] tabular-nums bidi-ltr"
          >
            {formatted}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => {
            const active = durationMinutes === preset.minutes;
            return (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => handleSelectDuration(preset.minutes)}
                className={`min-h-[34px] rounded-md border px-2.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  active
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                }`}
              >
                {toPersianDigits(preset.minutes)} دقیقه
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'توقف تایمر تمرکز' : 'شروع تایمر تمرکز'}
            className="inline-flex min-h-[34px] items-center gap-1 rounded-md bg-[var(--accent)] px-3 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{running ? 'توقف' : 'شروع'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemainingSeconds(durationMinutes * 60);
            }}
            aria-label="بازنشانی تایمر"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Hairline Sprint Progress */}
      <div
        aria-hidden="true"
        className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
      >
        <div
          className="h-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${elapsedPercent}%` }}
        />
      </div>
    </div>
  );
};
