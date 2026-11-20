import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const raw = error instanceof Error ? error.message : String(error);
    let friendly = 'در اجرای بخشی از برنامه خطای غیرمنتظره‌ای رخ داد.';
    try {
      const parsed = JSON.parse(raw) as { error?: string; operationType?: string };
      if (parsed && parsed.operationType) {
        if (parsed.error?.toLowerCase().includes('permission')) {
          friendly =
            'دسترسی لازم برای همگام‌سازی این بخش با سرور وجود ندارد. لطفاً دوباره وارد حساب گوگل شوید یا کد دعوت گروه را بررسی کنید.';
        } else {
          friendly =
            'ارتباط با پایگاه‌داده ابری با اختلال موقت مواجه شد. نگران نباشید، پیشرفت محلی شما محفوظ است.';
        }
      }
    } catch {
      // Non-JSON runtime error
    }
    return { hasError: true, message: friendly };
  }

  componentDidCatch(error: unknown) {
    console.error('Atlas ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] px-4 text-[var(--ink-primary)]"
        >
          <div className="w-full max-w-md rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--warn-bg)] text-[var(--warn-ink)]">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-[var(--ink-primary)]">
              توقف موقت در نمایش صفحه
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--ink-secondary)]">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>بارگذاری مجدد اطلس</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
