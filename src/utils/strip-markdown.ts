/** Remove marcação Markdown comum para exibição em meta tags, FAQ e campos plain-text. */
export function stripMarkdown(text: string): string {
  let result = text;

  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');
  result = result.replace(/`([^`]+)`/g, '$1');
  result = result.replace(/^#{1,6}\s+/gm, '');
  result = result.replace(/^>\s?/gm, '');
  result = result.replace(/\*\*/g, '');
  result = result.replace(/__/g, '');
  result = result.replace(/`/g, '');
  result = result.replace(/#/g, '');

  return result.replace(/\s+/g, ' ').trim();
}
