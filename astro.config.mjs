// @ts-check
import { unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeSlug from 'rehype-slug';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://hotmoney.blog.br',
  trailingSlash: 'never',
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug],
      remarkRehype: true,
      gfm: true,
      smartypants: true,
    }),
  },
  integrations: [sitemap()],
});