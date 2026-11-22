import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileUploader } from './FileUploader.tsx';

describe('FileUploader', () => {
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
});
