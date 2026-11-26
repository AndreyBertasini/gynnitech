import React, { useEffect, useState } from 'react';
import {
  applyDocumentLanguage,
  currentSiteLanguage,
  declaredAlternateHref,
  type SiteLanguage,
} from '../utils/language';

// Il link all'altra lingua appare solo se la pagina dichiara una coppia hreflang reale
// (traduzione rivista). Nell'HTML statico c'è soltanto la lingua corrente: niente link
// /en/... verso pagine che risponderebbero 301.
export default function LanguageSwitcher({ className = '', initialLanguage }: { className?: string; initialLanguage?: SiteLanguage }) {
  const [language, setLanguage] = useState<SiteLanguage>(() => initialLanguage ?? currentSiteLanguage());
  const [hrefs, setHrefs] = useState<{ it?: string; en?: string }>({});

  useEffect(() => {
    const detectedLanguage = currentSiteLanguage();
    setLanguage(detectedLanguage);
    applyDocumentLanguage(detectedLanguage);
    setHrefs({ it: declaredAlternateHref('it'), en: declaredAlternateHref('en') });
  }, []);

  const pill = (target: SiteLanguage, label: string, ariaLabel: string) => {
    const base = 'flex h-7 min-w-8 items-center justify-center rounded-full px-2 transition';
    if (language === target) {
      return (
        <span
          data-language-target={target}
          className={`${base} ${target === 'en' ? 'bg-accent' : 'bg-white'} text-slate-950`}
          aria-current="page"
        >
          {label}
        </span>
      );
    }
    const href = hrefs[target];
    if (!href) return null;
    return (
      <a
        href={href}
        hrefLang={target}
        data-language-target={target}
        className={`${base} text-slate-300 hover:bg-white/10 hover:text-white`}
        aria-label={ariaLabel}
      >
        {label}
      </a>
    );
  };

  return (
    <div
      className={`notranslate inline-flex h-9 items-center rounded-full border border-white/12 bg-white/5 p-1 text-xs font-semibold text-slate-300 shadow-sm shadow-black/10 backdrop-blur ${className}`}
      aria-label={language === 'en' ? 'Language' : 'Lingua'}
      translate="no"
    >
      {pill('it', 'IT', 'Mostra la pagina in italiano')}
      {pill('en', 'EN', 'Show this page in English')}
    </div>
  );
}
