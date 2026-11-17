import React from 'react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import './ProfileCardEffect.css';

interface ProfileCardEffectProps {
  name: string;
  role: string;
  subtitle?: string;
  imageUrl?: string;
  accentColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Effect 046: Profile Card
 * Reproduces image zoom, inset framing border on hover, and vertically stacked floating action icons.
 */
export const ProfileCardEffect: React.FC<ProfileCardEffectProps> = ({
  name,
  role,
  subtitle,
  imageUrl,
  accentColor = 'var(--theme-primary)',
  actions,
  className,
}) => (
  <article className={cn('effect-hero-profile-card group', className)} tabIndex={0}>
    {imageUrl ? (
      <ZeroBrokenImage
        src={imageUrl}
        alt={name}
        className="effect-hero-profile-bg"
      />
    ) : (
      <div
        className="effect-hero-profile-bg"
        style={{
          background: `radial-gradient(circle at 30% 25%, ${accentColor}, #0f172a 80%)`,
        }}
      />
    )}
    <div className="effect-hero-profile-scrim" aria-hidden="true" />
    <div className="effect-hero-profile-border">
      {actions && (
        <div className="effect-hero-profile-icons">
          {actions}
        </div>
      )}
      <div className="effect-hero-profile-meta">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs"
          style={{ backgroundColor: accentColor }}
        >
          {role}
        </span>
        <h3 className="mt-2 text-base font-extrabold text-white drop-shadow-xs">{name}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-200 drop-shadow-xs">{subtitle}</p>
        )}
      </div>
    </div>
  </article>
);
