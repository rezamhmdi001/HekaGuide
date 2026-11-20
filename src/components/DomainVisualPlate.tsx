import React, { useState } from 'react';
import { DOMAIN_VISUALS } from '../data/chapterMedia';
import type { DomainId } from '../types/atlas';

interface DomainVisualPlateProps {
  domainId: DomainId;
  compact?: boolean;
  showCaption?: boolean;
}

const ArchitecturalSvgFallback: React.FC<{ domainId: DomainId; alt: string }> = ({
  domainId,
  alt,
}) => {
  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label={alt}
      className="h-full w-full object-cover"
    >
      <defs>
        <pattern id={`grid-${domainId}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M 24 0 L 0 0 0 24"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.09"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="640" height="360" fill="var(--bg-subtle)" />
      <rect width="640" height="360" fill={`url(#grid-${domainId})`} className="text-[var(--ink-primary)]" />

      {/* Isometric architectural plate tailored to DevOps / Containers / Git DAG (D04) or graceful fallback */}
      <g transform="translate(320 185)" stroke="var(--accent)" strokeWidth="1.8" fill="none">
        {/* Base Linux Kernel slab */}
        <polygon
          points="0,48 180,-36 0,-120 -180,-36"
          fill="var(--bg-surface)"
          fillOpacity="0.95"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <polygon
          points="-180,-36 0,48 0,68 -180,-16"
          fill="var(--accent)"
          fillOpacity="0.14"
          stroke="var(--accent-border)"
          strokeWidth="1.2"
        />
        <polygon
          points="180,-36 0,48 0,68 180,-16"
          fill="var(--accent)"
          fillOpacity="0.22"
          stroke="var(--accent-border)"
          strokeWidth="1.2"
        />

        {/* Container Block 1 */}
        <g transform="translate(-72 -58)">
          <polygon points="0,-34 54,-8 0,18 -54,-8" fill="var(--accent)" fillOpacity="0.18" />
          <polygon points="-54,-8 0,18 0,52 -54,26" fill="var(--bg-surface)" fillOpacity="0.92" />
          <polygon points="54,-8 0,18 0,52 54,26" fill="var(--accent)" fillOpacity="0.10" />
        </g>

        {/* Container Block 2 (Center Elevated) */}
        <g transform="translate(8 -88)">
          <polygon points="0,-36 58,-8 0,20 -58,-8" fill="var(--accent)" fillOpacity="0.28" />
          <polygon points="-58,-8 0,20 0,58 -58,30" fill="var(--bg-surface)" fillOpacity="0.95" />
          <polygon points="58,-8 0,20 0,58 58,30" fill="var(--accent)" fillOpacity="0.16" />
        </g>

        {/* Container Block 3 */}
        <g transform="translate(84 -42)">
          <polygon points="0,-30 48,-6 0,18 -48,-6" fill="var(--accent)" fillOpacity="0.20" />
          <polygon points="-48,-6 0,18 0,48 -48,24" fill="var(--bg-surface)" fillOpacity="0.92" />
          <polygon points="48,-6 0,18 0,48 48,24" fill="var(--accent)" fillOpacity="0.12" />
        </g>

        {/* Git DAG & CI/CD telemetry arcs */}
        <path
          d="M -140 82 C -80 82, -55 112, 0 112 C 55 112, 85 82, 145 82"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <circle cx="-140" cy="82" r="5" fill="var(--accent)" />
        <circle cx="-48" cy="100" r="5" fill="var(--bg-surface)" />
        <circle cx="0" cy="112" r="6" fill="var(--accent)" />
        <circle cx="62" cy="96" r="5" fill="var(--bg-surface)" />
        <circle cx="145" cy="82" r="5" fill="var(--accent)" />
      </g>

      <text
        x="24"
        y="34"
        className="fill-[var(--accent)] font-mono text-[13px] font-semibold"
      >
        {domainId} // ARCHITECTURAL PLATE
      </text>
      <text
        x="24"
        y="338"
        className="fill-[var(--ink-muted)] font-mono text-[11px]"
      >
        {domainId === 'D04'
          ? 'LINUX KERNEL · NAMESPACES · GIT DAG · ZERO-DOWNTIME CI/CD'
          : 'THE MODERN ENGINEERING ATLAS · SYSTEMS BLUEPRINT'}
      </text>
    </svg>
  );
};

export const DomainVisualPlate: React.FC<DomainVisualPlateProps> = ({
  domainId,
  compact = false,
  showCaption = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const visual = DOMAIN_VISUALS[domainId];

  const hasImage = Boolean(visual.imageUrl) && !imgFailed;

  return (
    <figure
      className={`overflow-hidden rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] ${
        compact ? '' : 'my-6'
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-[var(--bg-subtle)] ${
          compact ? 'aspect-[16/9]' : 'aspect-[16/9]'
        }`}
      >
        {hasImage ? (
          <img
            src={visual.imageUrl}
            alt={visual.alt}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <ArchitecturalSvgFallback domainId={domainId} alt={visual.alt} />
        )}
      </div>
      {showCaption && (
        <figcaption className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-xs leading-5 text-[var(--ink-muted)]">
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
};
