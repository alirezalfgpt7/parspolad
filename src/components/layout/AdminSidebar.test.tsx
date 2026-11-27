import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar.tsx';

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: (selector: (state: { bootstrap: null }) => unknown) => selector({ bootstrap: null }),
}));

vi.mock('../common/BrandLogo.tsx', () => ({
  BrandLogo: () => <span aria-hidden="true" />,
}));

vi.mock('../ui/ZeroBrokenImage.tsx', () => ({
  ZeroBrokenImage: () => <img alt="" />,
}));

const renderSidebar = (language: 'fa' | 'en' = 'fa') => render(
  <MemoryRouter initialEntries={['/admin/projects']}>
    <AdminSidebar
      user={null}
      language={language}
      mini={false}
      mobileOpen={false}
      onToggleMini={vi.fn()}
      onCloseMobile={vi.fn()}
    />
  </MemoryRouter>,
);

describe('AdminSidebar', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('restores collapsed navigation groups after remounting', () => {
    const groupLabel = 'محتوا و دارایی‌های سازمان';
    const firstRender = renderSidebar();
    const groupToggle = screen.getByRole('button', { name: new RegExp(groupLabel) });

    fireEvent.click(groupToggle);
    expect(groupToggle.getAttribute('aria-expanded')).toBe('false');
    firstRender.unmount();

    renderSidebar();
    expect(screen.getByRole('button', { name: new RegExp(groupLabel) }).getAttribute('aria-expanded')).toBe('false');
  });

  it('exposes dedicated products and articles management routes', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /مدیریت محصولات/ }).getAttribute('href')).toBe('/admin/products');
    expect(screen.getByRole('link', { name: /اخبار و مقالات/ }).getAttribute('href')).toBe('/admin/articles');
  });

  it('links the profile card to the profile page and sets sidebar direction from the language', () => {
    renderSidebar('en');
    expect(screen.getByRole('link', { name: 'User profile' }).getAttribute('href')).toBe('/admin/profile');
    expect(screen.getByRole('complementary').getAttribute('dir')).toBe('ltr');
  });
});
