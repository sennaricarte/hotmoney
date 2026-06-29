export interface ContentHub {
  path: `/${string}`;
  name: string;
  spokes: ReadonlySet<string>;
  /** Pilares em construção: noindex + fora do sitemap até 3+ spokes. */
  noindex?: boolean;
}

export const RENDA_EXTRA_HUB: ContentHub = {
  path: '/renda-extra',
  name: 'Renda Extra',
  spokes: new Set([
    'pesquisas-remuneradas-que-pagam-via-pix',
    'renda-extra-com-aplicativos-guia-completo',
    'plataformas-que-pagam-de-verdade',
    'como-ganhar-dinheiro-na-internet-guia-completo',
    'renda-extra-nao-e-magica',
    'renda-extra-para-aposentados-em-casa',
    'como-monetizar-um-hobby-guia-completo',
    'renda-extra-com-hobbies',
  ]),
};

export const FINANCAS_PESSOAIS_HUB: ContentHub = {
  path: '/financas-pessoais',
  name: 'Finanças Pessoais',
  spokes: new Set(['o-que-e-cashback', 'consorcio-de-carro', 'reserva-de-emergencia']),
  noindex: true,
};

export const EMPREENDEDORISMO_DIGITAL_HUB: ContentHub = {
  path: '/empreendedorismo-digital',
  name: 'Empreendedorismo Digital',
  spokes: new Set([
    'negocios-lucrativos-pouco-investimento',
    'prompt-engineer-freelancer-chatgpt-99freelas',
    'como-abrir-mei',
  ]),
  noindex: true,
};

export const CONTENT_HUBS: ContentHub[] = [
  RENDA_EXTRA_HUB,
  FINANCAS_PESSOAIS_HUB,
  EMPREENDEDORISMO_DIGITAL_HUB,
];

/** Pilares excluídos do sitemap (noindex até ter 3+ spokes). */
export const SITEMAP_EXCLUDED_PATHS = new Set(
  CONTENT_HUBS.filter((hub) => hub.noindex).map((hub) => hub.path),
);

export function getHubForPost(postId: string): ContentHub | undefined {
  return CONTENT_HUBS.find((hub) => hub.spokes.has(postId));
}
