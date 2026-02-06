import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-dark/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight group">
          <div className="w-8 h-8 bg-mint-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-mint-500/20 group-hover:shadow-mint-500/40 transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          GYNNITECH
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</a>
            <a href="/course" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Corso Analisi Dati</a>
            <a href="/consulting" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Consulenza</a>
            <a href="/blog" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Blog</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
            <a href="https://www.linkedin.com/in/andrii-dyshkantiuk/" target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Chi sono</a>
            <a href="https://tidycal.com/andrii-d/15-minute-meeting" target="_blank" rel="noreferrer" className="bg-mint-500 hover:bg-mint-400 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-[0_0_15px_rgba(61,177,134,0.3)] hover:shadow-[0_0_20px_rgba(61,177,134,0.5)]">
                Prenota una call
            </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
                    <a href="/" className="text-slate-300 hover:text-white font-medium">Home</a>
                    <a href="/course" className="text-slate-300 hover:text-white font-medium">Corso Analisi Dati</a>
                    <a href="/consulting" className="text-slate-300 hover:text-white font-medium">Consulenza</a>
                    <a href="/blog" className="text-slate-300 hover:text-white font-medium">Blog</a>
                    <hr className="border-white/10 my-2" />
                    <a href="https://www.linkedin.com/in/andrii-dyshkantiuk/" target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white font-medium">Chi sono</a>
                    <a href="https://tidycal.com/andrii-d/15-minute-meeting" target="_blank" rel="noreferrer" className="bg-mint-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-mint-400 transition-colors">Prenota una call</a>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
