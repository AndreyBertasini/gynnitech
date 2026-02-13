import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, FileText, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    pagefind: any;
  }
}

export const SearchWidget = ({ mobile = false }: { mobile?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoadingScript = useRef(false);

  const loadPagefind = async () => {
    if (import.meta.env.DEV) {
      return;
    }
    if (window.pagefind) {
      setIsScriptLoaded(true);
      return;
    }
    if (isLoadingScript.current) return;

    isLoadingScript.current = true;
    try {
      const pagefindUrl = "/pagefind/pagefind.js?url";
      // @ts-ignore
      const pagefind = await import(/* @vite-ignore */ pagefindUrl);
      await pagefind.init();
      window.pagefind = pagefind;
      setIsScriptLoaded(true);
    } catch (e) {
      console.warn("Pagefind not loaded (likely in Dev mode or not built yet).", e);
    } finally {
      isLoadingScript.current = false;
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (!query.trim() || !window.pagefind) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const search = await window.pagefind.search(query);
        const data = await Promise.all(search.results.slice(0, 5).map((r: any) => r.data()));
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
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
      >
        <Search className={`text-acid-yellow group-hover:text-acid-yellow/80 transition-colors ${mobile ? 'w-5 h-5' : 'w-5 h-5'}`} />
        <span className={`${mobile ? 'inline text-base' : 'hidden lg:inline text-sm'} font-medium`}>Cerca</span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header / Input */}
              <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-white/5">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca corsi, articoli, lezioni..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-lg"
                />
                <button
                  onClick={() => setIsOpen(false)}
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
                ) : results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result, idx) => (
                      <a
                        key={idx}
                        href={result.url}
                        onClick={() => setIsOpen(false)}
                        className="block p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                      >
                        <h4 className="text-white font-medium group-hover:text-neon-blue transition-colors mb-1 flex items-center gap-2">
                           {result.url.includes('/blog') ? <FileText className="w-4 h-4 opacity-50"/> : <BookOpen className="w-4 h-4 opacity-50"/>}
                           <span dangerouslySetInnerHTML={{ __html: result.meta.title }} />
                        </h4>
                        <p 
                          className="text-sm text-slate-400 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: result.excerpt }} 
                        />
                      </a>
                    ))}
                  </div>
                ) : !isScriptLoaded ? (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-amber-500 mb-2">⚠️ Indice di ricerca non trovato.</p>
                    <p className="text-xs">Se sei in modalità DEV, esegui la build.</p>
                  </div>
                ) : query.length > 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    Nessun risultato trovato per "{query}"
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    Digita per cercare tra corsi e blog...
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-white/5 border-t border-white/10 text-xs text-slate-500 flex justify-between items-center">
                <span>Premi <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/5 text-slate-300 font-sans">ESC</kbd> per chiudere</span>
                <span className="opacity-50">Powered by Pagefind</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
