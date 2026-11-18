import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ProjectsAdminPage } from './ProjectsAdminPage.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  fetchBootstrap: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn((path: string) => {
    if (path.startsWith('/admin/projects')) {
      return Promise.resolve({ data: [], meta: { last_page: 1 } });
    }

    if (path === '/admin/categories') {
      return Promise.resolve({
        data: [{
          id: 42,
          slug: 'cat-test',
          name_fa: 'دسته آزمایشی',
          name_en: 'Test category',
          icon: 'Layers',
          color: '#123456',
          description_fa: null,
        }],
      });
    }

    return Promise.resolve({});
  }),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => mocks,
}));

describe('ProjectsAdminPage', () => {
  it('saves an existing category with a nullable description', async () => {
    render(<ProjectsAdminPage />);

    await screen.findByText('دسته آزمایشی');
    fireEvent.click(screen.getByRole('button', { name: 'ویرایش' }));
    fireEvent.click(screen.getByRole('button', { name: 'ذخیره' }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        '/admin/categories/42',
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });
});
