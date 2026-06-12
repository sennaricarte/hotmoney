/**
 * Remove marcação Markdown do campo description no frontmatter dos posts.
 *
 * Uso:
 *   node scripts/clean-descriptions.mjs          # preview (diff, não salva)
 *   node scripts/clean-descriptions.mjs --apply  # aplica alterações
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const MAX_LENGTH = 155;
const APPLY = process.argv.includes('--apply');

function stripMarkdown(text) {
  let result = text;

  // Links: [texto](url) ou [texto][ref]
  result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  result = result.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

  // Imagens: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Negrito / itálico (ordem: mais longo primeiro)
  result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
  result = result.replace(/__([^_]+)__/g, '$1');
  result = result.replace(/\*([^*]+)\*/g, '$1');
  result = result.replace(/_([^_]+)_/g, '$1');

  // Código inline
  result = result.replace(/`([^`]+)`/g, '$1');

  // Headings e blockquote no início
  result = result.replace(/^#{1,6}\s+/gm, '');
  result = result.replace(/^>\s?/gm, '');

  // Marcação órfã (descriptions importadas cortadas no meio de ** ou `)
  result = result.replace(/\*\*/g, '');
  result = result.replace(/__/g, '');
  result = result.replace(/`/g, '');

  // Colapsa espaços
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

function endsWithSentence(text) {
  return /[.!?…]$/.test(text);
}

function truncateDescription(text) {
  if (text.length <= MAX_LENGTH && endsWithSentence(text)) {
    return text;
  }

  if (text.length > MAX_LENGTH) {
    const chunk = text.slice(0, MAX_LENGTH);
    const lastSentence = Math.max(
      chunk.lastIndexOf('. '),
      chunk.lastIndexOf('! '),
      chunk.lastIndexOf('? '),
    );

    if (lastSentence >= Math.floor(MAX_LENGTH * 0.45)) {
      return chunk.slice(0, lastSentence + 1).trim();
    }

    const cutAt = chunk.lastIndexOf(' ');
    const base = cutAt > 0 ? chunk.slice(0, cutAt) : chunk.slice(0, MAX_LENGTH - 3);
    return `${base.trim()}...`;
  }

  // Dentro do limite, mas sem pontuação final — tenta fechar na última frase completa
  const lastSentence = Math.max(text.lastIndexOf('. '), text.lastIndexOf('! '), text.lastIndexOf('? '));

  if (lastSentence >= 40) {
    return text.slice(0, lastSentence + 1).trim();
  }

  if (endsWithSentence(text)) {
    return text;
  }

  return `${text}...`;
}

function parseDescriptionLine(line) {
  const match = line.match(/^description:\s*(.+)$/);
  if (!match) return null;

  const raw = match[1].trim();
  if (raw.startsWith('"') && raw.endsWith('"')) {
    return raw
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return raw.slice(1, -1);
  }
  return raw;
}

function formatDescriptionLine(value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `description: "${escaped}"`;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const frontmatterMatch = original.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return null;

  const lines = frontmatterMatch[1].split(/\r?\n/);
  const descIndex = lines.findIndex((line) => line.startsWith('description:'));
  if (descIndex === -1) return null;

  const before = parseDescriptionLine(lines[descIndex]);
  if (before === null) return null;

  const after = truncateDescription(stripMarkdown(before));
  if (before === after) return null;

  const updatedLines = [...lines];
  updatedLines[descIndex] = formatDescriptionLine(after);
  const updatedFrontmatter = updatedLines.join('\n');
  const updated = original.replace(
    /^---\r?\n[\s\S]*?\r?\n---/,
    `---\n${updatedFrontmatter}\n---`,
  );

  return { before, after, updated };
}

const files = fs
  .readdirSync(POSTS_DIR)
  .filter((name) => name.endsWith('.md'))
  .sort();

const changes = [];

for (const file of files) {
  const result = processFile(path.join(POSTS_DIR, file));
  if (result) {
    changes.push({ file, ...result });
  }
}

if (changes.length === 0) {
  console.log('Nenhuma description precisa de alteração.');
  process.exit(0);
}

console.log(`${changes.length} description(s) serão alteradas:\n`);

for (const { file, before, after } of changes) {
  console.log(`## ${file}`);
  console.log(`- ANTES (${before.length}): ${before}`);
  console.log(`+ DEPOIS (${after.length}): ${after}`);
  console.log('');
}

if (APPLY) {
  for (const { file, updated } of changes) {
    fs.writeFileSync(path.join(POSTS_DIR, file), updated, 'utf8');
  }
  console.log(`Aplicado em ${changes.length} arquivo(s).`);
} else {
  console.log('Modo preview. Rode com --apply para salvar as alterações.');
}
