import React from 'react';
import { GLOSSARY } from '../data/glossary';

const GLOSSARY_LOOKUP = new Map<string, string>();
for (const entry of GLOSSARY) {
  GLOSSARY_LOOKUP.set(entry.term.toLowerCase(), entry.term);
}

interface BidiTextProps {
  text: string;
  onOpenGlossaryTerm?: (term: string) => void;
  className?: string;
}

/**
 * Renders Persian prose while strictly isolating backtick-wrapped English/CLI/code tokens
 * in dir="ltr" unicode-bidi: isolate spans and supporting **bold** emphasis.
 */
export const BidiText: React.FC<BidiTextProps> = ({
  text,
  onOpenGlossaryTerm,
  className,
}) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*[^*\s]\*)/g);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (!part) return null;

        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          const inner = part.slice(1, -1);
          const matchedTerm = GLOSSARY_LOOKUP.get(inner.trim().toLowerCase());

          if (matchedTerm && onOpenGlossaryTerm) {
            return (
              <button
                key={idx}
                type="button"
                dir="ltr"
                onClick={() => onOpenGlossaryTerm(matchedTerm)}
                title="مشاهده در واژه‌نامه"
                className="bidi-code cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors underline decoration-dotted underline-offset-4"
              >
                {inner}
              </button>
            );
          }

          return (
            <code key={idx} dir="ltr" className="bidi-code">
              {inner}
            </code>
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const inner = part.slice(2, -2);
          return (
            <strong key={idx} className="font-semibold text-[var(--ink-primary)]">
              <BidiText text={inner} onOpenGlossaryTerm={onOpenGlossaryTerm} />
            </strong>
          );
        }

        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          const inner = part.slice(1, -1);
          return (
            <em key={idx} className="not-italic font-medium text-[var(--ink-primary)]">
              <BidiText text={inner} onOpenGlossaryTerm={onOpenGlossaryTerm} />
            </em>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
};
