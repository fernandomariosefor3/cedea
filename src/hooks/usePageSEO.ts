import { useEffect } from "react";

const siteUrl = import.meta.env.VITE_SITE_URL || "https://emdiafinanceiro.com.br";

interface SEOOptions {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  canonicalPath?: string;
}

export function usePageSEO({
  title,
  description,
  keywords,
  ogImage = "/og-image.png",
  ogType = "website",
  robots = "index, follow",
  canonicalPath = "",
}: SEOOptions) {
  useEffect(() => {
    const fullUrl = `${siteUrl}${canonicalPath}`;

    document.title = title;

    const setMeta = (
      attr: string,
      attrValue: string,
      content: string,
      tag = "meta"
    ) => {
      let el = document.querySelector(
        `${tag}[${attr}="${attrValue}"]`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("name", "robots", robots);
    setMeta("name", "last-modified", new Date().toISOString().slice(0, 10));

    // Canonical
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", `${siteUrl}${ogImage}`);
    setMeta("property", "og:locale", "pt_BR");
    setMeta("property", "og:site_name", "emdia");

    // Twitter
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", `${siteUrl}${ogImage}`);
  }, [title, description, keywords, ogImage, ogType, robots, canonicalPath]);
}