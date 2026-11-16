import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PersianDatePicker } from './PersianDatePicker.tsx';

describe('PersianDatePicker', () => {
  it('renders the date picker input', () => {
    render(<PersianDatePicker value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText('انتخاب تاریخ شمسی')).toBeTruthy();
  });
});
