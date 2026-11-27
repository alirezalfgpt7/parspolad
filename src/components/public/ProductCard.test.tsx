import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Product } from '../../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

const product: Product = {
  id: 1,
  slug: 'test-product',
  name_fa: 'محصول آزمایشی',
  name_en: 'Test Product',
  category_fa: 'تجهیزات سرچاهی',
  category_en: 'Wellhead equipment',
  model_code: 'P-100',
  standard: 'API 6A',
  summary_fa: 'شرح فنی محصول',
  summary_en: 'Product technical summary',
  specs: { 'فشار کاری': '10,000 PSI' },
  image_url: '/storage/products/test.webp',
  catalog_url: '/storage/products/test.pdf',
};

describe('ProductCard', () => {
  it('flips to technical details and returns to the image with keyboard focus', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={product} language="fa" />
      </MemoryRouter>,
    );
    const flipContainer = container.querySelector('.product-card-flip');
    const frontButton = container.querySelector<HTMLButtonElement>('.flip-card-face--front button');
    const backButton = container.querySelector<HTMLButtonElement>('.flip-card-face--back button');

    expect(flipContainer?.getAttribute('data-flipped')).toBe('false');
    expect(frontButton).not.toBeNull();
    expect(backButton).not.toBeNull();
    if (!flipContainer || !frontButton || !backButton) {
      throw new Error('Product card flip controls were not rendered.');
    }

    fireEvent.pointerEnter(flipContainer, { pointerType: 'touch' });
    expect(flipContainer.getAttribute('data-flipped')).toBe('false');

    fireEvent.click(frontButton);
    expect(flipContainer.getAttribute('data-flipped')).toBe('true');
    expect(document.activeElement).toBe(backButton);

    fireEvent.click(backButton);
    expect(flipContainer.getAttribute('data-flipped')).toBe('false');
    expect(document.activeElement).toBe(frontButton);

    fireEvent.pointerEnter(flipContainer, { pointerType: 'mouse' });
    expect(flipContainer.getAttribute('data-flipped')).toBe('true');
    fireEvent.pointerLeave(flipContainer, { pointerType: 'mouse' });
    expect(flipContainer.getAttribute('data-flipped')).toBe('false');
  });
});
