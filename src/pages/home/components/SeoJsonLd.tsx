import { useEffect } from "react";

const siteUrl = import.meta.env.VITE_SITE_URL || "https://emdiafinanceiro.com.br";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "emdia",
  alternateName: ["Em Dia Financeiro", "emdia app"],
  url: siteUrl,
  description:
    "emdia é o app de controle financeiro pessoal com gráficos em tempo real, gestão de despesas, receitas e dívidas. Simples, seguro e inteligente.",
  inLanguage: "pt-BR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "emdia",
  legalName: "Em Dia Financeiro",
  url: siteUrl,
  logo: {
    "@type": "ImageObject",
    "@id": `${siteUrl}/#logo`,
    url: `${siteUrl}/og-image.png`,
    width: 1200,
    height: 630,
    caption: "emdia — Controle Financeiro Pessoal",
  },
  description:
    "Plataforma de controle financeiro pessoal com gestão de despesas, receitas e dívidas. Simples, seguro e inteligente.",
  foundingDate: "2024",
  areaServed: {
    "@type": "Country",
    name: "Brazil",
    sameAs: "https://www.wikidata.org/wiki/Q155",
  },
  knowsLanguage: "pt-BR",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    availableLanguage: "Portuguese",
    areaServed: "BR",
  },
  sameAs: [],
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software`,
  name: "emdia",
  url: siteUrl,
  applicationCategory: "FinanceApplication",
  applicationSubCategory: "Personal Finance",
  operatingSystem: "Web, iOS, Android",
  inLanguage: "pt-BR",
  description:
    "App de controle financeiro pessoal com gráficos em tempo real, gestão de despesas, receitas e dívidas. Simples, seguro e inteligente.",
  screenshot: {
    "@type": "ImageObject",
    url: `${siteUrl}/og-image.png`,
    width: 1200,
    height: 630,
  },
  featureList: [
    "Controle de despesas e receitas",
    "Gestão de dívidas com alertas automáticos",
    "Gráficos em tempo real",
    "Histórico financeiro completo",
    "Exportação CSV",
    "Alertas de vencimento de dívidas",
    "Acesso via navegador sem instalação",
    "Plano gratuito disponível",
    "Sincronização em nuvem",
    "Suporte prioritário no plano Pro",
  ],
  offers: [
    {
      "@type": "Offer",
      name: "Plano Gratuito",
      price: "0",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      description:
        "Até 15 transações por mês, gráfico básico e histórico de 30 dias.",
    },
    {
      "@type": "Offer",
      name: "Plano Pro Mensal",
      price: "9.99",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      description:
        "Transações ilimitadas, histórico completo, exportação CSV e suporte prioritário.",
    },
    {
      "@type": "Offer",
      name: "Plano Pro Anual",
      price: "78.99",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      description:
        "Tudo do plano Pro com desconto de 34% no pagamento anual.",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "10000",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@id": `${siteUrl}/#organization`,
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${siteUrl}/#webpage`,
  url: siteUrl,
  name: "emdia — Controle Financeiro Pessoal | Gestão de Despesas, Receitas e Dívidas",
  description:
    "emdia é o app de controle financeiro pessoal com gráficos em tempo real, gestão de despesas, receitas e dívidas. Simples, seguro e inteligente. Comece grátis hoje.",
  inLanguage: "pt-BR",
  isPartOf: {
    "@id": `${siteUrl}/#website`,
  },
  about: {
    "@type": "Thing",
    name: "Controle Financeiro Pessoal",
    description:
      "Gestão de despesas, receitas e dívidas de forma simples e inteligente.",
  },
  dateModified: "2026-04-04",
  datePublished: "2024-01-01",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: siteUrl,
      },
    ],
  },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${siteUrl}/og-image.png`,
    width: 1200,
    height: 630,
  },
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".hero-description"],
  },
  mainEntity: {
    "@id": `${siteUrl}/#software`,
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "O plano gratuito tem limite de uso?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. No plano gratuito você pode registrar até 15 transações por mês e visualizar os últimos 30 dias de histórico.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o gráfico de pizza?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Assim que você registrar suas receitas, despesas e dívidas, o app gera automaticamente um gráfico de pizza mostrando sua situação financeira do mês em tempo real.",
      },
    },
    {
      "@type": "Question",
      name: "Posso cancelar a qualquer momento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, sem burocracia. Se você assinar o plano mensal, pode cancelar quando quiser e continua com acesso até o fim do período pago. No plano anual, oferecemos 7 dias de garantia total.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso instalar alguma coisa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não! O emdia roda direto no navegador do seu celular ou computador. Não ocupa espaço no seu dispositivo e está sempre atualizado.",
      },
    },
    {
      "@type": "Question",
      name: "Meus dados financeiros ficam seguros?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Com certeza. Os dados são criptografados, ficam salvos na nuvem de forma segura e nunca são compartilhados com terceiros.",
      },
    },
    {
      "@type": "Question",
      name: "Como é feito o pagamento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aceitamos cartão de crédito, débito e Pix. O pagamento é processado de forma segura pelo Stripe.",
      },
    },
    {
      "@type": "Question",
      name: "O emdia funciona no celular?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! O emdia é totalmente responsivo e funciona perfeitamente em qualquer dispositivo — celular, tablet ou computador — sem precisar instalar nada.",
      },
    },
    {
      "@type": "Question",
      name: "Como faço para começar a usar o emdia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "É simples! Clique em 'Acessar o App', crie sua conta gratuitamente e comece a registrar suas transações imediatamente. Em poucos minutos você já tem uma visão completa das suas finanças.",
      },
    },
    {
      "@type": "Question",
      name: "O emdia ajuda no controle de dívidas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim! O emdia possui um módulo completo de gestão de dívidas com alertas automáticos para vencimentos, ajudando você a manter o controle financeiro e evitar juros.",
      },
    },
    {
      "@type": "Question",
      name: "Posso exportar meus dados financeiros?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim, no plano Pro você pode exportar todo o seu histórico financeiro em formato CSV para análise em planilhas ou outros softwares.",
      },
    },
  ],
};

const schemas = [
  websiteSchema,
  organizationSchema,
  softwareSchema,
  webPageSchema,
  faqSchema,
];

export default function SeoJsonLd() {
  useEffect(() => {
    schemas.forEach((schema, index) => {
      const id = `jsonld-home-${index}`;
      let el = document.getElementById(id) as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement("script");
        el.id = id;
        el.type = "application/ld+json";
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    });

    return () => {
      schemas.forEach((_, index) => {
        const el = document.getElementById(`jsonld-home-${index}`);
        if (el) el.remove();
      });
    };
  }, []);

  return null;
}
