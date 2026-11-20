import React from 'react';
import { ArrowDown, ArrowLeft, RefreshCw } from 'lucide-react';
import type { VisualDiagram } from '../types/atlas';
import { BidiText } from './BidiText';

interface DiagramViewProps {
  diagram: VisualDiagram;
  onOpenGlossaryTerm?: (term: string) => void;
}

export const DiagramView: React.FC<DiagramViewProps> = ({
  diagram,
  onOpenGlossaryTerm,
}) => {
  const { kind, caption, nodes } = diagram;

  return (
    <figure className="my-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-2.5">
        <figcaption className="text-xs font-medium text-[var(--ink-secondary)]">
          <BidiText text={caption} onOpenGlossaryTerm={onOpenGlossaryTerm} />
        </figcaption>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)] bidi-ltr shrink-0">
          {kind === 'flow' && 'FLOW'}
          {kind === 'layers' && 'STACK'}
          {kind === 'split' && 'COMPARE'}
          {kind === 'cycle' && 'CYCLE'}
        </span>
      </div>

      {kind === 'layers' && (
        <div className="flex flex-col gap-2">
          {nodes.map((node, i) => (
            <div
              key={i}
              className={`rounded-md border px-3.5 py-2.5 transition-colors ${
                node.accent
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--ink-primary)]">
                  <BidiText text={node.label} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </div>
                <span className="font-mono text-[11px] text-[var(--ink-muted)] tabular-nums shrink-0 bidi-ltr">
                  L{i + 1}
                </span>
              </div>
              {node.sublabel && (
                <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  <BidiText text={node.sublabel} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {kind === 'split' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {nodes.map((node, i) => (
            <div
              key={i}
              className={`rounded-md border p-3.5 ${
                node.accent
                  ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
              }`}
            >
              <div className="text-sm font-semibold text-[var(--ink-primary)]">
                <BidiText text={node.label} onOpenGlossaryTerm={onOpenGlossaryTerm} />
              </div>
              {node.sublabel && (
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
                  <BidiText text={node.sublabel} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {kind === 'flow' && (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <div
                className={`flex-1 rounded-md border p-3.5 ${
                  node.accent
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
                }`}
              >
                <div className="text-sm font-semibold text-[var(--ink-primary)]">
                  <BidiText text={node.label} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                </div>
                {node.sublabel && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    <BidiText text={node.sublabel} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                  </p>
                )}
              </div>
              {i < nodes.length - 1 && (
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center text-[var(--ink-muted)] py-0.5 md:px-0.5"
                >
                  <ArrowDown className="h-4 w-4 md:hidden" />
                  <ArrowLeft className="hidden h-4 w-4 md:block" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {kind === 'cycle' && (
        <div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {nodes.map((node, i) => (
              <div
                key={i}
                className={`rounded-md border p-3.5 ${
                  node.accent
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[var(--ink-primary)]">
                    <BidiText text={node.label} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--ink-muted)] tabular-nums bidi-ltr">
                    0{i + 1}
                  </span>
                </div>
                {node.sublabel && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--ink-secondary)]">
                    <BidiText text={node.sublabel} onOpenGlossaryTerm={onOpenGlossaryTerm} />
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--ink-muted)]">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>چرخه بازخورد مستمر میان مراحل بالا</span>
          </div>
        </div>
      )}
    </figure>
  );
};
