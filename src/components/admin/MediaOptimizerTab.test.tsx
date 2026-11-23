import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MediaOptimizerTab } from './MediaOptimizerTab.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  apiRequest: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiRequest: mocks.apiRequest,
  apiBlob: vi.fn(),
  apiMultipartRequest: vi.fn(),
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: () => ({ addToast: mocks.addToast }),
}));

vi.mock('./MediaThumbnail.tsx', () => ({ MediaThumbnail: () => null }));

describe('MediaOptimizerTab', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('starts only one preflight when multiple media actions are clicked quickly', async () => {
    let resolveCheck: ((value: { data: { requires_confirmation: boolean; reason: null } }) => void) | undefined;
    const pendingCheck = new Promise<{ data: { requires_confirmation: boolean; reason: null } }>((resolve) => {
      resolveCheck = resolve;
    });

    mocks.apiRequest.mockImplementation((path: string) => {
      if (path === '/admin/media?optimizable=1&page=1&per_page=12') {
        return Promise.resolve({
          data: [1, 2].map((id) => ({
            id,
            name: `image-${id}.jpg`,
            url: `/storage/image-${id}.jpg`,
            mime_type: 'image/jpeg',
            extension: 'jpg',
            size_bytes: 4096,
            folder: 'uploads',
            requires_auth: false,
            source_available: true,
            created_at: '2026-01-01T00:00:00Z',
          })),
          meta: { last_page: 1 },
        });
      }
      if (path === '/admin/media/optimizer/capabilities') {
        return Promise.resolve({ data: { images: { available: true, format: 'webp' }, videos: { available: false, format: 'mp4' } } });
      }
      if (path.endsWith('/optimization-check')) return pendingCheck;
      if (path.endsWith('/optimize')) return Promise.resolve({ data: { source: {}, variants: [] } });
      throw new Error(`Unexpected API request: ${path}`);
    });

    render(<MediaOptimizerTab />);
    const buttons = await screen.findAllByRole('button', { name: 'بهینه‌سازی و ساخت نسخه‌ها' });
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(mocks.apiRequest).toHaveBeenCalledWith('/admin/media/1/optimization-check');
    expect(mocks.apiRequest).not.toHaveBeenCalledWith('/admin/media/2/optimization-check');

    resolveCheck?.({ data: { requires_confirmation: false, reason: null } });
    await waitFor(() => {
      expect(mocks.apiRequest).toHaveBeenCalledWith('/admin/media/1/optimize', {
        method: 'POST',
        body: JSON.stringify({ force: false }),
      });
    });
  });
});
