import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { DEFAULT_PRELOADER_SETTINGS } from '../../utils/brandingDefaults.ts';
import { HomeNavigationPreloader } from './HomeNavigationPreloader.tsx';

const NavigationHarness = () => {
  const navigate = useNavigate();

  return (
    <>
      <button type="button" onClick={() => navigate('/')}>Home</button>
      <HomeNavigationPreloader />
    </>
  );
};

describe('HomeNavigationPreloader', () => {
  let originalViewportWidth = 0;
  let originalViewportHeight = 0;

  beforeEach(() => {
    vi.useFakeTimers();
    originalViewportWidth = window.innerWidth;
    originalViewportHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    useAppStore.setState({
      cachedPreloader: {
        ...DEFAULT_PRELOADER_SETTINGS,
        initial: { ...DEFAULT_PRELOADER_SETTINGS.initial, logo_size_desktop: 256 },
        initial_display_duration_ms: 1200,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalViewportWidth });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalViewportHeight });
    useAppStore.setState({ cachedPreloader: null });
  });

  it('uses the initial responsive size and duration when navigating Home', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <NavigationHarness />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(screen.getByRole('status')).toBeTruthy();
    expect(document.querySelector('.effect-preloader-logo-frame')?.getAttribute('style'))
      .toContain('width: 576px');

    act(() => vi.advanceTimersByTime(1199));
    expect(screen.getByRole('status')).toBeTruthy();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
