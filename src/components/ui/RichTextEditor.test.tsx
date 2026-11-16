import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichTextEditor } from './RichTextEditor.tsx';

describe('RichTextEditor', () => {
  it('sanitizes stored HTML before rendering it in the editor', () => {
    const { container } = render(
      <RichTextEditor
        value={'<p>Safe content</p><img src="x" onerror="alert(1)"><script>alert(2)</script>'}
        onChange={() => {}}
      />,
    );

    expect(container.textContent).toContain('Safe content');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')?.hasAttribute('onerror')).toBe(false);
  });
});
