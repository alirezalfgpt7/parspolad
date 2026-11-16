import DOMPurify from 'dompurify';

const allowedTags = [
  'a', 'blockquote', 'br', 'caption', 'code', 'dd', 'div', 'dl', 'dt', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'li', 'ol', 'p', 'pre',
  'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead',
  'tr', 'u', 'ul',
];

const allowedAttributes = [
  'alt', 'colspan', 'height', 'href', 'loading', 'rel', 'rowspan', 'src',
  'target', 'title', 'width',
];

export const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: allowedTags,
  ALLOWED_ATTR: allowedAttributes,
  FORBID_ATTR: ['style'],
  ALLOW_DATA_ATTR: false,
});
