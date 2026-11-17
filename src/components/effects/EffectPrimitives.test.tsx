import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EffectAction } from './EffectAction.tsx';
import { EffectTabButton } from './EffectPrimitives.tsx';

describe('effect primitives', () => {
  it('lets the active theme choose the default action effect', () => {
    render(<EffectAction type="button">Theme action</EffectAction>);

    const button = screen.getByRole('button', { name: 'Theme action' });
    expect(button.classList.contains('theme-action-auto')).toBe(true);
    expect(button.classList.contains('effect-shimmer')).toBe(false);
    expect(button.getAttribute('data-effect-override')).toBeNull();
  });

  it('preserves the chosen action element and applies requested effects', () => {
    render(
      <EffectAction as="a" href="/about" effects={['shimmer', 'liquid']}>
        About
      </EffectAction>
    );

    const link = screen.getByRole('link', { name: 'About' });
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.classList.contains('effect-shimmer')).toBe(true);
    expect(link.classList.contains('effect-liquid-button')).toBe(true);
    expect(link.classList.contains('effect-glow')).toBe(false);
  });

  it('exposes the selected state on an animated tab button', () => {
    render(<EffectTabButton selected>Selected tab</EffectTabButton>);

    const tab = screen.getByRole('button', { name: 'Selected tab' });
    expect(tab.getAttribute('aria-pressed')).toBe('true');
    expect(tab.classList.contains('effect-tab')).toBe(true);
  });
});
