import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, FileText, BookOpen } from 'lucide-react';

import {
  MIN_SEARCH_QUERY_LENGTH,
  PAGEFIND_RANKING,
  SEARCH_CANDIDATE_LIMIT,
  rankSearchResults,
  type RankedSearchResult,
  type SearchResultCandidate,
} from './search-utils';

declare global {
  interface Window {
    pagefind: any;
  }
}

export const SearchWidget = ({ mobile = false }: { mobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RankedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInitializingSearch, setIsInitializingSearch] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isLoadingScript = useRef(false);
  const activeSearchId = useRef(0);

  const loadPagefind = async () => {
    if (import.meta.env.DEV) {
      setIsInitializingSearch(false);
      setLoadError('La ricerca e disponibile solo nella build preview o production.');
      return;
    }
    if (window.pagefind) {
      setIsScriptLoaded(true);
      setIsInitializingSearch(false);
      setLoadError(null);
      return;
    }
    if (isLoadingScript.current) return;

    isLoadingScript.current = true;
    setIsInitializingSearch(true);
    try {
      const pagefindUrl = "/pagefind/pagefind.js?url";
      // @ts-ignore
      const pagefind = await import(/* @vite-ignore */ pagefindUrl);
      await pagefind.options({
        excerptLength: 22,
        ranking: PAGEFIND_RANKING,
      });
      await pagefind.init();
      window.pagefind = pagefind;
      setIsScriptLoaded(true);
      setLoadError(null);
    } catch (e) {
      window.pagefind = undefined as any;
      setIsScriptLoaded(false);
      setLoadError('Ricerca temporaneamente non disponibile.');
      console.warn("Pagefind not loaded (likely in Dev mode or not built yet).", e);
    } finally {
      setIsInitializingSearch(false);
      isLoadingScript.current = false;
    }
  };

  // Animate in after mount
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH || !window.pagefind) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const searchId = ++activeSearchId.current;
      setIsLoading(true);
      try {
        const search = await window.pagefind.search(trimmedQuery, {
          ranking: PAGEFIND_RANKING,
        });
        const data = await Promise.all(
          search.results.slice(0, SEARCH_CANDIDATE_LIMIT).map(async (result: any) => {
            const payload = await result.data();
            return {
              ...payload,
              score: result.score,
            } satisfies SearchResultCandidate;
          }),
        );

        if (searchId !== activeSearchId.current) return;

        setResults(rankSearchResults(data, trimmedQuery));
      } catch (e) {
        console.error(e);
        if (searchId !== activeSearchId.current) return;
        setResults([]);
      } finally {
        if (searchId === activeSearchId.current) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(handleSearch, 220);
    return () => clearTimeout(timeoutId);
  }, [query, isScriptLoaded]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          loadPagefind();
          setIsOpen(true);
        }}
        onMouseEnter={loadPagefind}
        onFocus={loadPagefind}
        className={`flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 group ${mobile ? 'w-full justify-start py-3 px-4 bg-white/5 hover:bg-white/10' : ''}`}
        aria-label="Cerca"
        aria-controls="site-search-dialog"
        aria-expanded={isOpen}
      >
        <Search className={`text-acid-yellow group-hover:text-acid-yellow/80 transition-colors ${mobile ? 'w-5 h-5' : 'w-5 h-5'}`} />
        <span className={`${mobile ? 'inline text-base' : 'hidden lg:inline text-sm'} font-medium`}>Cerca</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
          <div
            role="presentation"
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: isVisible ? 1 : 0 }}
          />

          <div
            ref={modalRef}
            id="site-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-search-title"
            className="relative w-full max-w-2xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh] transition-all duration-200"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
            }}
          >
            {/* Header / Input */}
            <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-white/5">
              <Search className="w-5 h-5 text-slate-400" />
              <span id="site-search-title" className="sr-only">Ricerca nel sito</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca corsi, articoli, lezioni..."
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg"
              />
              <button
                onClick={handleClose}
                aria-label="Chiudi ricerca"
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Cercando...
                </div>
              ) : isInitializingSearch ? (
                <div className="flex items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Inizializzo la ricerca...
                </div>
              ) : loadError ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-amber-500 mb-2">{loadError}</p>
                  <p className="text-xs">Se il problema persiste, ricostruisci e ripubblica il sito.</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result) => (
                    <a
                      key={result.url}
                      href={result.url}
                      onClick={() => setIsOpen(false)}
                      className="block p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                    >
                      <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {result.kind === 'blog' ? 'Articolo' : result.kind === 'course' ? 'Lezione' : 'Pagina'}
                      </div>
                      <h4 className="text-white font-medium group-hover:text-accent transition-colors mb-1 flex items-center gap-2">
                         {result.url.includes('/blog') ? <FileText className="w-4 h-4 opacity-50"/> : <BookOpen className="w-4 h-4 opacity-50"/>}
                         <span dangerouslySetInnerHTML={{ __html: result.meta.title ?? result.plainTitle }} />
                      </h4>
                      <p
                        className="text-sm text-slate-400 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.displayExcerpt }}
                      />
                    </a>
                  ))}
                </div>
              ) : !isScriptLoaded && !loadError ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-amber-500 mb-2">Indice di ricerca non trovato.</p>
                  <p className="text-xs">Se sei in modalit&agrave; DEV, esegui la build.</p>
                </div>
              ) : query.trim().length >= MIN_SEARCH_QUERY_LENGTH ? (
                <div className="text-center py-12 text-slate-500">
                  Nessun risultato trovato per "{query}"
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Digita almeno {MIN_SEARCH_QUERY_LENGTH} caratteri per cercare tra corsi e articoli...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/5 border-t border-white/10 text-xs text-slate-500 flex justify-between items-center">
              <span>Premi <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/5 text-slate-300 font-sans">ESC</kbd> per chiudere</span>
              <span className="opacity-50">Powered by Pagefind</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
