import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '../../store/useAppStore.ts';
import { DEFAULT_PRELOADER_SETTINGS } from '../../utils/brandingDefaults.ts';
import { LoginAppearanceAdminPage } from './LoginAppearanceAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  addToast: vi.fn(),
  fetchBootstrap: vi.fn().mockResolvedValue(undefined),
  setPreviewBranding: vi.fn(),
}));

vi.mock('../../services/api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api.ts')>();
  return { ...actual, apiRequest: mocks.apiRequest };
});

describe('LoginAppearanceAdminPage', () => {
  beforeEach(() => {
    mocks.apiRequest.mockImplementation((path: string, options?: RequestInit) => (
      path === '/admin/settings' && options?.method !== 'PUT'
        ? Promise.resolve({
            data: {
              company: { logo_url: '/storage/logos/logo-main.png', logo_small_url: '/storage/logos/logo-small.png' },
              seo: { meta_image: '/storage/logos/logo-main.png' },
              login: {},
              appearance: {},
              logos: {},
              pages_config: {},
              preloader: DEFAULT_PRELOADER_SETTINGS,
            },
          })
        : Promise.resolve({})
    ));
    useAppStore.setState({
      addToast: mocks.addToast,
      fetchBootstrap: mocks.fetchBootstrap,
      setPreviewBranding: mocks.setPreviewBranding,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('saves only the active preloader tab', async () => {
    render(<LoginAppearanceAdminPage />);

    fireEvent.click(await screen.findByRole('tab', { name: 'تنظیمات پریلودر' }));
    fireEvent.click(screen.getByRole('button', { name: /ذخیره و انتشار «تنظیمات پریلودر»/ }));

    await waitFor(() => {
      expect(mocks.apiRequest).toHaveBeenLastCalledWith('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ preloader: DEFAULT_PRELOADER_SETTINGS }),
      });
    });
  });

  it('shows one system page at a time in a selector', async () => {
    render(<LoginAppearanceAdminPage />);

    fireEvent.click(await screen.findByRole('tab', { name: 'صفحات سیستمی' }));
    const pageSelector = screen.getByRole('combobox', { name: 'انتخاب صفحه سیستمی' });
    expect(screen.getByLabelText('برچسب محصولات (فارسی)')).toBeTruthy();

    fireEvent.change(pageSelector, { target: { value: 'error_404' } });

    expect(screen.getByLabelText('تیتر (فارسی)')).toBeTruthy();
    expect(screen.queryByLabelText('برچسب محصولات (فارسی)')).toBeNull();
  });

  it('places the live preloader preview after its controls and exposes the larger logo range', async () => {
    render(<LoginAppearanceAdminPage />);

    fireEvent.click(await screen.findByRole('tab', { name: 'تنظیمات پریلودر' }));
    const desktopLogoSlider = screen.getByRole('slider', { name: 'اندازه لوگو در دسکتاپ' });
    const previewHeading = screen.getByRole('heading', { name: 'پیش‌نمایش زنده · لود اولیه' });
    const controlsSection = desktopLogoSlider.closest('section');
    const previewSection = previewHeading.closest('section');

    expect(desktopLogoSlider.getAttribute('max')).toBe('256');
    expect(screen.getByText('15 px')).toBeTruthy();
    expect(controlsSection?.parentElement?.lastElementChild).toBe(previewSection);
  });
});
