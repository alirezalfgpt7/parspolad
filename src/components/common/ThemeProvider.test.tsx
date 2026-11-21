import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeAdminPage } from '../../pages/admin/ThemeAdminPage.tsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ThemePreset, ThemeSettings } from '../../types/index.ts';
import { DEFAULT_THEME_PALETTE } from '../../utils/brandingDefaults.ts';
import { ThemeProvider } from './ThemeProvider.tsx';

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

function makeThemeSettings(defaultMode: 'light' | 'dark' = 'light'): ThemeSettings {
  return {
    active_preset_slug: 'industrial-red',
    default_mode: defaultMode,
    design_style: 'modern',
    button_shape: 'rounded',
    button_effect: 'shimmer',
    active_palette: { ...DEFAULT_THEME_PALETTE },
    landing_theme_enabled: true,
    landing_design_style: 'modern',
    landing_button_shape: 'rounded',
    landing_button_effect: 'shimmer',
    landing_palette: { ...DEFAULT_THEME_PALETTE },
    admin_design_style: 'modern',
    admin_button_shape: 'rounded',
    admin_button_effect: 'shimmer',
    admin_palette: { ...DEFAULT_THEME_PALETTE },
  };
}

describe('ThemeProvider & Theme Studio behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-color-mode');
    document.documentElement.style.cssText = '';
    useAppStore.setState({
      loading: false,
      colorMode: 'light',
      bootstrap: null,
      previewTheme: null,
      previewScope: null,
      previewMode: null,
    });
    vi.clearAllMocks();
  });

  it('applies server default_mode "dark" on bootstrap when localStorage has no saved ppa_mode', async () => {
    mockedApiRequest.mockResolvedValueOnce({
      theme: makeThemeSettings('dark'),
      presets: [],
      menus: [],
      sliders: [],
      kpis: [],
      banners: [],
      categories: [],
      partners: [],
      services: [],
      pages: [],
      company: {} as never,
      map: {} as never,
      seo: {} as never,
      site: {} as never,
      is_authenticated: false,
    });

    await act(async () => {
      await useAppStore.getState().fetchBootstrap();
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <div>Themed Content</div>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(useAppStore.getState().colorMode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.colorMode).toBe('dark');
    expect(document.documentElement.style.getPropertyValue('--theme-bg')).not.toBe('');
  });

  it('toggles colorMode cleanly between dark and light even when previewMode was active', () => {
    useAppStore.setState({
      colorMode: 'light',
      previewTheme: makeThemeSettings('light'),
      previewMode: 'dark',
    });

    render(
      <MemoryRouter initialEntries={['/admin/themes']}>
        <ThemeProvider>
          <div>Admin Preview</div>
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      useAppStore.getState().toggleColorMode();
    });

    expect(useAppStore.getState().colorMode).toBe('light');
    expect(useAppStore.getState().previewMode).toBeNull();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.colorMode).toBe('light');

    act(() => {
      useAppStore.getState().toggleColorMode();
    });

    expect(useAppStore.getState().colorMode).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.colorMode).toBe('dark');
  });

  it('renders rectangular Theme Studio preset previews without circular wrapper classes', async () => {
    const presets: ThemePreset[] = [
      {
        id: 1,
        slug: 'industrial-red',
        name_fa: 'قرمز صنعتی',
        name_en: 'Industrial Red',
        is_default: true,
        design_style: 'modern',
        button_shape: 'rounded',
        button_effect: 'shimmer',
        palette: { ...DEFAULT_THEME_PALETTE },
      },
      {
        id: 2,
        slug: 'navy-amber',
        name_fa: 'سرمه‌ای و کهربایی',
        name_en: 'Navy & Amber',
        is_default: false,
        design_style: 'industrial',
        button_shape: 'square',
        button_effect: 'plain',
        palette: {
          ...DEFAULT_THEME_PALETTE,
          primary: '#0F4C81',
          accent: '#F59E0B',
          buttonBg: '#0F4C81',
        },
      },
    ];

    mockedApiRequest.mockResolvedValueOnce({
      settings: makeThemeSettings('light'),
      presets,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/admin/themes']}>
        <ThemeProvider>
          <ThemeAdminPage />
        </ThemeProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('قرمز صنعتی')).toBeTruthy();
    });

    const presetCards = container.querySelectorAll('.theme-preset-card');
    expect(presetCards).toHaveLength(2);

    presetCards.forEach((card) => {
      expect(card.className).not.toContain('rounded-full');
      const preview = card.querySelector('.theme-preset-preview');
      const miniHeader = card.querySelector('.theme-preset-mini-header');
      const miniCard = card.querySelector('.theme-preset-mini-card');
      const iconBadge = card.querySelector('.theme-preset-icon');

      expect(preview).not.toBeNull();
      expect(miniHeader).not.toBeNull();
      expect(miniCard).not.toBeNull();
      expect(iconBadge).not.toBeNull();
      expect(preview?.className).not.toContain('rounded-full');
      expect(iconBadge?.className).not.toContain('rounded-full');
    });

    fireEvent.click(presetCards[1]);
    expect(useAppStore.getState().previewTheme?.admin_palette.primary).toBe('#0F4C81');
  });
});
