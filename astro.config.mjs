// @ts-check
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeSlug from 'rehype-slug';
import { rehypeExternalDofollow } from './src/plugins/rehype-external-dofollow.mjs';

import sitemap from '@astrojs/sitemap';
import { buildPostLastmodMap } from './src/plugins/sitemap-lastmod.mjs';

const postLastmod = buildPostLastmodMap();
const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://hotmoney.blog.br',
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // global.css via BaseLayout (~7.5 KiB) fica acima do limite padrão de 4 KiB
      assetsInlineLimit: 8192,
    },
  },
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug, rehypeExternalDofollow],
      remarkRehype: true,
      gfm: true,
      smartypants: true,
    }),
  },
  integrations: [
    sitemap({
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        item.lastmod = postLastmod.get(pathname) ?? buildDate;
        return item;
      },
    }),
  ],
});