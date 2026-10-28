export const images = {
  architecture: {
    small: '/images/architecture-640.webp', large: '/images/architecture-1000.webp',
    smallWidth: 640, width: 1000, height: 1250,
    alt: 'Composição arquitetônica com curvas em pedra clara, luz e sombras profundas.',
  },
  'office-editorial': {
    small: '/images/office-editorial-640.webp', large: '/images/office-editorial-1200.webp',
    smallWidth: 640, width: 1200, height: 800,
    alt: 'Ambiente de trabalho iluminado por grandes janelas, em imagem ilustrativa.',
  },
  'civil-editorial': {
    small: '/images/civil-editorial-640.webp', large: '/images/civil-editorial-1200.webp',
    smallWidth: 640, width: 1200, height: 800,
    alt: 'Maquete de imóvel e documentos sobre uma mesa, em composição ilustrativa.',
  },
  'health-editorial': {
    small: '/images/health-editorial-640.webp', large: '/images/health-editorial-1200.webp',
    smallWidth: 640, width: 1200, height: 800,
    alt: 'Estetoscópio e documentos em uma composição ilustrativa sobre a área da saúde.',
  },
  'legal-specialties-hero': {
    small: '/images/legal-specialties-hero-800.webp', large: '/images/legal-specialties-hero-1600.webp',
    smallWidth: 800, width: 1600, height: 900,
    alt: 'Contratos, caneta, maquete residencial e estetoscópio em uma mesa, em imagem ilustrativa das áreas Civil, do Consumidor e Médica.',
  },
  'property-editorial': {
    small: '/images/property-editorial-640.webp', large: '/images/property-editorial-1200.webp',
    smallWidth: 640, width: 1200, height: 800,
    alt: 'Fachada residencial contemporânea com vegetação, em imagem ilustrativa sobre patrimônio imobiliário.',
  },
  'consultation-editorial': {
    small: '/images/consultation-editorial-640.webp', large: '/images/consultation-editorial-1200.webp',
    smallWidth: 640, width: 1200, height: 800,
    alt: 'Mesa de reunião com caderno, caneta e cadeiras, em imagem ilustrativa de atendimento jurídico.',
  },
} as const;

export type ImageKey = keyof typeof images;
