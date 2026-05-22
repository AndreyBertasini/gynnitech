import React from 'react';
import { ArrowRight, BookOpen, Activity, Database, GitMerge, Zap, BrainCircuit, Server, FlaskConical, BarChart, HardDrive, Radio, LayoutDashboard, Map as MapIcon } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessonCount: number;
  index: number;
  imageSrc?: string;
  imageAlt?: string;
}

const IconMap: Record<string, React.ComponentType<any>> = {
  Activity, Database, GitMerge, Zap, BrainCircuit, Server, FlaskConical, BarChart, HardDrive, Radio, LayoutDashboard, Map: MapIcon
};

export const CourseCard = ({
  id,
  title,
  description,
  icon: iconName,
  lessonCount,
  index,
  imageSrc,
  imageAlt,
}: CourseCardProps) => {
  const Icon = IconMap[iconName] || BookOpen;

  return (
    <a
      href={`/course/${id}/`}
      className="group relative block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark border border-glass-border bg-brand-surface hover:border-accent hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {imageSrc && (
        <div className="relative overflow-hidden">
          <img
            src={imageSrc}
            alt={imageAlt || title}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-48"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface/95 to-transparent" />
        </div>
      )}

      <div className={`relative flex flex-col ${imageSrc ? '-mt-10 px-5 pb-5 pt-6' : 'p-5 pb-5 pt-6'}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-elevated border border-glass-border group-hover:border-accent/40 transition-colors">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.15em] text-text-muted uppercase font-ui">
            MODULO {index + 1}
          </span>
        </div>

        <h3 className="text-lg font-bold text-text-primary leading-tight mb-2 font-heading group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-sm leading-relaxed text-text-secondary mb-4 line-clamp-3">
          {description}
        </p>

        <div className="mt-auto pt-3 border-t border-glass-border flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted font-ui">
            <BookOpen className="h-3.5 w-3.5" />
            {lessonCount} LEZIONI
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-accent font-ui">
            Esplora <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
};
