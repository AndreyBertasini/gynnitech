import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5",
        className
      )}
      style={{ transform: 'translateZ(0)' }}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-mint-500 via-neon-mint to-neon-blue transition-all duration-700 ease-out shadow-[0_0_10px_rgba(0,255,163,0.5)]"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
