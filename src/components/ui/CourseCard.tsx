import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { OptimizedImage } from '../OptimizedImage';

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
      className="group relative block h-full animate-fade-in-up opacity-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sl-color-bg)]"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-br from-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-acid-yellow/70 group-hover:bg-white/[0.065] group-hover:shadow-[0_0_38px_-12px_rgba(204,255,0,0.35)]">

        {/* Glow effect */}
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${color} opacity-[0.05] blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />

        <div className="relative z-10 flex h-full flex-col">
          <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-white/[0.03]">
            {imageSrc ? (
              <>
                <OptimizedImage
                  src={imageSrc}
                  alt={imageAlt || title}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] sm:h-52"
                  lazy={true}
                  fit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05070b]/95 via-[#05070b]/35 to-transparent" />
              </>
            ) : (
              <div className={`h-48 w-full bg-gradient-to-br ${color} opacity-30 sm:h-52`} />
            )}

            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className={`h-px w-full bg-gradient-to-r ${color} opacity-70`} />
            </div>
          </div>

          <div className="relative mx-2 -mt-12 flex flex-1 flex-col items-center rounded-[1.35rem] border border-white/15 bg-[#071018]/70 px-5 pb-5 pt-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:px-6">
            <div className="absolute -top-8 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-2xl border border-white/20 bg-black/45 text-white shadow-[0_12px_28px_rgba(0,0,0,0.35),0_0_18px_rgba(204,255,0,0.14)] backdrop-blur-xl transition-all duration-300 group-hover:scale-105 group-hover:border-acid-yellow/60 group-hover:text-acid-yellow">
              <Icon className="h-7 w-7" />
            </div>

            <span className="mb-4 inline-flex items-center justify-center rounded-full border border-acid-yellow/25 bg-acid-yellow/[0.08] px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-acid-yellow shadow-[0_0_18px_rgba(204,255,0,0.12)] font-ui">
              MODULO {index + 1}
            </span>

            <h3 className="mb-4 max-w-[19rem] text-center text-[1.35rem] font-bold leading-tight text-white transition-colors group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-acid-yellow font-heading sm:text-2xl">
              {title}
            </h3>

            <div className={`mb-5 h-px w-24 bg-gradient-to-r ${color} opacity-80`} />

            <p
              className="mb-7 max-w-[21rem] flex-grow text-center text-sm leading-relaxed text-slate-300 font-sans"
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 4,
                overflow: 'hidden',
              }}
            >
              {description}
            </p>

            <div className="mt-auto w-full border-t border-white/10 pt-5">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-400 font-ui">
                  <BookOpen className="h-3.5 w-3.5" />
                  {lessonCount} LEZIONI
                </span>

                <div className="flex items-center gap-2 rounded-full border border-acid-yellow/20 bg-acid-yellow/[0.06] px-4 py-2 text-sm font-medium text-acid-yellow/90 opacity-90 transition-all duration-300 group-hover:border-acid-yellow/40 group-hover:bg-acid-yellow/[0.10] group-hover:opacity-100 font-ui">
                  Piano delle Lezioni <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};
