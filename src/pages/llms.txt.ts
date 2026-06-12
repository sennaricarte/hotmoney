import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_AUTHOR_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_PURPOSE } from '../data/site';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = new URL('/', site).href.replace(/\/$/, '');
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const articleLines = posts.map((post) => {
    const url = `${baseUrl}/${post.id}`;
    return `- [${post.data.title}](${url}): ${post.data.description}`;
  });

  const pages = [
    {
      title: 'Sobre',
      url: `${baseUrl}/sobre`,
      description: `Conheça ${SITE_AUTHOR_NAME}, criador do Hotmoney, e a missão do blog sobre renda extra com responsabilidade.`,
    },
    {
      title: 'Perguntas frequentes',
      url: `${baseUrl}/#faq-heading`,
      description: 'Respostas objetivas sobre renda extra, impostos, plataformas e como começar sem investimento alto.',
    },
    {
      title: 'Blog',
      url: `${baseUrl}/blog`,
      description: 'Listagem completa dos artigos sobre serviços, internet, IA e investimentos.',
    },
  ];

  const pageLines = pages.map((page) => `- [${page.title}](${page.url}): ${page.description}`);

  const body = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION} Autor: ${SITE_AUTHOR_NAME}.`,
    '',
    SITE_PURPOSE,
    '',
    '## Artigos',
    '',
    ...articleLines,
    '',
    '## Páginas',
    '',
    ...pageLines,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
