import React, { useState, useEffect, useRef } from 'react';
import { HamburgerMenuIcon, Cross2Icon } from '@radix-ui/react-icons';
import { SearchWidget } from './ui/SearchWidget';
import { ThemeToggle } from './ThemeToggle';
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
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,box-shadow] duration-300 ${isScrolled ? 'bg-[var(--sl-color-bg-nav)] shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center font-bold text-xl text-white tracking-tight group font-ui">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:text-acid-yellow group-hover:bg-none transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            GinnyTech
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Home</a>
          <a href="/blog" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Articoli</a>
          <a href="/progress" className="text-sm font-medium text-acid-yellow hover:text-acid-yellow/80 transition-colors">Progresso</a>
          <a href="/perche-questo-corso" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Informazioni</a>
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Chi sono</a>
          <a href="/newsletter" className="text-sm font-medium text-acid-yellow hover:text-acid-yellow/80 transition-colors">Newsletter</a>
          <SearchWidget />
          <ThemeToggle />
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-acid-yellow/10 hover:bg-acid-yellow/20 text-acid-yellow border border-acid-yellow/50 hover:border-acid-yellow px-5 py-2 rounded-full text-sm font-semibold transition-[background-color,border-color,box-shadow] shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] backdrop-blur-sm">
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

      {/* Mobile Menu - CSS transition instead of framer-motion */}
      <div
        ref={menuRef}
        className="md:hidden bg-[var(--sl-color-bg)] border-b border-white/10 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
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
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Tema</span>
            <ThemeToggle />
          </div>
          <hr className="border-white/10 my-2" />
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="bg-acid-yellow/10 hover:bg-acid-yellow/20 text-acid-yellow border border-acid-yellow/50 hover:border-acid-yellow text-center py-3 rounded-lg font-semibold transition-[background-color,border-color,box-shadow] shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] backdrop-blur-sm">Prenota una call</a>
        </div>
      </div>
    </nav>
  );
};
