import React from 'react';
import { Eye } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import './SlidingProfileCardEffect.css';

interface SlidingProfileCardEffectProps {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
  viewLabel?: string;
  meta?: React.ReactNode;
  className?: string;
}

/**
 * Effect 066: Profile Card Animation
 * Bottom title strip slides downward on hover while spring `.card-body` rises to 100% height.
 */
export const SlidingProfileCardEffect: React.FC<SlidingProfileCardEffectProps> = ({
  name,
  role,
  bio,
  imageUrl,
  viewLabel = 'مشاهده جزئیات',
  meta,
  className,
}) => (
  <article className={cn('effect-sliding-profile-card', className)} tabIndex={0}>
    {imageUrl ? (
      <ZeroBrokenImage
        src={imageUrl}
        alt={name}
        className="effect-sliding-profile-photo"
      />
    ) : (
      <div
        className="effect-sliding-profile-photo"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 70%, #0f172a), #0f172a)',
        }}
      />
    )}

    <div className="effect-sliding-profile-viewbar">
      <span className="truncate font-bold">{name}</span>
      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] opacity-90">
        <Eye className="h-3.5 w-3.5" />
        {viewLabel}
      </span>
    </div>

    <div className="effect-sliding-profile-body">
      <div className="effect-sliding-profile-content">
        <h3 className="text-base font-extrabold text-white">{name}</h3>
        <div className="mt-1 text-xs font-bold text-amber-400">{role}</div>
        <p className="mt-3 text-xs leading-relaxed text-slate-300">{bio}</p>
        {meta && <div className="mt-4 border-t border-white/15 pt-3 text-[11px] text-slate-200">{meta}</div>}
      </div>
    </div>
  </article>
);
