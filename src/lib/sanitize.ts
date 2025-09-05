import createDOMPurify from 'isomorphic-dompurify';

const DOMPurify = createDOMPurify();

export function stripHtmlToText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function stripTagsPreserveText(input: string): string {
  return input.replace(/<\/?[a-z][^>]*>/gi, '');
}
