import {
  SITE_AUTHOR_NAME,
  SITE_AUTHOR_PATH,
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
} from '../data/site';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getOrganizationSchema(site: URL | string) {
  const siteUrl = new URL('/', site).href;

  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: new URL(SITE_LOGO_PATH, site).href,
    },
  };
}

export function getWebSiteSchema(site: URL | string) {
  const siteUrl = new URL('/', site).href;
  const publisher = getOrganizationSchema(site);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    description: SITE_DESCRIPTION,
    inLanguage: 'pt-BR',
    publisher,
  };
}

export function getOrganizationJsonLd(site: URL | string) {
  return {
    '@context': 'https://schema.org',
    ...getOrganizationSchema(site),
  };
}

export function getBlogPostingSchema(options: {
  site: URL | string;
  title: string;
  description: string;
  canonical: string;
  imageUrl: string;
  pubDate: Date;
  updatedDate?: Date;
}) {
  const { site, title, description, canonical, imageUrl, pubDate, updatedDate } = options;
  const publisher = getOrganizationSchema(site);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: imageUrl,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    inLanguage: 'pt-BR',
    author: {
      '@type': 'Person',
      name: SITE_AUTHOR_NAME,
      url: new URL(SITE_AUTHOR_PATH, site).href,
    },
    publisher,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
