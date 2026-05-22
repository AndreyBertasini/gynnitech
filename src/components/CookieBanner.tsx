import React, { useState, useEffect } from 'react';

export const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        // Update Google Consent Mode
        if (typeof window !== 'undefined' && ((window as any).gtag)) {
            (window as any).gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted'
            });
        }

        // Save choice
        localStorage.setItem('cookie-consent', 'granted');
        window.dispatchEvent(new CustomEvent('ginnytech:analytics-consent-granted'));
        setShowBanner(false);
    };

    const handleDecline = () => {
        // Choice acts as "denied" (default state), just hide banner
        localStorage.setItem('cookie-consent', 'denied');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-brand-dark/95 backdrop-blur-md border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-sm text-slate-300 leading-relaxed max-w-2xl">
                    <p className="mb-2 font-bold text-white text-base">🍪 Privacy & Cookie Policy</p>
                    <p>
                        Utilizziamo cookie tecnici e di analisi per migliorare l'esperienza e capire come viene usato il corso.
                        Rispettiamo la tua privacy: il tracciamento si attiva solo con il tuo consenso.
                        <a href="/privacy" className="text-accent hover:text-accent/80 underline ml-1 transition-colors">Leggi la policy completa.</a>
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 font-medium transition-all text-sm"
                    >
                        Rifiuta
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-accent hover:bg-[#b3e600] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all text-sm"
                    >
                        Accetta Tutto
                    </button>
                </div>
            </div>
        </div>
    );
};
