import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatLocalizedNumber } from '../../utils/i18n.ts';
import { StatCounter } from './StatCounter.tsx';

describe('StatCounter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts counting when it enters view and respects reduced motion', async () => {
    let intersectionCallback: IntersectionObserverCallback | undefined;
    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }

      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '0px';
      thresholds = [0.25];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    const { container, getByText } = render(
      <StatCounter target={100} suffix="+" label="پروژه‌های موفق" lang="fa" index={0} />,
    );

    expect(container.querySelector('.industrial-stat-shell')).toBeTruthy();
    expect(container.querySelector('.industrial-stat-value')?.textContent).toBe(formatLocalizedNumber(0, 'fa'));

    act(() => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(await getByText(formatLocalizedNumber(100, 'fa'))).toBeTruthy();
    expect(getByText('KPI / 01')).toBeTruthy();
  });
});
