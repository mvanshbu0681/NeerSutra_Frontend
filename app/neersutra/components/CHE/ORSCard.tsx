/**
 * ============================================
 * ORS Card - Oxygen Resilience Score Visualization
 * Shows recovery time and resilience status
 * ============================================
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ORSCardProps {
  ors: number;
  recoveryTime: number;
  className?: string;
}

export default function ORSCard({
  ors,
  recoveryTime,
  className = '',
}: ORSCardProps) {
  // ORS severity (inverted - higher is better)
  const severity = ors > 0.6 ? 'High Resilience' : ors > 0.3 ? 'Moderate' : 'Low Resilience';
  const color = ors > 0.6 ? '#34d399' : ors > 0.3 ? '#fbbf24' : '#ef4444';
  const bgColor = ors > 0.6 ? 'rgba(52, 211, 153, 0.1)' : ors > 0.3 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  
  // Recovery time formatting
  const formatRecoveryTime = (days: number) => {
    if (days < 1) return '< 1 day';
    if (days < 7) return `${days.toFixed(1)} days`;
    return `${(days / 7).toFixed(1)} weeks`;
  };

  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/90">
          Oxygen Resilience Score
        </h3>
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: bgColor, color }}
        >
          {severity}
        </span>
      </div>
      
      {/* Main ORS Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
            ORS Index
          </span>
          <motion.span
            className="text-4xl font-bold"
            style={{ color }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {ors.toFixed(2)}
          </motion.span>
        </div>
        
        {/* Visual bar */}
        <div className="flex-1 mx-6">
          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${ors * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Markers */}
            <div className="absolute inset-y-0 left-[30%] w-px bg-white/20" />
            <div className="absolute inset-y-0 left-[60%] w-px bg-white/20" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-red-400/60">Fragile</span>
            <span className="text-[8px] text-amber-400/60">Moderate</span>
            <span className="text-[8px] text-emerald-400/60">Resilient</span>
          </div>
        </div>
      </div>
      
      {/* Recovery Time Estimate */}
      <div 
        className="rounded-lg p-3"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg 
              className="w-4 h-4" 
              style={{ color }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <span className="text-xs text-white/70">
              Estimated Recovery Time
            </span>
          </div>
          <span className="text-sm font-medium" style={{ color }}>
            {formatRecoveryTime(recoveryTime)}
          </span>
        </div>
        
        {/* Recovery formula note */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <span className="text-[10px] text-white/40 font-mono">
            ORS = exp(-T_rec / τ₀), τ₀ = 10 days
          </span>
        </div>
      </div>
      
      {/* Interpretation */}
      <div className="mt-3 text-[11px] text-white/50">
        {ors > 0.6 
          ? '✓ Ecosystem shows strong recovery capacity. Minimal intervention needed.'
          : ors > 0.3
          ? '⚠ Moderate stress detected. Monitor conditions and limit stressors.'
          : '⛔ Low resilience. Extended hypoxia risk. Consider protective measures.'
        }
      </div>
    </div>
  );
}
