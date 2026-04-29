import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string; // e.g., "from-blue-500 to-cyan-500"
  lessonCount: number;
  index: number;
  imageSrc?: string;
  imageAlt?: string;
}

export const CourseCard = ({
  id,
  title,
  description,
  icon: Icon,
  color,
  lessonCount,
  index,
  imageSrc,
  imageAlt,
}: CourseCardProps) => {
  return (
    <a
      href={`/course/${id}/`}
      className="group relative block h-full animate-fade-in-up opacity-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e14]/80 p-4 transition-all duration-300 group-hover:border-acid-yellow group-hover:shadow-[0_0_30px_-10px_rgba(204,255,0,0.2)] group-hover:-translate-y-1 backdrop-blur-md sm:p-5">

        {/* Glow effect */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${color} opacity-[0.05] blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />

        <div className="relative z-10 flex h-full flex-col">
          <div className="relative mb-6 overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03]">
            {imageSrc ? (
              <>
                <img
                  src={imageSrc}
                  alt={imageAlt || title}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:h-52"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14] via-[#0a0e14]/35 to-transparent" />
              </>
            ) : (
              <div className={`h-48 w-full bg-gradient-to-br ${color} opacity-30 sm:h-52`} />
            )}

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-black/35 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:border-acid-yellow/50 group-hover:text-acid-yellow shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <Icon className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[10px] font-ui font-medium tracking-widest text-slate-100 backdrop-blur-md transition-colors group-hover:border-acid-yellow/30 group-hover:text-acid-yellow">
                MOD {index + 1}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className={`h-px w-full bg-gradient-to-r ${color} opacity-70`} />
            </div>
          </div>

          <h3 className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-acid-yellow font-heading tracking-tight">
            {title}
          </h3>

          <p
            className="mb-8 flex-grow text-sm leading-relaxed text-slate-300 font-sans"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 4,
              overflow: 'hidden',
            }}
          >
            {description}
          </p>

          <div className="mt-auto border-t border-white/5 pt-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-400 font-ui">
                <BookOpen className="h-3.5 w-3.5" />
                {lessonCount} LEZIONI
              </span>

              <div className="flex items-center gap-2 text-sm font-medium text-acid-yellow/85 opacity-80 transition-all duration-300 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 font-ui">
                Piano delle Lezioni <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};
