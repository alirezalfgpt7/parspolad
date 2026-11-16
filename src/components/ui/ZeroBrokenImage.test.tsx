import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ZeroBrokenImage } from './ZeroBrokenImage.tsx';

describe('ZeroBrokenImage', () => {
  it('retries a new source after the previous image failed', () => {
    const { rerender } = render(<ZeroBrokenImage src="/first.jpg" alt="First image" />);

    fireEvent.error(screen.getByRole('img', { name: 'First image' }));
    expect(screen.queryByRole('img', { name: 'First image' })).toBeNull();
    expect(screen.getByText('First image')).toBeTruthy();

    rerender(<ZeroBrokenImage src="/second.jpg" alt="Second image" />);
    expect(screen.getByRole('img', { name: 'Second image' }).getAttribute('src')).toBe('/second.jpg');
  });
});
