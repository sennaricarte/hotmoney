import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'content', 'posts');

/**
 * Mapa pathname → ISO lastmod a partir do frontmatter dos posts.
 * Usa updatedDate quando existir; caso contrário, pubDate.
 */
export function buildPostLastmodMap() {
  const map = new Map();

  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md')) continue;

    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    if (/^draft:\s*true\s*$/m.test(content)) continue;

    const pubMatch = content.match(/^pubDate:\s*(.+)$/m);
    if (!pubMatch) continue;

    const pubDate = new Date(pubMatch[1].trim());
    if (isNaN(pubDate.getTime())) continue;

    let lastmod = pubDate;
    const updatedMatch = content.match(/^updatedDate:\s*(.+)$/m);
    if (updatedMatch) {
      const updatedDate = new Date(updatedMatch[1].trim());
      if (!isNaN(updatedDate.getTime())) lastmod = updatedDate;
    }

    const slug = file.replace(/\.md$/, '');
    map.set(`/${slug}`, lastmod.toISOString());
  }

  return map;
}
