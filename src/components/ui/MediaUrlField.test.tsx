import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaUrlField } from './MediaUrlField.tsx';

const apiRequestMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/api.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api.ts')>();
  return { ...actual, apiRequest: apiRequestMock };
});

describe('MediaUrlField', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('selects the optimized API preview URL for a video instead of its raw storage path', async () => {
    apiRequestMock.mockResolvedValue({
      data: [{
        id: 56,
        name: 'Rotating_red_glass_logo_9f2c7c41.mp4',
        url: '/storage/uploads/188b43a8-bb09-47fa-9fff-38f1d6027b77.mp4',
        mime_type: 'video/mp4',
        extension: 'mp4',
        size_bytes: 100,
        folder: 'preloaders',
        requires_auth: false,
        preview_url: '/api/v1/media/56/preview',
        optimized_preview_url: '/api/v1/media/57/preview',
        thumbnail_url: '/api/v1/media/58/thumbnail',
      }],
      meta: { last_page: 1 },
    });
    const onChange = vi.fn();

    render(<MediaUrlField label="لوگوی متحرک" value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'کتابخانه رسانه' }));
    fireEvent.click(await screen.findByRole('button', { name: /Rotating_red_glass_logo_9f2c7c41\.mp4/ }));

    expect(onChange).toHaveBeenCalledWith('/api/v1/media/57/preview#video');
  });
});
