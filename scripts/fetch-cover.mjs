/**
 * Busca e baixa capa de artigo via API do Pexels.
 *
 * Uso:
 *   node scripts/fetch-cover.mjs --slug=meu-artigo --query="impressora 3d trabalho"
 *
 * Requer PEXELS_API_KEY no ambiente ou em .env na raiz do projeto.
 * Saída: src/assets/posts/<slug>/cover.jpg
 *
 * Chave gratuita: https://www.pexels.com/api/ → "Get Started" → copie a API Key.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGET_RATIO = 16 / 9;
const MIN_WIDTH = 1200;
const MAX_DOWNLOAD_WIDTH = 1600;

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { slug: '', query: '' };

  for (const arg of argv) {
    if (arg.startsWith('--slug=')) {
      args.slug = arg.slice('--slug='.length).trim();
    } else if (arg.startsWith('--query=')) {
      args.query = arg.slice('--query='.length).trim();
    }
  }

  return args;
}

function fail(message) {
  console.error(`Erro: ${message}`);
  process.exit(1);
}

function aspectRatioDistance(width, height) {
  return Math.abs(width / height - TARGET_RATIO);
}

function pickPhoto(photos) {
  const eligible = photos.filter((photo) => photo.width >= MIN_WIDTH);
  if (eligible.length === 0) return null;

  return eligible.sort((a, b) => {
    const ratioDiff = aspectRatioDistance(a.width, a.height) - aspectRatioDistance(b.width, b.height);
    if (ratioDiff !== 0) return ratioDiff;
    return b.width - a.width;
  })[0];
}

function pickDownloadUrl(photo) {
  const { src, width } = photo;
  const order =
    width > MAX_DOWNLOAD_WIDTH
      ? ['large2x', 'large', 'landscape', 'medium']
      : ['large2x', 'large', 'landscape', 'original'];

  for (const key of order) {
    if (src[key]) return { url: src[key], variant: key };
  }

  return null;
}

async function searchPexels(apiKey, query) {
  const params = new URLSearchParams({
    query,
    orientation: 'landscape',
    per_page: '5',
    locale: 'pt-BR',
  });

  const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    const body = await response.text();
    fail(`API Pexels retornou ${response.status}. ${body || 'Sem detalhes.'}`);
  }

  return response.json();
}

async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) {
    fail(`Falha ao baixar imagem (${response.status}): ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

loadDotEnv();

const { slug, query } = parseArgs(process.argv.slice(2));

if (!slug) fail('Informe --slug=<nome-do-post> (ex.: --slug=renda-extra-impressao-3d).');
if (!query) fail('Informe --query=<termo de busca> (ex.: --query="impressora 3d trabalho").');

const apiKey = process.env.PEXELS_API_KEY?.trim();
if (!apiKey) {
  fail(
    'PEXELS_API_KEY não definida. Crie um arquivo .env na raiz com PEXELS_API_KEY=sua_chave ou exporte a variável no terminal.',
  );
}

let data;
try {
  data = await searchPexels(apiKey, query);
} catch (error) {
  fail(`Falha na requisição à API: ${error instanceof Error ? error.message : String(error)}`);
}

const photos = data.photos ?? [];
if (photos.length === 0) {
  fail(`Nenhum resultado para a busca "${query}". Tente outro termo.`);
}

const photo = pickPhoto(photos);
if (!photo) {
  fail(
    `Nenhuma foto em landscape com largura >= ${MIN_WIDTH}px entre os ${photos.length} resultados. Tente outra query.`,
  );
}

const download = pickDownloadUrl(photo);
if (!download) {
  fail('A foto selecionada não possui URL de download utilizável.');
}

const outputDir = path.join(ROOT, 'src', 'assets', 'posts', slug);
const outputPath = path.join(outputDir, 'cover.jpg');

let imageBuffer;
try {
  imageBuffer = await downloadImage(download.url);
} catch (error) {
  fail(`Falha no download: ${error instanceof Error ? error.message : String(error)}`);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, imageBuffer);

const relativePath = path.relative(ROOT, outputPath).replace(/\\/g, '/');

console.log('Capa salva com sucesso.');
console.log(`  Arquivo:     ${relativePath}`);
console.log(`  Dimensões:   ${photo.width}×${photo.height}px (original na Pexels)`);
console.log(`  Variante:    ${download.variant}`);
console.log(`  Fotógrafo:   ${photo.photographer}`);
console.log(`  URL Pexels:  ${photo.url}`);
