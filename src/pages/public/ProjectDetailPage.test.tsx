import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../services/api.ts';
import { ProjectDetailPage } from './ProjectDetailPage.tsx';

const mockApiRequest = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api.ts')>();
  return { ...actual, apiRequest: mockApiRequest };
});

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({ language: 'fa', user: null }),
}));

vi.mock('../../components/common/SeoHead.tsx', () => ({ SeoHead: () => null }));
vi.mock('../../components/ui/Breadcrumb.tsx', () => ({ Breadcrumb: () => null }));
vi.mock('../../components/ui/ZeroBrokenImage.tsx', () => ({
  ZeroBrokenImage: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));
vi.mock('../../components/common/PagePreloader.tsx', () => ({
  PagePreloader: ({ label }: { label: string }) => <p>{label}</p>,
}));

const project = {
  id: 1,
  slug: 'elliott-turbine-thrust-journal-bearings',
  title_fa: 'مهندسی معکوس و ساخت بیرینگ',
  title_en: 'Reverse Engineering of Turbine Bearings',
  category_id: 1,
  category: { id: 1, slug: 'turbine', name_fa: 'توربین', name_en: 'Turbine' },
  client_name_fa: 'کارفرما',
  client_name_en: 'Client',
  contract_number: 'RND-01',
  contract_type_fa: 'طراحی و ساخت',
  contract_type_en: 'Design & Build',
  location_fa: 'اهواز',
  location_en: 'Ahvaz',
  year: 1402,
  status: 'completed' as const,
  summary_fa: 'خلاصه پروژه',
  summary_en: 'Project summary',
  description_fa: 'شرح پروژه',
  description_en: 'Project description',
  standards: ['API 617'],
  cover_image: '/storage/project.jpg',
  images: ['/storage/project.jpg'],
  videos: [],
  documents: [],
  is_featured: true,
};

const renderPage = () => render(
  <MemoryRouter initialEntries={['/projects/elliott-turbine-thrust-journal-bearings']}>
    <Routes>
      <Route path="/projects/:slug" element={<ProjectDetailPage />} />
      <Route path="/projects" element={<p>فهرست پروژه‌ها</p>} />
    </Routes>
  </MemoryRouter>,
);

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    mockApiRequest.mockReset();
  });

  it('renders the project returned directly by the project API', async () => {
    mockApiRequest.mockResolvedValue(project);
    renderPage();

    expect(await screen.findByRole('heading', { name: project.title_fa })).toBeTruthy();
    expect(apiRequest).toHaveBeenCalledWith(`/projects/${project.slug}`);
    expect(screen.queryByText('در حال دریافت اطلاعات پروژه...')).toBeNull();
  });

  it('shows a retry and return option instead of an endless loader on failure', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network unavailable'));
    renderPage();

    expect(await screen.findByRole('button', { name: 'تلاش دوباره' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'بازگشت به پروژه‌ها' })).toBeTruthy();
    expect(screen.queryByText('در حال دریافت اطلاعات پروژه...')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(2));
  });
});
