import { useEffect, useState } from 'react';

const CONSENT_GRANTED = 'analytics-granted';
const CONSENT_DENIED = 'analytics-denied';
const LEGACY_GRANTED = 'granted';
const CONSENT_VERSION = '2026-06-12';

const deniedConsent = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
} as const;

const analyticsConsent = {
  ...deniedConsent,
  analytics_storage: 'granted',
} as const;

const isAnalyticsGranted = (value: string | null) => value === CONSENT_GRANTED || value === LEGACY_GRANTED;

const updateGoogleConsent = (analyticsEnabled: boolean) => {
  if (typeof window === 'undefined') return;
  window.gtag?.('consent', 'update', analyticsEnabled ? analyticsConsent : deniedConsent);
};

const readSavedConsent = () => {
  try {
    return localStorage.getItem('cookie-consent');
  } catch {
    return null;
  }
};

export const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const openPreferences = () => {
      const savedConsent = readSavedConsent();
      setAnalyticsEnabled(isAnalyticsGranted(savedConsent));
      setShowPreferences(true);
      setShowBanner(true);
    };

    window.ginnytechOpenCookiePreferences = openPreferences;
    window.addEventListener('ginnytech:open-cookie-preferences', openPreferences);

    const savedConsent = readSavedConsent();
    setAnalyticsEnabled(isAnalyticsGranted(savedConsent));

    if (!savedConsent) {
      const timeoutId = window.setTimeout(() => setShowBanner(true), 1200);
      return () => {
        window.clearTimeout(timeoutId);
        window.removeEventListener('ginnytech:open-cookie-preferences', openPreferences);
        delete window.ginnytechOpenCookiePreferences;
      };
    }

    return () => {
      window.removeEventListener('ginnytech:open-cookie-preferences', openPreferences);
      delete window.ginnytechOpenCookiePreferences;
    };
  }, []);

  const saveConsent = (analyticsAllowed: boolean) => {
    updateGoogleConsent(analyticsAllowed);

    try {
      localStorage.setItem('cookie-consent', analyticsAllowed ? CONSENT_GRANTED : CONSENT_DENIED);
      localStorage.setItem('cookie-consent-version', CONSENT_VERSION);
      localStorage.setItem('cookie-consent-updated-at', new Date().toISOString());
    } catch {
      // Consent remains applied for the current page even if browser storage is unavailable.
    }

    window.dispatchEvent(
      new CustomEvent(analyticsAllowed ? 'ginnytech:analytics-consent-granted' : 'ginnytech:analytics-consent-denied'),
    );
    setAnalyticsEnabled(analyticsAllowed);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[var(--sl-color-bg)]/95 px-4 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in duration-500 sm:px-5 md:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl flex-1 text-sm leading-relaxed text-slate-300">
            <p>
              <strong className="font-semibold text-white">Privacy e cookie:</strong> usiamo dati tecnici necessari
              per far funzionare il sito. Google Analytics viene caricato solo se dai consenso.
              <a href="/cookie-policy" className="ml-1 text-[#ccff00] underline transition-colors hover:text-[#e6ff66]">
                Leggi la Cookie Policy.
              </a>
            </p>
          </div>

          {!showPreferences && (
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3">
              <button
                onClick={() => saveConsent(false)}
                className="min-h-10 rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-white/5 sm:min-w-32"
              >
                Rifiuta analytics
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="min-h-10 rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-white/5 sm:min-w-32"
              >
                Gestisci
              </button>
              <button
                onClick={() => saveConsent(true)}
                className="min-h-10 rounded-md bg-[#ccff00] px-4 py-2 text-sm font-bold text-[#08090d] shadow-[0_0_15px_rgba(204,255,0,0.25)] transition-all hover:bg-[#b3e600] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] sm:min-w-36"
              >
                Accetta analytics
              </button>
            </div>
          )}
        </div>

        {showPreferences && (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">Cookie tecnici</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Necessari per tema, preferenze, progresso corso e sicurezza. Non richiedono consenso.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#ccff00]/30 px-3 py-1 text-xs font-semibold text-[#ccff00]">
                    Sempre attivi
                  </span>
                </div>
              </div>

              <label className="cursor-pointer rounded-md border border-white/10 bg-black/10 p-4 transition-colors hover:border-[#ccff00]/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white">Analytics aggregati</span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Aiutano a capire quali contenuti funzionano. Restano disattivati finché non li abiliti.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(event) => setAnalyticsEnabled(event.currentTarget.checked)}
                    className="mt-1 h-5 w-5 accent-[#ccff00]"
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <a href="/privacy" className="text-xs text-slate-400 underline underline-offset-4 hover:text-white sm:mr-auto">
                Privacy Policy
              </a>
              <button
                onClick={() => saveConsent(false)}
                className="min-h-10 rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-white/5"
              >
                Rifiuta tutto
              </button>
              <button
                onClick={() => saveConsent(analyticsEnabled)}
                className="min-h-10 rounded-md bg-[#ccff00] px-5 py-2 text-sm font-bold text-[#08090d] transition-all hover:bg-[#b3e600]"
              >
                Salva preferenze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
