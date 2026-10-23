export const images = {
  architecture: {
    small: '/images/architecture-640.webp', large: '/images/architecture-1000.webp',
    width: 1000, height: 1250,
    alt: 'Composição arquitetônica com curvas em pedra clara, luz e sombras profundas.',
  },
  'office-editorial': {
    small: '/images/office-editorial-640.webp', large: '/images/office-editorial-1200.webp',
    width: 1200, height: 800,
    alt: 'Ambiente de trabalho iluminado por grandes janelas, em imagem ilustrativa.',
  },
  'civil-editorial': {
    small: '/images/civil-editorial-640.webp', large: '/images/civil-editorial-1200.webp',
    width: 1200, height: 800,
    alt: 'Maquete de imóvel e documentos sobre uma mesa, em composição ilustrativa.',
  },
  'health-editorial': {
    small: '/images/health-editorial-640.webp', large: '/images/health-editorial-1200.webp',
    width: 1200, height: 800,
    alt: 'Estetoscópio e documentos em uma composição ilustrativa sobre a área da saúde.',
  },
} as const;

export type ImageKey = keyof typeof images;
