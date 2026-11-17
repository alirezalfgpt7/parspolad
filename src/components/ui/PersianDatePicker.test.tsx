import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-multi-date-picker', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-multi-date-picker')>();

  return {
    ...actual,
    default: { default: actual.default },
  };
});

import { PersianDatePicker } from './PersianDatePicker.tsx';

describe('PersianDatePicker', () => {
  it('renders the date picker input', () => {
    render(<PersianDatePicker value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText('انتخاب تاریخ شمسی')).toBeTruthy();
  });
});
