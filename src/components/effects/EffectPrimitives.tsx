import React from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { EffectText } from './EffectText.tsx';
import { AnimatedHamburger } from './AnimatedHamburger.tsx';
import { GlassPanelEffect } from './GlassPanelEffect.tsx';
import { HueFilterMedia } from './HueFilterMedia.tsx';

export { AnimatedHamburger };

export const EffectNavLink: React.FC<LinkProps> = ({ className, children, ...props }) => (
  <Link
    {...props}
    className={cn(
      'effect-nav-link relative inline-flex items-center gap-1 py-1 text-sm font-medium transition-colors hover:text-(--theme-header-ink) whitespace-nowrap shrink-0',
      className
    )}
  >
    {children}
  </Link>
);

export const EffectGlassPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <GlassPanelEffect {...props} className={className} />;

export const EffectProfileCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div {...props} className={cn('group effect-profile-card', className)} />;

type EffectProfileAvatarProps = React.ComponentProps<typeof ZeroBrokenImage>;

export const EffectProfileAvatar: React.FC<EffectProfileAvatarProps> = ({ className, ...props }) => (
  <ZeroBrokenImage {...props} className={cn('effect-profile-avatar', className)} />
);

interface EffectErrorCodeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const EffectErrorCode: React.FC<EffectErrorCodeProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={cn('effect-404-number text-6xl font-extrabold tabular-nums', className)}>
    <EffectText>{children}</EffectText>
  </div>
);

interface EffectTabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

export const EffectTabButton: React.FC<EffectTabButtonProps> = ({
  selected,
  className,
  ...props
}) => (
  <button
    {...props}
    aria-pressed={selected}
    className={cn('effect-tab', className)}
  />
);

export const EffectTabPanel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div {...props} className={cn('effect-tab-panel', className)} />;

interface EffectMarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  animated?: boolean;
}

export const EffectMarquee: React.FC<EffectMarqueeProps> = ({
  animated = true,
  className,
  ...props
}) => (
  <div
    {...props}
    className={cn(animated ? 'effect-marquee' : 'flex justify-center', className)}
  />
);

type EffectImageProps = React.ComponentProps<typeof ZeroBrokenImage>;

export const EffectImage: React.FC<EffectImageProps> = ({ className, ...props }) => (
  <HueFilterMedia {...props} mode="grayscale-reveal" className={className} />
);
