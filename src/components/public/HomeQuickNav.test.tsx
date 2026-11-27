import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeQuickNav } from './HomeQuickNav.tsx';

describe('HomeQuickNav', () => {
  it('links directly to the home equipment chain section', () => {
    render(<HomeQuickNav />);

    expect(screen.getByRole('link', { name: 'تجهیزات — Products' }).getAttribute('href'))
      .toBe('#home-products');
  });
});
