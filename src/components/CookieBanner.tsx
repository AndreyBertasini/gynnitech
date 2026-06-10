import { useEffect, useState } from 'react';

export const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        if (typeof window !== 'undefined') {
            window.gtag?.('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }

        localStorage.setItem('cookie-consent', 'granted');
        window.dispatchEvent(new CustomEvent('ginnytech:analytics-consent-granted'));
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'denied');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[var(--sl-color-bg)]/95 px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in duration-500 sm:px-5 sm:py-4 md:px-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl flex-1 text-xs leading-relaxed text-slate-300 sm:text-sm">
                    <p className="mb-1 text-sm font-bold text-white sm:text-base">Privacy & Cookie Policy</p>
                    <p>
                        Utilizziamo cookie tecnici e di analisi per migliorare l'esperienza e capire come viene usato il corso.
                        Rispettiamo la tua privacy: il tracciamento si attiva solo con il tuo consenso.
                        <a href="/privacy" className="ml-1 text-[#ccff00] underline transition-colors hover:text-[#e6ff66]">Leggi la policy completa.</a>
                    </p>
                </div>

                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
                    <button
                        onClick={handleDecline}
                        className="min-h-10 rounded-md border border-white/10 px-5 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-white/5 sm:min-w-28"
                    >
                        Rifiuta
                    </button>
                    <button
                        onClick={handleAccept}
                        className="min-h-10 rounded-md bg-[#ccff00] px-5 py-2 text-sm font-bold text-[#08090d] shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all hover:bg-[#b3e600] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] sm:min-w-32"
                    >
                        Accetta Tutto
                    </button>
                </div>
            </div>
        </div>
    );
};
