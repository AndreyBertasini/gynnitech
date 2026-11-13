import React, { useState, useEffect, useRef } from 'react';
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons';
import LanguageSwitcher from './LanguageSwitcher';
import { SearchWidget } from './ui/SearchWidget';
import { BOOKING_URL, LINKEDIN_URL } from '../consts';
import { currentSiteLanguage, localizedPath, type SiteLanguage } from '../utils/language';

export const Navbar = ({ lang }: { lang?: SiteLanguage }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<SiteLanguage>(() => lang ?? currentSiteLanguage());
  const menuRef = useRef<HTMLDivElement>(null);

  const copy = language === 'en'
    ? {
        articles: 'Articles',
        consulting: 'Consulting',
        about: 'About',
        profile: 'About me',
        booking: 'Book a call',
        closeMenu: 'Close menu',
        openMenu: 'Open menu',
      }
    : {
        articles: 'Articoli',
        consulting: 'Consulenza',
        about: 'Informazioni',
        profile: 'Chi sono',
        booking: 'Prenota una call',
        closeMenu: 'Chiudi menu',
        openMenu: 'Apri menu',
      };
  const localHref = (href: string) => localizedPath(href, language);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLanguage(currentSiteLanguage());
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color] duration-300 ${isScrolled ? 'bg-brand-dark' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href={localHref('/')} className="notranslate flex items-center font-bold text-xl text-white tracking-tight group font-ui" translate="no">
          GinnyTech
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href={localHref('/')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
          <a href={localHref('/consulting')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{copy.consulting}</a>
          <a href={localHref('/blog')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{copy.articles}</a>
          <a href={localHref('/perche-questo-corso')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{copy.about}</a>
          <a href={localHref('/about')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">{copy.profile}</a>
          <SearchWidget language={language} />
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher initialLanguage={language} />
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent px-5 py-2 rounded-full text-sm font-semibold transition">
            {copy.booking}
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <SearchWidget language={language} />
          <LanguageSwitcher className="shrink-0" initialLanguage={language} />
          <button
            className="text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? copy.closeMenu : copy.openMenu}
          >
            {isMobileMenuOpen ? <Cross2Icon /> : <HamburgerMenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className="md:hidden bg-brand-dark border-b border-glass-border overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
        style={{
          maxHeight: isMobileMenuOpen ? menuRef.current?.scrollHeight ? `${menuRef.current.scrollHeight}px` : '500px' : '0px',
          opacity: isMobileMenuOpen ? 1 : 0,
        }}
      >
        <div className="flex flex-col p-6 gap-4">
          <SearchWidget mobile language={language} />
          <a href={localHref('/')} className="text-slate-300 hover:text-white font-medium">Home</a>
          <a href={localHref('/consulting')} className="text-slate-300 hover:text-white font-medium">{copy.consulting}</a>
          <a href={localHref('/blog')} className="text-slate-300 hover:text-white font-medium">{copy.articles}</a>
          <a href={localHref('/perche-questo-corso')} className="text-slate-300 hover:text-white font-medium">{copy.about}</a>
          <a href={localHref('/about')} className="text-slate-300 hover:text-white font-medium">{copy.profile}</a>
          <hr className="border-glass-border my-2" />
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent text-center py-3 rounded-lg font-semibold transition">
            {copy.booking}
          </a>
        </div>
      </div>
    </nav>
  );
};
