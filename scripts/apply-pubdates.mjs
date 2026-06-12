import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = 'src/content/posts';
const raw = fs.readFileSync('scripts/pubdate-plan.json', 'utf8').replace(/^\uFEFF/, '');
const plan = JSON.parse(raw).plan;

let updated = 0;
for (const { file, newDate, oldDate } of plan) {
  const filePath = path.join(POSTS_DIR, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const replaced = content.replace(/^pubDate:\s*\S+/m, `pubDate: ${newDate}`);
  if (replaced === content) {
    throw new Error(`pubDate não encontrado em ${file}`);
  }
  const current = content.match(/^pubDate:\s*(\S+)/m)?.[1];
  if (current !== oldDate) {
    console.warn(`Aviso: ${file} tinha ${current}, plano esperava ${oldDate}`);
  }
  fs.writeFileSync(filePath, replaced, 'utf8');
  updated++;
}

console.log(`Atualizados: ${updated} posts`);
