import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { MediaFile } from '../../types/index.ts';
import { MediaLibraryPreview } from './MediaLibraryPreview.tsx';

const mediaFile = (patch: Partial<MediaFile>): MediaFile => ({
  id: 1,
  name: 'sample',
  url: '/storage/uploads/sample.png',
  mime_type: 'image/png',
  extension: 'png',
  size_bytes: 1024,
  folder: 'uploads',
  requires_auth: false,
  created_at: '2026-01-01T00:00:00Z',
  ...patch,
});

describe('MediaLibraryPreview', () => {
  afterEach(cleanup);

  it('uses the media thumbnail route for static images', async () => {
    render(
      <MediaLibraryPreview item={mediaFile({
        preview_url: '/api/v1/media/1/preview',
        thumbnail_url: '/api/v1/media/1/thumbnail',
      })} />,
    );

    const image = await screen.findByRole('img', { name: 'sample' });
    expect(image.getAttribute('src')).toBe('/api/v1/media/1/thumbnail');
  });

  it('keeps animated GIFs on their original preview URL', () => {
    const { container } = render(
      <MediaLibraryPreview item={mediaFile({
        url: '/storage/uploads/animated.gif',
        preview_url: '/api/v1/media/2/preview',
        thumbnail_url: '/api/v1/media/2/thumbnail',
        mime_type: 'image/gif',
        extension: 'gif',
      })} />,
    );

    expect(container.querySelector('img')?.getAttribute('src')).toBe('/api/v1/media/2/preview');
  });

  it('uses the optimized browser preview URL and poster for videos', () => {
    const { container } = render(
      <MediaLibraryPreview item={mediaFile({
        url: '/storage/uploads/animation.mp4',
        preview_url: '/api/v1/media/3/preview',
        thumbnail_url: '/api/v1/media/3/thumbnail',
        optimized_preview_url: '/api/v1/media/4/preview',
        mime_type: 'video/mp4',
        extension: 'mp4',
      })} />,
    );
    const video = container.querySelector('video');

    expect(video?.getAttribute('src')).toBe('/api/v1/media/4/preview');
    expect(video?.getAttribute('poster')).toBe('/api/v1/media/3/thumbnail');
  });
});
