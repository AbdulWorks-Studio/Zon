import { useEffect } from 'react';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function Seo({
  title,
  description,
  path = '/',
  keywords,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
}) {
  useEffect(() => {
    document.title = title;
    upsertMeta('name', 'description', description);
    if (keywords) upsertMeta('name', 'keywords', keywords);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);

    // Canonical-ish path hint (relative; hosts may rewrite)
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    try {
      link.href = new URL(path, window.location.origin).toString();
    } catch {
      link.href = path;
    }
  }, [title, description, path, keywords]);

  return null;
}
