import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ProjectsAdminPage } from './ProjectsAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  fetchBootstrap: vi.fn(),
}));

const category = {
  id: 42,
  slug: 'cat-test',
  name_fa: 'دسته آزمایشی',
  name_en: 'Test category',
  icon: 'Layers',
  color: '#123456',
  description_fa: null,
};

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn((path: string) => {
    if (path.startsWith('/admin/projects?')) {
      return Promise.resolve({
        data: [{
          id: 7,
          slug: 'wellhead-project',
          title_fa: 'پروژه سرچاهی',
          category_id: category.id,
          category,
          client_name_fa: 'کارفرما',
          contract_number: 'PPA-1404-01',
          year: 1404,
          status: 'in_progress',
          cover_image: '/cover.jpg',
        }],
        meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
      });
    }

    if (path.startsWith('/admin/categories?')) {
      return Promise.resolve({
        data: [category],
        meta: { current_page: 1, last_page: 1, per_page: 8, total: 1 },
      });
    }

    if (path === '/admin/projects/7') {
      return Promise.resolve({ data: { ...category, id: 7 } });
    }

    return Promise.resolve({});
  }),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => mocks,
}));

describe('ProjectsAdminPage', () => {
  afterEach(cleanup);

  it('shows project categories and searches with a selectable server page size', async () => {
    render(<ProjectsAdminPage />);

    await screen.findByText('دسته آزمایشی');
    expect(screen.getByRole('columnheader', { name: 'دسته فنی' })).toBeTruthy();
    expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('per_page=10'));

    fireEvent.change(screen.getByRole('combobox', { name: 'تعداد ردیف در هر صفحه' }), {
      target: { value: '20' },
    });
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('per_page=20'));
    });

    fireEvent.click(screen.getByRole('button', { name: 'عنوان پروژه' }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('sort_by=title_fa&sort_order=asc'));
    });

    fireEvent.change(screen.getByRole('searchbox', { name: 'جست‌وجوی پروژه‌ها' }), {
      target: { value: 'wellhead' },
    });
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('q=wellhead'));
    }, { timeout: 1500 });
  });

  it('searches categories remotely in the project editor', async () => {
    render(<ProjectsAdminPage />);

    await screen.findByText('دسته آزمایشی');
    fireEvent.click(screen.getByRole('button', { name: 'پروژه جدید' }));
    fireEvent.click(await screen.findByRole('button', { name: 'دسته آزمایشی' }));
    fireEvent.change(screen.getByPlaceholderText('جستجو در گزینه‌ها...'), {
      target: { value: 'specialty' },
    });

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('search=specialty'));
    }, { timeout: 1500 });
  });

  it('saves an existing category with a nullable description', async () => {
    render(<ProjectsAdminPage />);

    fireEvent.click(screen.getByRole('button', { name: 'نمایش فهرست دسته‌بندی‌های فنی' }));
    fireEvent.click(await screen.findByRole('button', { name: 'ویرایش دسته دسته آزمایشی' }));
    fireEvent.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/admin/categories/42',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });
});
