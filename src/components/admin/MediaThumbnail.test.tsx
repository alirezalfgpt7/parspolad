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
    expect(image.getAttribute('src')).toBe('/api/v1/storage/photo.jpg');
  });

  it('does not fall back to downloading a full video for a preview', async () => {
    const { container } = render(<MediaThumbnail mediaId={5} alt="Original video" isVideo originalUrl="/storage/video.mp4" />);

    await waitFor(() => expect(apiBlobMock).toHaveBeenCalledWith('/admin/media/5/thumbnail'));
    expect(container.querySelector('img')).toBeNull();
  });
});
