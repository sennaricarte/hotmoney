import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getCategoryName } from '../data/categories';
import { SITE_DESCRIPTION } from '../data/site';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: 'Hotmoney — Renda Extra',
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: '<language>pt-BR</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${post.id}`,
      categories: [getCategoryName(post.data.category)],
    })),
  });
}
