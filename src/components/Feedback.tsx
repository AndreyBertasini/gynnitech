import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';

export const Feedback = () => {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  if (voted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 p-4 rounded-lg bg-mint-500/10 border border-mint-500/20 text-mint-400 text-sm font-medium text-center"
      >
        Thanks for your feedback!
      </motion.div>
    );
  }

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm font-medium">Was this page helpful?</p>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setVoted('up')}
            className="p-2 rounded-md hover:bg-white/5 text-slate-400 hover:text-mint-400 transition-colors"
            aria-label="Yes"
          >
            <ThumbsUp className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setVoted('down')}
            className="p-2 rounded-md hover:bg-white/5 text-slate-400 hover:text-red-400 transition-colors"
            aria-label="No"
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
