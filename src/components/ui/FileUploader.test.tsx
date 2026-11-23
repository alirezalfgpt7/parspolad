import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FileUploader } from './FileUploader.tsx';

const mocks = vi.hoisted(() => ({
  addToast: vi.fn(),
  apiMultipartRequest: vi.fn(),
  apiRequest: vi.fn(),
  createVideoPosterInBrowser: vi.fn(),
  fileToBase64: vi.fn(),
}));

vi.mock('../../services/api.ts', () => ({
  apiMultipartRequest: mocks.apiMultipartRequest,
  apiRequest: mocks.apiRequest,
  fileToBase64: mocks.fileToBase64,
}));

vi.mock('../../services/browserVideoOptimizer.ts', () => ({
  createVideoPosterInBrowser: mocks.createVideoPosterInBrowser,
}));

vi.mock('../../store/useAppStore.ts', () => ({
  useAppStore: (selector: (state: { addToast: typeof mocks.addToast }) => unknown) =>
    selector({ addToast: mocks.addToast }),
}));

describe('FileUploader', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the compact camera trigger without a duplicate file preview', () => {
    render(
      <div className="relative">
        <FileUploader
          variant="icon-button"
          currentUrl="/storage/avatars/current.png"
          label="تغییر تصویر پروفایل"
          onUploaded={() => undefined}
        />
      </div>,
    );

    expect(screen.getByRole('button', { name: 'تغییر تصویر پروفایل' })).toBeTruthy();
    expect(screen.queryByText('پیش‌نمایش فایل فعلی')).toBeNull();
    expect(screen.queryByText('/storage/avatars/current.png')).toBeNull();
  });

  it('creates and saves a poster automatically after uploading a video', async () => {
    const uploadedMedia = {
      id: 45,
      name: 'new-video.mp4',
      url: '/storage/uploads/new-video.mp4',
      mime_type: 'video/mp4',
      extension: 'mp4',
      size_bytes: 4096,
      folder: 'uploads',
      requires_auth: false,
      created_at: '2026-01-01T00:00:00Z',
    };
    const poster = new File(['jpeg'], 'poster.jpg', { type: 'image/jpeg' });
    const onUploaded = vi.fn();
    mocks.fileToBase64.mockResolvedValue('data:video/mp4;base64,video');
    mocks.apiRequest.mockResolvedValue({ data: uploadedMedia });
    mocks.createVideoPosterInBrowser.mockResolvedValue(poster);
    mocks.apiMultipartRequest.mockResolvedValue({ data: { id: 46, variant: 'poster' } });

    const { container } = render(<FileUploader onUploaded={onUploaded} />);
    const video = new File(['mp4'], 'new-video.mp4', { type: 'video/mp4' });
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [video] },
    });

    await waitFor(() => expect(mocks.apiMultipartRequest).toHaveBeenCalledTimes(1));
    const [endpoint, form] = mocks.apiMultipartRequest.mock.calls[0] as [string, FormData];
    expect(endpoint).toBe('/admin/media/45/optimizer-variant');
    expect(form.get('variant')).toBe('poster');
    expect(form.get('file')).toBeInstanceOf(File);
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(uploadedMedia.url, uploadedMedia));
    expect(mocks.createVideoPosterInBrowser).toHaveBeenCalledWith(video, expect.any(Function));
  });

  it('does not start another upload while the selected file is still uploading', async () => {
    const uploadedMedia = {
      id: 45,
      name: 'document.pdf',
      url: '/storage/uploads/document.pdf',
      mime_type: 'application/pdf',
      extension: 'pdf',
      size_bytes: 4096,
      folder: 'uploads',
      requires_auth: false,
      created_at: '2026-01-01T00:00:00Z',
    };
    mocks.fileToBase64.mockResolvedValue('data:application/pdf;base64,document');
    mocks.apiRequest.mockResolvedValue({ data: uploadedMedia });

    const { container } = render(<FileUploader onUploaded={() => undefined} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const documentFile = new File(['pdf'], 'document.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [documentFile] } });
    fireEvent.change(input, { target: { files: [documentFile] } });

    await waitFor(() => expect(mocks.apiRequest).toHaveBeenCalledTimes(1));
  });
});
