import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchWidget } from './ui/SearchWidget';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-brand-dark shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight group font-ui">
          <div className="w-10 h-10 bg-brand-dark rounded-lg flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(204,255,0,0.3)] border border-white/10 group-hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] group-hover:border-acid-yellow transition-all duration-300">
            🍐
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:text-acid-yellow group-hover:bg-none transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            GinnyTech
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Home</a>
          <a href="/course" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Corso Analisi Dati</a>
          <a href="/blog" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Blog</a>
          <a href="/consulting" className="text-sm font-medium text-slate-300 hover:text-neon-blue transition-colors hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">Consulenza</a>
          <SearchWidget />
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a href="https://www.linkedin.com/in/andrii-dyshkantiuk/" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-300 hover:text-neon-pink transition-colors hover:drop-shadow-[0_0_8px_rgba(255,0,255,0.5)]">Chi sono</a>
          <a href="https://tidycal.com/andrii-d/15-minute-meeting" target="_blank" rel="noreferrer" className="bg-acid-yellow/10 hover:bg-acid-yellow/20 text-acid-yellow border border-acid-yellow/50 hover:border-acid-yellow px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] backdrop-blur-sm">
            Prenota una call
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white p-2" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Chiudi menu" : "Apri menu"}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brand-dark border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <SearchWidget mobile />
              <a href="/" className="text-slate-300 hover:text-white font-medium">Home</a>
              <a href="/course" className="text-slate-300 hover:text-white font-medium">Corso Analisi Dati</a>
              <a href="/blog" className="text-slate-300 hover:text-white font-medium">Blog</a>
              <a href="/consulting" className="text-slate-300 hover:text-white font-medium">Consulenza</a>
              <hr className="border-white/10 my-2" />
              <a href="https://www.linkedin.com/in/andrii-dyshkantiuk/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white font-medium">Chi sono</a>
              <a href="https://tidycal.com/andrii-d/15-minute-meeting" target="_blank" rel="noreferrer" className="bg-acid-yellow/10 hover:bg-acid-yellow/20 text-acid-yellow border border-acid-yellow/50 hover:border-acid-yellow text-center py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] backdrop-blur-sm">Prenota una call</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
