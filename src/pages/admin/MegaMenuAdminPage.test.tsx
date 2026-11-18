import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MegaMenuAdminPage } from './MegaMenuAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  fetchBootstrap: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn(() => Promise.resolve({
    data: [{
      id: 1,
      key: 'header',
      title_fa: 'منوی سربرگ',
      items: [{
        id: 10,
        menu_id: 1,
        parent_id: null,
        title_fa: 'صفحه اصلی',
        title_en: 'Home',
        url: '/',
        sort_order: 1,
        is_active: true,
        children: [],
      }],
    }],
  })),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => mocks,
}));

describe('MegaMenuAdminPage', () => {
  it('starts menu items collapsed and expands them from the colored header', async () => {
    render(<MegaMenuAdminPage />);

    const expandButton = await screen.findByRole('button', { name: 'بازکردن صفحه اصلی' });
    expect(expandButton.getAttribute('aria-expanded')).toBe('false');
    const titleField = screen.getByPlaceholderText('عنوان فارسی');
    expect(titleField.closest('[hidden]')).not.toBeNull();

    fireEvent.click(expandButton);

    const collapseButton = screen.getByRole('button', { name: 'بستن صفحه اصلی' });
    expect(collapseButton.getAttribute('aria-expanded')).toBe('true');
    expect(titleField.closest('[hidden]')).toBeNull();
  });
});
