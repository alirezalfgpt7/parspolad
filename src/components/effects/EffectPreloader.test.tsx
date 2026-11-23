import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EffectPreloader } from './EffectPreloader.tsx';
import { useAppStore, type BootstrapPayload } from '../../store/useAppStore.ts';
import { DEFAULT_PRELOADER_SETTINGS, normalizePreloaderSettings } from '../../utils/brandingDefaults.ts';

let originalViewportWidth = 0;

describe('EffectPreloader', () => {
  beforeEach(() => {
    originalViewportWidth = window.innerWidth;
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalViewportWidth });
    useAppStore.setState({
      bootstrap: null,
      previewPreloader: null,
      cachedPreloader: null,
      previewLogos: null,
      language: 'fa',
    });
  });

  it('uses the saved language-specific text and responsive logo sizes', () => {
    useAppStore.setState({
      bootstrap: {
        preloader: {
          ...DEFAULT_PRELOADER_SETTINGS,
          internal: {
            ...DEFAULT_PRELOADER_SETTINGS.internal,
            text_fa: 'در حال دریافت اطلاعات',
            logo_size_mobile: 44,
          },
        },
      } as BootstrapPayload,
    });

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
    const { container } = render(<EffectPreloader label="در حال آماده‌سازی..." />);

    expect(screen.getByText('در حال دریافت اطلاعات')).toBeTruthy();
    expect(container.querySelector<HTMLElement>('.effect-preloader-logo-frame')?.style.width).toBe('44px');
  });

  it('omits a disabled loader mode', () => {
    useAppStore.setState({
      bootstrap: {
        preloader: {
          ...DEFAULT_PRELOADER_SETTINGS,
          internal: { ...DEFAULT_PRELOADER_SETTINGS.internal, enabled: false },
        },
      } as BootstrapPayload,
    });

    const { container } = render(<EffectPreloader label="در حال آماده‌سازی..." />);
    expect(container.firstChild).toBeNull();
  });

  it('renders only the background in background-only mode', () => {
    useAppStore.setState({
      bootstrap: {
        preloader: {
          ...DEFAULT_PRELOADER_SETTINGS,
          internal: {
            ...DEFAULT_PRELOADER_SETTINGS.internal,
            display_mode: 'background_only',
            show_background_media: false,
          },
        },
      } as BootstrapPayload,
    });

    const { container } = render(<EffectPreloader label="در حال آماده‌سازی..." />);

    expect(container.querySelector('.effect-loader-scene')).toBeNull();
    expect(screen.queryByText('در حال آماده‌سازی...')).toBeNull();
  });

  it('plays saved API media as a logo and limits background removal to the logo pixels', () => {
    const settings = normalizePreloaderSettings({
      initial: {
        logo_url: '/api/v1/media/57/preview#video',
        background_color: '#123456',
        transparent_background: true,
        show_spinner: false,
        show_text: false,
        show_dots: false,
        show_particles: false,
      },
    }).initial;
    const { container } = render(
      <EffectPreloader
        label="در حال بارگذاری..."
        mode="initial"
        fullScreen
        modeSettings={settings}
      />,
    );

    const video = container.querySelector('.effect-preloader-logo-frame video');
    expect(video?.getAttribute('src')).toBe('/api/v1/media/57/preview#video');
    expect(video?.getAttribute('style')).toContain('filter: url(');
    expect(screen.getByRole('status').style.backgroundColor).toBe('rgb(18, 52, 86)');
    expect(settings.remove_logo_background).toBe(true);
    expect(settings.transparent_background).toBeUndefined();
  });

  it('applies the active responsive logo and text sizes and updates on viewport resize', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    const settings = {
      ...DEFAULT_PRELOADER_SETTINGS.initial,
      show_spinner: false,
      text_fa: 'در حال بارگذاری',
      logo_size_mobile: 40,
      logo_size_tablet: 72,
      logo_size_desktop: 104,
      text_size_mobile: 12,
      text_size_tablet: 16,
      text_size_desktop: 20,
    };
    const { container } = render(
      <EffectPreloader label="در حال بارگذاری" mode="initial" modeSettings={settings} />,
    );
    const logoFrame = container.querySelector('.effect-preloader-logo-frame');
    const loader = screen.getByRole('status');

    expect(logoFrame?.getAttribute('style')).toContain('width: 104px');
    expect(loader.style.getPropertyValue('--preloader-active-text-size')).toBe('20px');

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(logoFrame?.getAttribute('style')).toContain('width: 72px');
      expect(loader.style.getPropertyValue('--preloader-active-text-size')).toBe('16px');
    });

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
    fireEvent(window, new Event('resize'));
    await waitFor(() => {
      expect(logoFrame?.getAttribute('style')).toContain('width: 40px');
      expect(loader.style.getPropertyValue('--preloader-active-text-size')).toBe('12px');
    });
  });
});
