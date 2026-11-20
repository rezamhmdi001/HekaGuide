import React, { useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Minus, Moon, Plus, Sun, Type } from 'lucide-react';
import type { ReaderTheme } from '../types/atlas';
import { toPersianDigits } from '../utils/atlasLogic';

interface ReaderSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ReaderTheme;
  onChangeTheme: (theme: ReaderTheme) => void;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  showFocusToggle?: boolean;
}

const THEME_OPTIONS: { id: ReaderTheme; label: string; swatch: string }[] = [
  { id: 'paper', label: 'کاغذی روشن', swatch: '#FAF9F6' },
  { id: 'sepia', label: 'سپیا', swatch: '#F5EFE4' },
  { id: 'dark', label: 'شب آرام', swatch: '#111214' },
];

export const ReaderSettingsPopover: React.FC<ReaderSettingsPopoverProps> = ({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  fontScale,
  onChangeFontScale,
  focusMode,
  onToggleFocusMode,
  showFocusToggle = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handlePointer);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const adjustScale = (delta: number) => {
    const next = Math.min(1.24, Math.max(0.88, Number((fontScale + delta).toFixed(2))));
    onChangeFontScale(next);
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="تنظیمات مطالعه"
      className="absolute end-0 top-full z-40 mt-2 w-72 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 shadow-lg"
    >
      <div className="mb-3 text-xs font-semibold text-[var(--ink-muted)]">
        تم مطالعه
      </div>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChangeTheme(opt.id)}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-1.5 rounded-md border px-2 py-2 text-[11px] font-medium transition-colors cursor-pointer ${
              theme === opt.id
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-secondary)] hover:border-[var(--border-strong)]'
            }`}
          >
            <span
              className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border-strong)]"
              style={{ backgroundColor: opt.swatch }}
            >
              {opt.id === 'dark' ? (
                <Moon className="h-2.5 w-2.5 text-zinc-200" />
              ) : (
                <Sun className="h-2.5 w-2.5 text-zinc-700" />
              )}
            </span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-hairline)] pt-3.5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ink-secondary)]">
          <Type className="h-3.5 w-3.5" />
          <span>اندازه متن</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustScale(-0.06)}
            disabled={fontScale <= 0.88}
            aria-label="کوچک کردن متن"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-mono text-[var(--ink-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-11 text-center text-xs font-medium text-[var(--ink-primary)] tabular-nums">
            {toPersianDigits(Math.round(fontScale * 100))}٪
          </span>
          <button
            type="button"
            onClick={() => adjustScale(0.06)}
            disabled={fontScale >= 1.24}
            aria-label="بزرگ کردن متن"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-mono text-[var(--ink-primary)] hover:border-[var(--border-strong)] disabled:opacity-40 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showFocusToggle && (
        <div className="mt-3.5 border-t border-[var(--border-hairline)] pt-3.5">
          <button
            type="button"
            onClick={() => {
              onToggleFocusMode();
              onClose();
            }}
            className={`flex min-h-[44px] w-full items-center justify-between rounded-md border px-3 text-xs font-medium transition-colors cursor-pointer ${
              focusMode
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--ink-primary)] hover:border-[var(--border-strong)]'
            }`}
          >
            <span className="flex items-center gap-2">
              {focusMode ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span>حالت تمرکز مطالعه (Focus Mode)</span>
            </span>
            <span>{focusMode ? 'فعال' : 'خاموش'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
