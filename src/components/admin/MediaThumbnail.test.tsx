import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaThumbnail } from './MediaThumbnail.tsx';

const apiBlobMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api.ts')>();
  return { ...actual, apiBlob: apiBlobMock };
});

describe('MediaThumbnail', () => {
  beforeEach(() => {
    apiBlobMock.mockReset().mockRejectedValue(new Error('Thumbnail unavailable'));
  });

  it('uses the API origin for an original image when its thumbnail cannot load', async () => {
    render(<MediaThumbnail mediaId={4} alt="Original photo" isVideo={false} originalUrl="/storage/photo.jpg" />);

    const image = await screen.findByRole('img', { name: 'Original photo' });
    expect(image.getAttribute('src')).toBe('/storage/photo.jpg');
  });

  it('shows a native metadata-only preview when no saved video poster exists', async () => {
    const { container } = render(<MediaThumbnail mediaId={5} alt="Original video" isVideo originalUrl="/storage/video.mp4" />);

    await waitFor(() => {
      expect(apiBlobMock).toHaveBeenCalledWith('/admin/media/5/thumbnail');
      const video = container.querySelector('video');
      expect(video?.getAttribute('src')).toBe('/storage/video.mp4');
    });
    const video = container.querySelector('video');
    expect(video?.getAttribute('preload')).toBe('metadata');
    expect(container.querySelector('img')).toBeNull();
  });
});
