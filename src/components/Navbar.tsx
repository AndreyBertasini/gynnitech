import React, { useState, useEffect, useRef } from 'react';
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons';
import { SearchWidget } from './ui/SearchWidget';
import { BOOKING_URL, LINKEDIN_URL } from '../consts';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color] duration-300 ${isScrolled ? 'bg-brand-dark' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center font-bold text-xl text-white tracking-tight group font-ui">
          GinnyTech
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
          <a href="/blog" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Articoli</a>
          <a href="/perche-questo-corso" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Informazioni</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Chi sono</a>
          <SearchWidget />
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent px-5 py-2 rounded-full text-sm font-semibold transition-all">
            Prenota una call
          </a>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <SearchWidget />
          <button
            className="text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
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
          <SearchWidget mobile />
          <a href="/" className="text-slate-300 hover:text-white font-medium">Home</a>
          <a href="/blog" className="text-slate-300 hover:text-white font-medium">Articoli</a>
          <a href="/perche-questo-corso" className="text-slate-300 hover:text-white font-medium">Informazioni</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white font-medium">Chi sono</a>
          <hr className="border-glass-border my-2" />
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 hover:border-accent text-center py-3 rounded-lg font-semibold transition-all">
            Prenota una call
          </a>
        </div>
      </div>
    </nav>
  );
};
