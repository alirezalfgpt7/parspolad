import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomCursor } from './CustomCursor.tsx';

describe('CustomCursor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('activates the requested cursor mode only over opted-in elements', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('hover: hover'),
    }));

    const { unmount } = render(
      <>
        <CustomCursor />
        <button data-cursor="crosshair">Crosshair target</button>
      </>,
    );

    const cursor = document.querySelector<HTMLElement>('.custom-cursor');
    expect(cursor).not.toBeNull();
    if (!cursor) throw new Error('Custom cursor should be mounted.');
    fireEvent.pointerOver(screen.getByText('Crosshair target'));

    expect(cursor.getAttribute('data-visible')).toBe('true');
    expect(cursor.getAttribute('data-variant')).toBe('crosshair');
    expect(document.documentElement.getAttribute('data-custom-cursor-enabled')).toBe('true');

    fireEvent.pointerOut(screen.getByText('Crosshair target'), { relatedTarget: document.body });
    expect(cursor.getAttribute('data-visible')).toBe('false');

    unmount();
    expect(document.documentElement.hasAttribute('data-custom-cursor-enabled')).toBe(false);
  });
});
