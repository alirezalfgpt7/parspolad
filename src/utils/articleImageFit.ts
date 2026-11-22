import type { Article } from '../types/index.ts';

export const getArticleImageObjectFit = (fit: Article['image_fit']): 'cover' | 'contain' | 'fill' | 'none' => {
  switch (fit) {
    case 'fit':
      return 'contain';
    case 'stretch':
      return 'fill';
    case 'center':
      return 'none';
    default:
      return 'cover';
  }
};
