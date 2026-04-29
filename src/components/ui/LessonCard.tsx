import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

interface LessonCardProps {
  title: string;
  description: string;
  duration?: string;
  difficulty?: string;
  prerequisitesCount?: number;
  index: number;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const LessonCard = ({
  title,
  description,
  duration,
  difficulty,
  prerequisitesCount,
  index,
  href,
  imageSrc,
  imageAlt,
}: LessonCardProps) => {
  return (
    <a
      href={href}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e14]/80 p-6 transition-all duration-300 hover:border-neon-blue/50 hover:shadow-[0_0_30px_-10px_rgba(0,243,255,0.2)] hover:-translate-y-1 animate-fade-in-up opacity-0 backdrop-blur-md"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-neon-blue/80 transition-all duration-500" />

      {imageSrc && (
        <div className="relative mb-5 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
          <img
            src={imageSrc}
            alt={imageAlt || title}
            className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/25 to-transparent" />
          <span className="absolute left-4 top-4 flex items-center justify-center w-9 h-9 rounded-xl bg-black/40 border border-white/10 text-xs font-orbitron text-slate-100 shadow-[0_0_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors group-hover:text-neon-blue group-hover:border-neon-blue/30">
            {index + 1}
          </span>
        </div>
      )}

      <div className={`mb-4 flex items-center ${imageSrc ? 'justify-end' : 'justify-between'}`}>
        {!imageSrc && (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-orbitron text-slate-400 group-hover:text-neon-blue group-hover:border-neon-blue/30 transition-colors shadow-inner">
            {index + 1}
          </span>
        )}
        <div className="flex items-center gap-2">
          {difficulty && (
            <span className="text-[11px] text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/10 font-medium">
              {difficulty}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md font-mono border border-transparent group-hover:border-white/10 transition-colors">
              <Clock className="w-3 h-3" /> {duration}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-neon-blue transition-colors font-audiowide tracking-wide">
        {title}
      </h3>

      <p
        className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed font-sans"
        style={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 4,
          overflow: 'hidden',
        }}
      >
        {description}
      </p>

      {typeof prerequisitesCount === 'number' && prerequisitesCount > 0 && (
        <p className="text-xs text-slate-500 mb-4 font-mono">
          Prerequisiti: {prerequisitesCount}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white transition-colors">
        <span className="group-hover:underline decoration-neon-blue/50 underline-offset-4 font-orbitron">Vai alla lezione</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-neon-blue" />
      </div>
    </a>
  );
};
