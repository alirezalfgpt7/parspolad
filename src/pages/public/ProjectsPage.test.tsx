import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ProjectsPage } from './ProjectsPage.tsx';

const addToast = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn((path: string) => {
    if (path === '/projects/filters') {
      return Promise.resolve({
        data: {
          categories: [{ id: 1, slug: 'cat-drilling', name_fa: 'حفاری', name_en: 'Drilling' }],
          years: [],
          clients: [],
          locations: [],
          contract_types: [],
        },
      });
    }

    return Promise.resolve({ data: [], meta: { last_page: 1 } });
  }),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({ language: 'fa', addToast }),
}));

vi.mock('../../components/common/CmsPageIntro.tsx', () => ({
  CmsPageIntro: () => null,
}));

describe('ProjectsPage', () => {
  it('uses the category slug from the URL to load matching projects', async () => {
    render(
      <MemoryRouter initialEntries={['/projects?category=cat-drilling']}>
        <Routes>
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/projects?page=1&per_page=6&category=cat-drilling');
    });
    expect(await screen.findByRole('button', { name: 'حفاری' })).toBeTruthy();
  });
});
