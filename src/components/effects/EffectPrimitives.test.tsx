import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { BrandLogo } from '../common/BrandLogo.tsx';
import {
  AnimatedTabsEffect,
  CardRevealStack,
  CssSlideshowEffect,
  DecorativeCube,
  EffectAction,
  EffectTabButton,
  Error404Effect,
  FlipAuthCardEffect,
  GlassPanelEffect,
  InfiniteBrandSlider,
  QuartetSpinnerEffect,
  RotatingText,
  ThemeModeToggle,
  WaveHeroEffect,
  Win11BootSpinnerEffect,
} from './index.ts';

describe('effect primitives & standalone effects', () => {
  it('lets the active theme choose the default action effect', () => {
    render(<EffectAction type="button">Theme action</EffectAction>);

    const button = screen.getByRole('button', { name: 'Theme action' });
    expect(button.classList.contains('theme-action-auto')).toBe(true);
    expect(button.classList.contains('effect-shimmer')).toBe(false);
    expect(button.getAttribute('data-effect-override')).toBeNull();
  });

  it('keeps one slideshow image active while cycling', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(
        <CssSlideshowEffect images={['first.jpg', 'second.jpg']} intervalPerSlideSeconds={1} />,
      );
      const slides = container.querySelectorAll('.effect-css-slide');

      expect(slides[0].getAttribute('data-active')).toBe('true');
      expect(slides[1].getAttribute('data-active')).toBe('false');

      act(() => vi.advanceTimersByTime(1000));

      expect(slides[0].getAttribute('data-active')).toBe('false');
      expect(slides[1].getAttribute('data-active')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('duplicates partner logos only when the strip can loop', () => {
    const { container } = render(
      <InfiniteBrandSlider
        items={[
          { id: 1, name: 'شرکت اول', logoUrl: '/first.png' },
          { id: 2, name: 'شرکت دوم', logoUrl: '/second.png' },
        ]}
      />,
    );

    const track = container.querySelector('.effect-brand-track[data-loop="true"]');
    expect(track).not.toBeNull();
    expect(track?.querySelectorAll('.effect-brand-group')).toHaveLength(2);
    expect(track?.querySelectorAll('.effect-brand-slide')).toHaveLength(4);
  });

  it('preserves the chosen action element and renders liquid/shimmer/glow layers', () => {
    render(
      <EffectAction as="a" href="/about" effects={['shimmer', 'liquid', 'glow']}>
        About
      </EffectAction>
    );

    const link = screen.getByRole('link', { name: 'About' });
    expect(link.getAttribute('href')).toBe('/about');
    expect(link.classList.contains('effect-shimmer')).toBe(true);
    expect(link.classList.contains('effect-liquid-button')).toBe(true);
    expect(link.classList.contains('effect-glow')).toBe(true);
  });

  it('exposes the selected state on an animated tab button', () => {
    render(<EffectTabButton selected>Selected tab</EffectTabButton>);

    const tab = screen.getByRole('button', { name: 'Selected tab' });
    expect(tab.getAttribute('aria-pressed')).toBe('true');
    expect(tab.classList.contains('effect-tab')).toBe(true);
  });

  it('renders AnimatedTabsEffect (022) and switches active tab', () => {
    const onChange = vi.fn();
    render(
      <AnimatedTabsEffect
        items={[
          { id: 'all', label: 'همه' },
          { id: 'wellhead', label: 'سرچاهی' },
        ]}
        activeId="all"
        onChange={onChange}
      />
    );

    const targetTab = screen.getByRole('tab', { name: 'سرچاهی' });
    fireEvent.click(targetTab);
    expect(onChange).toHaveBeenCalledWith('wellhead');
  });

  it('renders FlipAuthCardEffect (083) and updates flipped face accessibility state', () => {
    const { container, rerender } = render(
      <FlipAuthCardEffect flipped={false} front={<div>Front Login</div>} back={<div>Back Register</div>} />
    );

    expect(container.querySelector('[data-flipped="false"]')).not.toBeNull();
    expect(screen.getByText('Front Login').parentElement?.getAttribute('aria-hidden')).toBe('false');
    expect(screen.getByText('Back Register').parentElement?.getAttribute('aria-hidden')).toBe('true');

    rerender(<FlipAuthCardEffect flipped front={<div>Front Login</div>} back={<div>Back Register</div>} />);
    expect(container.querySelector('[data-flipped="true"]')).not.toBeNull();
    expect(screen.getByText('Back Register').parentElement?.getAttribute('aria-hidden')).toBe('false');
  });

  it('renders Error404Effect (021) cleanly without external GIF CDNs', () => {
    render(
      <MemoryRouter>
        <Error404Effect code={404} title="صفحه پیدا نشد" subtitle="مسیر وجود ندارد" ctaLabel="بازگشت به خانه" />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('صفحه پیدا نشد')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'بازگشت به خانه' }).getAttribute('href')).toBe('/');
  });

  it('renders CardRevealStack (004), WaveHeroEffect (002), DecorativeCube (028), RotatingText (063), GlassPanelEffect (035), ThemeModeToggle (032), and spinners (025/057)', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <div>
        <WaveHeroEffect />
        <DecorativeCube frontSymbol="P" />
        <ThemeModeToggle dark={false} onToggle={onToggle} label="حالت" />
        <GlassPanelEffect>Glass body</GlassPanelEffect>
        <RotatingText items={['تجهیزات سرچاهی']} showController />
        <CardRevealStack items={[{ id: 1, title: 'مرحله اول', description: 'توضیح آزمایشی' }]} />
        <QuartetSpinnerEffect />
        <Win11BootSpinnerEffect />
        <InfiniteBrandSlider items={[{ id: 1, name: 'شرکت نفت', logoUrl: '/storage/logos/logo-main.png' }]} />
        <BrandLogo overrideUrl="/storage/videos/logo-3d.mp4" alt="لوگوی متحرک" />
        <BrandLogo placement="about" alt="لوگوی صفحه درباره ما" />
      </div>
    );

    expect(screen.getByText('مرحله اول')).toBeTruthy();
    expect(screen.getByText('تجهیزات سرچاهی')).toBeTruthy();
    expect(screen.getByText('شرکت نفت')).toBeTruthy();
    expect(container.querySelector('.effect-waves-wrapper')).not.toBeNull();
    expect(container.querySelector('.effect-morph-cube')).not.toBeNull();
    expect(container.querySelector('.effect-spinner-quartet')).not.toBeNull();
    expect(container.querySelector('.effect-win11-spinner')).not.toBeNull();
    expect(container.querySelector('video[src="/storage/videos/logo-3d.mp4"]')).not.toBeNull();
    const aboutLogo = container.querySelector<HTMLVideoElement>(
      'video[src="/storage/videos/logo-3d.mp4"].scale-200',
    );
    expect(aboutLogo).not.toBeNull();
    expect(aboutLogo?.style.filter).toMatch(/^url\("#.+\"\)$/);

    fireEvent.click(screen.getByRole('switch', { name: 'حالت' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
