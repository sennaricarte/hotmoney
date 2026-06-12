export const categories = [
  {
    slug: 'servicos',
    name: 'Serviços',
    description:
      'Ideias e guias para ganhar dinheiro prestando serviços locais, manutenção e trabalhos práticos.',
  },
  {
    slug: 'internet',
    name: 'Internet',
    description:
      'Estratégias para faturar online com apps, marketing digital, plataformas e negócios na web.',
  },
  {
    slug: 'ia',
    name: 'IA',
    description:
      'Como usar inteligência artificial e ferramentas como ChatGPT para gerar renda extra.',
  },
  {
    slug: 'investimentos',
    name: 'Investimentos',
    description:
      'Educação financeira, cashback, afiliados e caminhos para fazer seu dinheiro render.',
  },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

export const categorySlugs: CategorySlug[] = categories.map((c) => c.slug);

export function getCategory(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)!;
}

export function getCategoryName(slug: CategorySlug): string {
  return getCategory(slug).name;
}

export function getCategoryHref(slug: CategorySlug): string {
  return `/categoria/${slug}`;
}
