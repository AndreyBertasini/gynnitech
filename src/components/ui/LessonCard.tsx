import React from 'react';
import { PlayCircle, Clock, ArrowRight } from 'lucide-react';
import { cn } from './Tooltip';

interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  duration?: string;
  index: number;
  href: string;
}

export const LessonCard = ({ id, title, description, duration, index, href }: LessonCardProps) => {
  return (
    <a
      href={href}
      className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e14] p-6 transition-all duration-300 hover:border-neon-mint/30 hover:shadow-[0_0_30px_-10px_rgba(0,255,163,0.15)] hover:-translate-y-1 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Top Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-neon-mint/50 transition-all duration-500" />
      
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400 group-hover:text-neon-mint group-hover:border-neon-mint/30 transition-colors">
          {index + 1}
        </span>
        {duration && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" /> {duration}
            </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-neon-mint transition-colors">
        {title}
      </h3>
      
      <p className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed">
        {description}
      </p>

      <div className="mt-auto flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white transition-colors">
        <span className="group-hover:underline decoration-neon-mint/50 underline-offset-4">Vai alla lezione</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 text-neon-mint" />
      </div>
    </a>
  );
};
