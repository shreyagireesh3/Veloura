import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

interface SmartMessageProps {
  id: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

export default function SmartMessage({ 
  id, 
  message, 
  actionLabel, 
  onAction, 
  onDismiss, 
  isVisible 
}: SmartMessageProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass p-4 rounded-2xl border border-white/40 shadow-2xl max-w-[240px] z-50 pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-veloura-accent/10 flex items-center justify-center text-veloura-accent shrink-0">
              <Sparkles size={16} />
            </div>
            <button 
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-black/5 text-gray-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          
          <p className="text-xs font-medium text-veloura-ink leading-relaxed mb-3">
            {message}
          </p>
          
          <button 
            onClick={onAction}
            className="w-full py-2 px-3 bg-veloura-ink text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all group"
          >
            {actionLabel}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
