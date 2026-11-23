import { describe, expect, it } from 'vitest';
import { apiUrl, mediaUrl } from './api.ts';

describe('mediaUrl', () => {
  it('keeps public storage files outside the API prefix', () => {
    expect(mediaUrl('/storage/products/photo.jpg')).toBe('/storage/products/photo.jpg');
  });

  it('routes album media endpoints through the configured API base', () => {
    expect(mediaUrl('/albums/field-operations/media/4/thumbnail')).toBe(apiUrl('/albums/field-operations/media/4/thumbnail'));
  });
});
