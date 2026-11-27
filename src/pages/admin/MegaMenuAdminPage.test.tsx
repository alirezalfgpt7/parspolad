import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MegaMenuAdminPage } from './MegaMenuAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  fetchBootstrap: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: mocks.apiRequest,
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => mocks,
}));

describe('MegaMenuAdminPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mocks.apiRequest.mockClear();
    mocks.apiRequest.mockImplementation((path: string) => Promise.resolve(path === '/admin/menus'
      ? {
          data: [{
            id: 1,
            key: 'header',
            title_fa: 'منوی سربرگ',
            items: [
              {
                id: 10,
                menu_id: 1,
                parent_id: null,
                title_fa: 'صفحه اصلی',
                title_en: 'Home',
                url: '/',
                sort_order: 1,
                is_active: true,
                children: [],
              },
              {
                id: 11,
                menu_id: 1,
                parent_id: null,
                title_fa: 'محصولات',
                title_en: 'Products',
                url: '/products',
                sort_order: 2,
                is_active: true,
                children: [
                  {
                    id: 12,
                    menu_id: 1,
                    parent_id: 11,
                    title_fa: 'محصول الف',
                    title_en: 'Product A',
                    url: '/products/a',
                    sort_order: 1,
                    is_active: true,
                  },
                  {
                    id: 13,
                    menu_id: 1,
                    parent_id: 11,
                    title_fa: 'محصول ب',
                    title_en: 'Product B',
                    url: '/products/b',
                    sort_order: 2,
                    is_active: true,
                  },
                ],
              },
            ],
          }],
        }
      : { data: {} }));
  });

  it('starts menu items collapsed and expands them from the colored header', async () => {
    render(<MegaMenuAdminPage />);

    const expandButton = await screen.findByRole('button', { name: 'بازکردن صفحه اصلی' });
    expect(expandButton.getAttribute('aria-expanded')).toBe('false');
    const titleField = screen.getAllByPlaceholderText('عنوان فارسی')[0];
    expect(titleField.closest('[hidden]')).not.toBeNull();

    fireEvent.click(expandButton);

    const collapseButton = screen.getByRole('button', { name: 'بستن صفحه اصلی' });
    expect(collapseButton.getAttribute('aria-expanded')).toBe('true');
    expect(titleField.closest('[hidden]')).toBeNull();
  });

  it('reorders root menu items with drag and saves their new sort order', async () => {
    render(<MegaMenuAdminPage />);

    const source = await screen.findByRole('button', { name: 'جابجایی آیتم اصلی صفحه اصلی' });
    const target = screen.getByRole('button', { name: 'جابجایی آیتم اصلی محصولات' });
    const dataTransfer = { effectAllowed: '', setData: vi.fn() };
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    fireEvent.click(screen.getByRole('button', { name: 'ذخیره منو' }));

    await waitFor(() => {
      const saveCall = mocks.apiRequest.mock.calls.find(([path]) => path === '/admin/menus/1');
      expect(saveCall).toBeDefined();
      const options = saveCall?.[1] as RequestInit;
      const items = JSON.parse(String(options.body)).items as Array<{ title_fa: string; sort_order: number }>;
      expect(items.map((item) => [item.title_fa, item.sort_order]))
        .toEqual([['محصولات', 1], ['صفحه اصلی', 2]]);
    });
  });

  it('offers product and equipment icons in the icon selector', async () => {
    render(<MegaMenuAdminPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'بازکردن صفحه اصلی' }));

    const iconPicker = screen.getByRole('combobox', { name: 'آیکن صفحه اصلی' });
    expect(within(iconPicker).getByRole('option', { name: 'محصولات و تجهیزات' })).toBeTruthy();
    expect(within(iconPicker).getByRole('option', { name: 'زنجیره محصولات و تجهیزات' })).toBeTruthy();
  });

  it('reorders submenu items by dragging within their parent menu item', async () => {
    render(<MegaMenuAdminPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'بازکردن محصولات' }));

    const source = screen.getByRole('button', { name: 'جابجایی زیرمنوی محصول الف' });
    const target = screen.getByRole('button', { name: 'جابجایی زیرمنوی محصول ب' });
    const dataTransfer = { effectAllowed: '', setData: vi.fn() };
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    fireEvent.click(screen.getByRole('button', { name: 'ذخیره منو' }));

    await waitFor(() => {
      const saveCall = mocks.apiRequest.mock.calls.find(([path]) => path === '/admin/menus/1');
      expect(saveCall).toBeDefined();
      const options = saveCall?.[1] as RequestInit;
      const items = JSON.parse(String(options.body)).items as Array<{
        title_fa: string;
        children: Array<{ title_fa: string; sort_order: number }>;
      }>;
      expect(items[1].children.map((item) => [item.title_fa, item.sort_order]))
        .toEqual([['محصول ب', 1], ['محصول الف', 2]]);
    });
  });
});
