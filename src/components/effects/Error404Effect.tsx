import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/i18n.ts';
import { EffectText } from './EffectText.tsx';
import { EffectAction } from './EffectAction.tsx';
import './Error404Effect.css';

interface Error404EffectProps {
  code: number | string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaTo?: string;
  logoElement?: React.ReactNode;
  className?: string;
}

/**
 * Effect 021: Simple 404 Error Page
 * Faithfully reproduces the iconic elevated stacked typography, animated illustration focal canvas,
 * and overlapping lower copy box using 100% self-contained inline SVG + CSS animation.
 */
export const Error404Effect: React.FC<Error404EffectProps> = ({
  code,
  title,
  subtitle,
  ctaLabel,
  ctaTo = '/',
  logoElement,
  className,
}) => (
  <section className={cn('effect-404-stage', className)}>
    <div className="effect-404-bg-scene">
      {logoElement && (
        <div className="mb-3 flex justify-center">
          {logoElement}
        </div>
      )}
      <h1 className="effect-404-code-heading tabular-nums">
        <EffectText>{code}</EffectText>
      </h1>

      <svg
        viewBox="0 0 380 240"
        className="effect-404-svg-scene"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="errGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="190" cy="110" r="95" fill="url(#errGlow)" />
        {/* Ground horizon */}
        <ellipse cx="190" cy="206" rx="145" ry="12" fill="currentColor" className="text-slate-200 dark:text-slate-800" />
        {/* Oil derrick silhouette */}
        <g className="text-slate-300 dark:text-slate-700" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M98 202 L114 96 L124 96 L140 202" />
          <path d="M104 170 L134 170 M108 142 L130 142 M112 118 L126 118" />
          <line x1="119" y1="84" x2="119" y2="96" />
        </g>

        {/* Animated Surveyor / Route Disconnect Graphic */}
        <g className="effect-404-float">
          {/* Broken pipeline */}
          <path
            d="M150 182 H205 M232 182 H290"
            stroke="var(--theme-primary)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="205" cy="182" r="5" fill="#F59E0B" />
          <circle cx="232" cy="182" r="5" fill="#F59E0B" />
          {/* Beacon / Compass */}
          <circle cx="190" cy="104" r="34" fill="none" stroke="var(--theme-primary)" strokeOpacity="0.28" strokeWidth="2" strokeDasharray="5 5" />
          <g className="effect-404-radar">
            <line x1="190" y1="104" x2="190" y2="72" stroke="var(--theme-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="190" cy="72" r="4" fill="#F59E0B" />
          </g>
          <circle cx="190" cy="104" r="9" fill="var(--theme-surface)" stroke="var(--theme-primary)" strokeWidth="3" />
          {/* Signal arcs */}
          <path d="M250 100 Q268 118 250 136" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          <path d="M262 92 Q286 118 262 144" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        </g>
      </svg>
    </div>

    <div className="effect-404-content-box">
      <h2 className="text-xl font-extrabold text-(--theme-text)">{title}</h2>
      {subtitle && (
        <p className="mt-2.5 text-sm leading-relaxed text-(--theme-text-muted)">
          {subtitle}
        </p>
      )}
      <div className="mt-6 flex justify-center">
        <EffectAction
          as={Link}
          to={ctaTo}
          effects={['shimmer', 'glow']}
          className="inline-flex items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-6 py-2.5 text-sm font-bold text-(--theme-btn-text) shadow-md transition hover:bg-(--theme-btn-hover)"
        >
          <span>{ctaLabel}</span>
        </EffectAction>
      </div>
    </div>
  </section>
);
