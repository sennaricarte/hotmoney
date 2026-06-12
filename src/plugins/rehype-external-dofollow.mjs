import { visit } from 'unist-util-visit';

const SITE_HOSTS = new Set(['hotmoney.blog.br']);

const BLOCKED_REL = new Set(['nofollow', 'sponsored', 'ugc']);

function isExternal(href) {
  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    return false;
  }

  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return !SITE_HOSTS.has(host);
  } catch {
    return false;
  }
}

function normalizeRel(rel) {
  if (!rel) return [];

  const raw = Array.isArray(rel) ? rel.join(' ') : String(rel);
  return raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

/** Garante que links externos no corpo dos posts não usem nofollow/sponsored/ugc. */
export function rehypeExternalDofollow() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;

      const href = node.properties?.href;
      if (typeof href !== 'string' || !isExternal(href)) return;

      const rel = normalizeRel(node.properties.rel).filter(
        (token) => !BLOCKED_REL.has(token.toLowerCase()),
      );

      if (rel.length > 0) {
        node.properties.rel = rel.join(' ');
        return;
      }

      delete node.properties.rel;
    });
  };
}
