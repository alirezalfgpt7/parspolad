import React from 'react';
import { cn } from '../../utils/i18n.ts';

export type EffectActionStyle = 'shimmer' | 'glow' | 'liquid';

interface EffectActionOwnProps {
  effects?: EffectActionStyle[];
  className?: string;
}

type EffectActionProps<T extends React.ElementType> = EffectActionOwnProps & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof EffectActionOwnProps | 'as'>;

const effectActionClasses: Record<EffectActionStyle, string> = {
  shimmer: 'effect-shimmer',
  glow: 'effect-glow',
  liquid: 'effect-liquid-button',
};

export function EffectAction<T extends React.ElementType = 'button'>({
  as,
  effects,
  className,
  ...props
}: EffectActionProps<T>) {
  const Component = as ?? 'button';
  return React.createElement(Component, {
    ...props,
    'data-effect-override': effects === undefined ? undefined : 'true',
    className: cn(
      'theme-action',
      effects === undefined ? 'theme-action-auto' : effects.map((effect) => effectActionClasses[effect]).join(' '),
      className
    ),
  });
}
