import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { CheckCircle, PlayCircle, Lock, ChevronDown } from 'lucide-react';
import { cn } from './Tooltip';
import { Tooltip } from './Tooltip';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export const LessonList = ({ lessons }: { lessons: Lesson[] }) => {
  return (
    <Accordion.Root type="single" collapsible className="w-full space-y-2">
      {lessons.map((lesson, index) => (
        <Accordion.Item 
          key={lesson.id} 
          value={lesson.id}
          className="group overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] transition-colors data-[state=open]:bg-white/[0.04] hover:bg-white/[0.04]"
        >
          <Accordion.Header className="flex">
            <Accordion.Trigger className="flex flex-1 items-center justify-between p-5 text-left outline-none cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-mono transition-colors",
                  lesson.isCompleted 
                    ? "border-neon-mint/50 bg-neon-mint/10 text-neon-mint" 
                    : "border-white/10 bg-white/5 text-slate-500 group-hover:border-white/20"
                )}>
                  {lesson.isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-neon-mint transition-colors">
                    {lesson.title}
                  </h4>
                  {lesson.duration && (
                    <span className="text-xs text-slate-500 hidden sm:inline-block ml-2 opacity-60">| {lesson.duration}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 {/* Status Icon */}
                 {lesson.isLocked ? (
                    <Tooltip content="Questa lezione è bloccata">
                       <Lock className="h-4 w-4 text-slate-600" />
                    </Tooltip>
                 ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-180" />
                 )}
              </div>
            </Accordion.Trigger>
          </Accordion.Header>
          
          <Accordion.Content className="overflow-hidden text-sm text-slate-400 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="px-5 pb-5 pl-[4.5rem]">
              <p className="mb-4 leading-relaxed max-w-2xl">{lesson.description}</p>
              {!lesson.isLocked && (
                <a 
                  href={`/course/${lesson.id.replace(/\.[^/.]+$/, "")}/`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neon-mint/10 hover:text-neon-mint border border-white/10 hover:border-neon-mint/20"
                >
                  <PlayCircle className="h-4 w-4" />
                  Vai alla lezione
                </a>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
};
