import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/content/posts';
const exclude = new Set([
  'hidrojateamento.md',
  'marido-de-aluguel.md',
  'como-transformar-vazamentos-em-uma-fonte-de-renda.md',
  'como-viver-de-contratos-de-manutencao-preventiva-de-esgoto.md',
  'renda-extra-com-dedetizacao-caseira.md',
]);

const changed = [];

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.md') || exclude.has(file)) continue;

  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  content = content.replace(
    /https:\/\/(?:www\.)?hotmoney\.blog\.br\/([^)\s"']+?)\/(?=[)"'\s])/g,
    'https://hotmoney.blog.br/$1',
  );
  content = content.replace(/\]\(\/([^)]+)\/\)/g, '](/$1)');

  if (content !== original) {
    fs.writeFileSync(fp, content);
    changed.push(file);
  }
}

console.log(`Changed ${changed.length} files:`);
for (const file of changed) console.log(`  ${file}`);
