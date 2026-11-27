import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Slide } from '../../types/index.ts';
import { HeroSlider } from './HeroSlider.tsx';

const videoSlide: Slide = {
  id: 2,
  slider_id: 1,
  title_fa: 'اسلاید ویدیویی',
  title_en: 'Video slide',
  subtitle_fa: '',
  subtitle_en: '',
  cta_text_fa: '',
  cta_text_en: '',
  cta_link: '',
  media_type: 'video',
  desktop_media: '/storage/videos/desktop.mp4',
  mobile_media: '/storage/hero/mobile-poster.jpg',
  text_position: 'center',
  text_color: '#FFFFFF',
  button_color: '#B91C1C',
  overlay_gradient: '',
  duration_ms: 6000,
  effect: 'fade',
  text_animation: 'fade-up',
  particles_enabled: false,
  sort_order: 1,
  is_active: true,
};

describe('HeroSlider responsive media', () => {
  beforeEach(() => {
    useAppStore.setState({ language: 'fa' });
  });

  it('automatically plays the desktop video without using the mobile image', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    const { container } = render(
      <MemoryRouter>
        <HeroSlider slides={[videoSlide]} />
      </MemoryRouter>,
    );

    const video = container.querySelector('video');
    expect(video?.getAttribute('src')).toBe('/storage/videos/desktop.mp4');
    expect(video?.hasAttribute('autoplay')).toBe(true);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('button', { name: /پخش ویدئو/ })).toBeNull();
  });

  it('uses the mobile asset only at mobile viewport widths', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const { container } = render(
      <MemoryRouter>
        <HeroSlider slides={[videoSlide]} />
      </MemoryRouter>,
    );
    fireEvent.resize(window);

    await waitFor(() => {
      expect(container.querySelector('img')?.getAttribute('src')).toBe('/storage/hero/mobile-poster.jpg');
    });
    expect(screen.queryByRole('button', { name: /پخش ویدئو/ })).toBeNull();
    expect(container.querySelector('video')).toBeNull();
  });

  it('fills the viewport area below the measured sticky header', async () => {
    const header = document.createElement('div');
    header.className = 'public-header-shell';
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1440, 104));
    document.body.append(header);

    const { container } = render(
      <MemoryRouter>
        <HeroSlider slides={[videoSlide]} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(container.querySelector('section')?.getAttribute('style')).toBe('height: calc(100dvh - 104px);');
    });
    header.remove();
  });
});
