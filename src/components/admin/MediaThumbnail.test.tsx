import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaThumbnail } from './MediaThumbnail.tsx';

const apiBlobMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api.ts')>();
  return { ...actual, apiBlob: apiBlobMock };
});

describe('MediaThumbnail', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    apiBlobMock.mockReset().mockRejectedValue(new Error('Thumbnail unavailable'));
  });

  it('loads the persistent thumbnail URL directly for native browser caching', async () => {
    render(
      <MediaThumbnail
        mediaId={4}
        alt="Original photo"
        isVideo={false}
        originalUrl="/api/v1/media/4/preview"
        thumbnailUrl="/api/v1/media/4/thumbnail"
      />,
    );

    const image = await screen.findByRole('img', { name: 'Original photo' });
    expect(image.getAttribute('src')).toBe('/api/v1/media/4/thumbnail');
    expect(apiBlobMock).not.toHaveBeenCalled();
  });

  it('shows a native metadata-only preview when no saved video poster exists', async () => {
    const { container } = render(
      <MediaThumbnail
        mediaId={5}
        alt="Original video"
        isVideo
        originalUrl="/api/v1/media/5/preview"
      />,
    );

    await waitFor(() => {
      expect(apiBlobMock).toHaveBeenCalledWith('/admin/media/5/thumbnail');
      const video = container.querySelector('video');
      expect(video?.getAttribute('src')).toBe('/api/v1/media/5/preview');
    });
    const video = container.querySelector('video');
    expect(video?.getAttribute('preload')).toBe('metadata');
    expect(container.querySelector('img')).toBeNull();
  });

  it('falls back to the full original when the thumbnail URL is missing', async () => {
    render(
      <MediaThumbnail
        mediaId={6}
        alt="Original photo"
        isVideo={false}
        originalUrl="/api/v1/media/6/preview"
        thumbnailUrl="/api/v1/media/6/thumbnail"
      />,
    );

    const image = await screen.findByRole('img', { name: 'Original photo' });
    fireEvent.error(image);

    await waitFor(() => {
      expect(image.getAttribute('src')).toBe('/api/v1/media/6/preview');
    });
  });
});
