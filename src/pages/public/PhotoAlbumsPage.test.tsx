import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { apiRequest, apiUrl } from '../../services/api.ts';
import type { PhotoAlbum, PhotoAlbumSummary } from '../../types/index.ts';
import { PhotoAlbumsPage } from './PhotoAlbumsPage.tsx';

const addToast = vi.hoisted(() => vi.fn());
const album: PhotoAlbum = {
  id: 1,
  title_fa: 'عملیات میدانی',
  title_en: 'Field Operations',
  slug: 'field-operations',
  description_fa: 'تصاویر عملیات',
  description_en: 'Field operation photos',
  cover_media_id: 1,
  layout: 'grid',
  columns: 2,
  rows: 1,
  transition: 'fade',
  interval_ms: 5000,
  image_effect: 'zoom',
  card_effect: 'lift',
  sort_order: 0,
  is_active: true,
  media: [
    { id: 1, name: 'image-1.jpg', url: '/storage/image-1.jpg', thumbnail_url: '/storage/image-1-thumb.webp' },
    { id: 2, name: 'image-2.jpg', url: '/storage/image-2.jpg', thumbnail_url: '/storage/image-2-thumb.webp' },
    { id: 3, name: 'image-3.jpg', url: '/storage/image-3.jpg', thumbnail_url: '/storage/image-3-thumb.webp' },
  ],
};

vi.mock('../../services/api.ts', () => ({
  apiUrl: (path: string) => `/api/v1${path}`,
  apiRequest: vi.fn((path: string) => {
    if (path === '/albums/field-operations') {
      return Promise.resolve({ data: album });
    }

    return Promise.resolve({
      data: [{
        id: 1,
        title_fa: 'عملیات میدانی',
        title_en: 'Field Operations',
        slug: 'field-operations',
        description_fa: 'تصاویر عملیات',
        description_en: 'Field operation photos',
        cover_url: '/storage/cover.jpg',
        cover_thumbnail_url: '/storage/cover-thumb.webp',
        media_count: 3,
        updated_at: '2026-01-01T00:00:00Z',
      } satisfies PhotoAlbumSummary],
      meta: { current_page: 1, last_page: 1, total: 1 },
    });
  }),
}));

vi.mock('../../store/useAppStore.ts', () => {
  const state = {
    language: 'fa',
    addToast,
    bootstrap: {
      pages: [{
        slug: 'albums',
        title_fa: 'آلبوم تصاویر',
        title_en: 'Photo Albums',
        subtitle_fa: 'مجموعهٔ تصاویر پروژه‌ها',
        subtitle_en: 'Project photo collections',
        content_fa: '',
        content_en: '',
        meta_title: 'آلبوم تصاویر',
        meta_title_en: 'Photo Albums',
        meta_description: '',
        meta_description_en: '',
        metadata: {},
      }],
    },
  };
  return {
    useAppStore: (selector?: (value: typeof state) => unknown) => selector ? selector(state) : state,
  };
});

vi.mock('../../components/common/SeoHead.tsx', () => ({ SeoHead: () => null }));

describe('PhotoAlbumsPage', () => {
  it('lists albums with their cover thumbnails', async () => {
    render(
      <MemoryRouter initialEntries={['/albums']}>
        <Routes>
          <Route path="/albums" element={<PhotoAlbumsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'عملیات میدانی' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'آلبوم تصاویر', level: 1 })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'عملیات میدانی' }).getAttribute('src')).toBe('/api/v1/storage/cover-thumb.webp');
    expect(apiRequest).toHaveBeenCalledWith('/albums?page=1&per_page=12');
  });

  it('shows more selected images when requested in a grid album', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/albums/field-operations']}>
        <Routes>
          <Route path="/albums/:slug" element={<PhotoAlbumsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await screen.findByRole('heading', { name: 'عملیات میدانی' });
    expect(screen.getByRole('heading', { name: 'عملیات میدانی', level: 1 })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'image-1.jpg' }).getAttribute('src')).toBe('/api/v1/storage/image-1-thumb.webp');
    expect(screen.getByRole('img', { name: 'image-2.jpg' }).getAttribute('src')).toBe('/api/v1/storage/image-2-thumb.webp');
    fireEvent.click(screen.getByRole('button', { name: 'مترو' }));
    expect(container.querySelector('.photo-album-gallery--mosaic')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /تصویر \d/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'نمایش همهٔ 3 تصویر' }));
    await waitFor(() => expect(screen.getAllByRole('button', { name: /تصویر \d/ })).toHaveLength(3));
    fireEvent.click(screen.getByRole('button', { name: /تصویر 1/ }));
    expect(screen.getByRole('dialog').querySelector('img[src="/api/v1/storage/image-1.jpg"]')).toBeTruthy();
  });
});
