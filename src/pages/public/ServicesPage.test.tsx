import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ServicesPage } from './ServicesPage.tsx';

const addToast = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', () => ({
  apiRequest: vi.fn(() => Promise.resolve({
    data: [
      {
        id: 1,
        title_fa: 'طراحی مهندسی',
        title_en: 'Engineering Design',
        summary_fa: 'توضیح خدمت',
        summary_en: 'Service summary',
        description_fa: 'شرح کامل خدمت',
        description_en: 'Service description',
        image_url: '/storage/services/design.jpg',
      },
    ],
    meta: { last_page: 2 },
  })),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({ language: 'fa', addToast }),
}));

vi.mock('../../components/common/CmsPageIntro.tsx', () => ({
  CmsPageIntro: () => null,
}));

describe('ServicesPage', () => {
  it('shows compact service cards and loads the requested page', async () => {
    render(
      <MemoryRouter>
        <ServicesPage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'طراحی مهندسی' })).toBeTruthy();
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/services?page=1&per_page=3');
    });

    fireEvent.click(screen.getByRole('button', { name: 'صفحه بعد' }));
    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/services?page=2&per_page=3');
    });
  });
});
