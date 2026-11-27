import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ContentRecordsAdminPage } from './ContentRecordsAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  fetchBootstrap: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn((path: string) => {
    if (path === '/admin/content-resources') {
      return Promise.resolve({
        data: [{ key: 'articles', label_fa: 'اخبار و مقالات', label_en: 'Articles', description_fa: '', usage_fa: '', public_path: '/news', related_admin_path: null, count: 1 }],
      });
    }
    if (path === '/admin/content-schema/articles') {
      return Promise.resolve({
        data: {
          fields: [
            { name: 'title_fa', label_fa: 'عنوان', label_en: 'Title', type: 'string', required: true, unique: false },
            {
              name: 'article_category_id',
              label_fa: 'دسته‌بندی مقاله',
              label_en: 'Article category',
              type: 'select',
              required: true,
              unique: false,
              options: [{ value: '4', label_fa: 'فنی', label_en: 'Technical' }],
            },
          ],
        },
      });
    }
    if (path.startsWith('/admin/articles?')) {
      return Promise.resolve({
        data: [{ id: 12, title_fa: 'مقاله آزمایشی', article_category_id: 4 }],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
      });
    }
    return Promise.resolve({ data: [] });
  }),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({ addToast: mocks.addToast, fetchBootstrap: mocks.fetchBootstrap }),
}));

describe('ContentRecordsAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves an unchanged numeric article category from the edit form', async () => {
    render(
      <MemoryRouter>
        <ContentRecordsAdminPage initialResource="articles" lockedResource />
      </MemoryRouter>,
    );

    fireEvent.click((await screen.findAllByRole('button', { name: 'ویرایش رکورد' }))[0]);
    const categorySelect = await screen.findByRole('combobox', { name: /دسته‌بندی مقاله/ });
    expect((categorySelect as HTMLSelectElement).value).toBe('4');
    fireEvent.click(screen.getByRole('button', { name: 'ذخیرهٔ تغییرات' }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/admin/articles/12', {
        method: 'PUT',
        body: JSON.stringify({ title_fa: 'مقاله آزمایشی', article_category_id: 4 }),
      });
    });
  });
});
