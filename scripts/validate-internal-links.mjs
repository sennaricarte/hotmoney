import fs from 'node:fs';
import path from 'node:path';

const postsDir = 'src/content/posts';
const slugs = new Set(
  fs.readdirSync(postsDir).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')),
);

const staticRoutes = new Set([
  '',
  'sobre',
  'contato',
  'blog',
  'busca',
  'renda-extra',
  'politica-de-cookies',
  'politica-de-privacidade',
  'rss.xml',
  'llms.txt',
]);

const redirectSources = new Set([
  'como-monetizar-um-hobby',
  'aplicativos-de-renda-extra',
]);

const linkRe = /(?:https:\/\/(?:www\.)?hotmoney\.blog\.br|\]\(\/)([^)\s"'#]+)/g;

const missing = [];
const redirectTargets = [];

for (const file of fs.readdirSync(postsDir)) {
  if (!file.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  let match;
  while ((match = linkRe.exec(content)) !== null) {
    let slug = match[1].replace(/^\//, '').replace(/\/$/, '');
    if (slug.startsWith('categoria/') || slug.startsWith('blog/')) continue;
    if (slug.includes('.')) continue;

    if (redirectSources.has(slug)) {
      redirectTargets.push({ from: file, slug });
      continue;
    }

    if (!slugs.has(slug) && !staticRoutes.has(slug)) {
      missing.push({ from: file, slug, hasTrailingSlash: match[1].endsWith('/') });
    }
  }
}

console.log('=== Links internos possivelmente 404 ===');
if (missing.length === 0) console.log('Nenhum encontrado.');
else missing.forEach((m) => console.log(`  ${m.from} -> /${m.slug}`));

console.log('\n=== Links que ainda apontam para redirect 301 ===');
if (redirectTargets.length === 0) console.log('Nenhum encontrado.');
else redirectTargets.forEach((m) => console.log(`  ${m.from} -> /${m.slug} (301)`));

const trailing = [];
for (const file of fs.readdirSync(postsDir)) {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  if (/hotmoney\.blog\.br\/[^)\s"']+\//.test(content) || /\]\(\/[^)]+\/\)/.test(content)) {
    trailing.push(file);
  }
}
console.log('\n=== Arquivos com trailing slash restante ===');
if (trailing.length === 0) console.log('Nenhum (fora do cluster excluido).');
else trailing.forEach((f) => console.log(`  ${f}`));
