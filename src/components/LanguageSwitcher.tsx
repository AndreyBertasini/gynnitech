import React, { useEffect, useState } from 'react';
import {
  applyDocumentLanguage,
  currentLocalizedHref,
  currentSiteLanguage,
  type SiteLanguage,
} from '../utils/language';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const [language, setLanguage] = useState<SiteLanguage>(() => currentSiteLanguage());
  const [hrefs, setHrefs] = useState(() => ({
    it: currentLocalizedHref('it'),
    en: currentLocalizedHref('en'),
  }));

  useEffect(() => {
    const detectedLanguage = currentSiteLanguage();
    setLanguage(detectedLanguage);
    applyDocumentLanguage(detectedLanguage);
    setHrefs({
      it: currentLocalizedHref('it'),
      en: currentLocalizedHref('en'),
    });
  }, []);

  return (
    <div
      className={`notranslate inline-flex h-9 items-center rounded-full border border-white/12 bg-white/5 p-1 text-xs font-semibold text-slate-300 shadow-sm shadow-black/10 backdrop-blur ${className}`}
      aria-label="Selettore lingua"
      translate="no"
    >
      <a
        href={hrefs.it}
        data-language-target="it"
        className={`flex h-7 min-w-8 items-center justify-center rounded-full px-2 transition ${
          language === 'it'
            ? 'bg-white text-slate-950'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        aria-current={language === 'it' ? 'page' : undefined}
        aria-label="Mostra il sito in italiano"
      >
        IT
      </a>
      <a
        href={hrefs.en}
        data-language-target="en"
        className={`flex h-7 min-w-8 items-center justify-center rounded-full px-2 transition ${
          language === 'en'
            ? 'bg-emerald-300 text-slate-950'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
        aria-current={language === 'en' ? 'page' : undefined}
        aria-label="Show the site in English"
      >
        EN
      </a>
    </div>
  );
}
