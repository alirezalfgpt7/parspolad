import React from 'react';
import { cn } from '../../utils/i18n.ts';
import './ButtonEffects.css';

export type EffectActionStyle = 'shimmer' | 'glow' | 'liquid';

interface EffectActionOwnProps {
  effects?: EffectActionStyle[];
  className?: string;
  children?: React.ReactNode;
}

type EffectActionProps<T extends React.ElementType> = EffectActionOwnProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof EffectActionOwnProps | 'as'>;

const effectActionClasses: Record<EffectActionStyle, string> = {
  shimmer: 'effect-shimmer',
  glow: 'effect-glow',
  liquid: 'effect-liquid-button',
};

/**
 * Combines Effects 003 (Button Shimmer), 029 (Liquid Button), and 076 (Glowing Shadows Button).
 * Preserves existing contract: when `effects` is omitted, delegates to `theme-action-auto`.
 */
export function EffectAction<T extends React.ElementType = 'button'>({
  as,
  effects,
  className,
  children,
  ...props
}: EffectActionProps<T>) {
  const Component = as ?? 'button';
  const hasGlow = effects?.includes('glow');
  const hasLiquid = effects?.includes('liquid');

  const content = (
    <>
      {hasGlow && <span className="effect-glow-halo" aria-hidden="true" />}
      {hasLiquid && <span className="effect-liquid-layer" aria-hidden="true" />}
      {children}
    </>
  );

  return React.createElement(
    Component,
    {
      ...props,
      'data-effect-override': effects === undefined ? undefined : 'true',
      className: cn(
        'theme-action',
        effects === undefined
          ? 'theme-action-auto'
          : effects.map((effect) => effectActionClasses[effect]).join(' '),
        className
      ),
    },
    content
  );
}
