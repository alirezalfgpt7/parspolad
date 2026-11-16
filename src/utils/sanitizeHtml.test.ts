import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml.ts';

describe('sanitizeHtml', () => {
  it('keeps safe rich text while removing executable markup and attributes', () => {
    const result = sanitizeHtml(
      '<p onclick="alert(1)">Safe <strong>text</strong></p><script>alert(2)</script><a href="javascript:alert(3)">bad link</a>',
    );

    expect(result).toContain('<p>Safe <strong>text</strong></p>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('javascript:');
  });
});
