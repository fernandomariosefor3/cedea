import { useEffect } from "react";

const siteUrl = import.meta.env.VITE_SITE_URL || "https://emdiafinanceiro.com.br";

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${siteUrl}/auth#webpage`,
  url: `${siteUrl}/auth`,
  name: "Acessar emdia — Login e Cadastro Grátis",
  description:
    "Entre ou crie sua conta grátis no emdia para começar a controlar despesas, receitas e dívidas. Controle financeiro pessoal simples e inteligente.",
  inLanguage: "pt-BR",
  isPartOf: {
    "@id": `${siteUrl}/#website`,
  },
  about: {
    "@type": "Thing",
    name: "Controle Financeiro Pessoal",
    description: "Acesso ao aplicativo de gestão financeira pessoal emdia.",
  },
  dateModified: new Date().toISOString().slice(0, 10),
  datePublished: "2024-01-01",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Acessar", item: `${siteUrl}/auth` },
    ],
  },
  publisher: {
    "@id": `${siteUrl}/#organization`,
  },
};

export default function SeoJsonLd() {
  useEffect(() => {
    const id = "jsonld-auth";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(webPageSchema);

    return () => {
      const old = document.getElementById(id);
      if (old) old.remove();
    };
  }, []);

  return null;
}