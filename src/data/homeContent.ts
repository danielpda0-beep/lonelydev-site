// src/data/homeContent.ts
// Regra 10.9: O conteúdo é escrito uma vez só.
// Os temas em src/themes/ consomem estes dados sem hardcoded copy.

export interface PilarContent {
  id: string;
  titulo: string;
  destaque: boolean;
  resumo: string;
  link: string;
  badge?: string;
}

export interface PassoContent {
  n: string;
  titulo: string;
  texto: string;
}

export interface TeaserPortfolioItem {
  titulo: string;
  status: string;
  texto: string;
}

export interface HomeContent {
  hero: {
    eyebrow: string;
    tagline: string;
    lead: string;
    ctaTexto: string;
    ctaHref: string;
  };
  telemetria: {
    escopo: string;
    preco: string;
    prazo: string;
    semMensalidade: string;
    semLockin: string;
  };
  pilares: PilarContent[];
  pilaresTitulo: string;
  pilaresCta: string;
  passos: PassoContent[];
  passosTitulo: string;
  passosLinkTexto: string;
  passosLinkHref: string;
  pacotesInfo: {
    titulo: string;
    intro: string;
    ordem: string[];
  };
  portfolio: {
    titulo: string;
    itens: TeaserPortfolioItem[];
    ctaTexto: string;
    ctaHref: string;
  };
  ctaFinal: {
    titulo: string;
    texto: string;
    ctaTexto: string;
    ctaHref: string;
  };
}

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'Lonely Dev',
    tagline: 'Resolvo seu problema, materializo sua ideia.',
    lead: 'Projeto com começo, meio e fim: escopo fechado, preço único, data de entrega. Sem mensalidade, sem lock-in.',
    ctaTexto: 'Pedir orçamento',
    ctaHref: '/contato',
  },
  telemetria: {
    escopo: 'Escopo 100% Fechado',
    preco: 'Preço Único & Fixo',
    prazo: 'Data de Entrega Travada',
    semMensalidade: 'Zero Mensalidade',
    semLockin: 'Zero Lock-in (Nada no meu PC)',
  },
  pilaresTitulo: 'O que eu faço',
  pilaresCta: 'Ver serviços',
  pilares: [
    {
      id: 'automacao-ia',
      titulo: 'Automação & IA',
      destaque: true,
      badge: 'Carro-chefe',
      resumo: 'Bots, monitores de portal, extração de dados e integrações com IA. O trabalho que hoje consome horas vira um projeto pontual, com entrega e fim.',
      link: '/servicos#automacao-ia',
    },
    {
      id: 'midia-ia',
      titulo: 'Mídia com IA',
      destaque: false,
      resumo: 'Vídeo institucional curto e imagens sob medida, produzidos com IA e revisados por um humano.',
      link: '/servicos#midia-ia',
    },
    {
      id: 'web-apps',
      titulo: 'Web & Apps',
      destaque: false,
      resumo: 'Landing pages, sistemas no navegador e apps simples de celular — um entregável, um preço, uma data.',
      link: '/servicos#web-apps',
    },
    {
      id: 'jogos',
      titulo: 'Jogos',
      destaque: false,
      resumo: 'Jogos casual sob medida e visual novel de roteiro. Sempre projeto fechado, nunca produto na prateleira.',
      link: '/servicos#jogos',
    },
  ],
  passosTitulo: 'Como funciona',
  passosLinkTexto: 'Ver o processo completo',
  passosLinkHref: '/como-funciona',
  passos: [
    {
      n: '01',
      titulo: 'Briefing',
      texto: 'Você conta o problema. Eu devolvo o que dá pra fazer — e o que não dá.',
    },
    {
      n: '02',
      titulo: 'Orçamento fechado',
      texto: 'Preço único, prazo definido, escopo por escrito. Sem mensalidade e sem lock-in.',
    },
    {
      n: '03',
      titulo: 'Entrega',
      texto: 'Você recebe o projeto funcionando. Nada fica rodando no meu computador depois.',
    },
  ],
  pacotesInfo: {
    titulo: 'Pacotes de preço fixo',
    intro: 'Cinco entregas produtizadas. Uma rodada de ajuste inclusa em cada uma.',
    ordem: [
      'landing-page-rapida',
      'video-ia-curto',
      'bot-monitor-portal',
      'extrator-dados-relatorio',
      'app-mobile-simples',
    ],
  },
  portfolio: {
    titulo: 'Portfólio',
    itens: [
      {
        titulo: 'Vídeo com IA',
        status: 'Em breve',
        texto: 'Peças originais em vídeo (institucional, narrativa, comercial fictício). Produção em andamento.',
      },
      {
        titulo: 'Imagem com IA',
        status: 'Em breve',
        texto: 'Amostras de ilustração e mockup geradas com IA, pra mostrar o tipo de resultado — sem case de cliente.',
      },
    ],
    ctaTexto: 'Ver portfólio',
    ctaHref: '/portfolio',
  },
  ctaFinal: {
    titulo: 'Tem um problema pontual?',
    texto: 'Conta o que você precisa. Eu respondo em até 1 dia útil com o que dá pra fazer.',
    ctaTexto: 'Entrar em contato',
    ctaHref: '/contato',
  },
};
