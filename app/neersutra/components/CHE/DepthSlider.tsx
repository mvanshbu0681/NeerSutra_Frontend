/**
 * ============================================
 * Depth Slider - 4D Depth Selection Control
 * Vertical slider for selecting observation depth
 * ============================================
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCHEStore, getDepthLabel } from '../../../../src/store/useCHEStore';
import { STANDARD_DEPTHS, type StandardDepth } from '../../../../src/lib/che/types';

interface DepthSliderProps {
  className?: string;
}

export default function DepthSlider({ className = '' }: DepthSliderProps) {
  const { selectedDepth, setSelectedDepth, isDepthSliderExpanded, toggleDepthSlider } = useCHEStore();
  
  const currentIndex = STANDARD_DEPTHS.indexOf(selectedDepth);
  
  return (
    <motion.div
      className={`glass-panel rounded-2xl overflow-hidden ${className}`}
      animate={{ 
        width: isDepthSliderExpanded ? 180 : 48,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div className="p-3">
        {/* Header */}
        <button
          onClick={toggleDepthSlider}
          className="flex items-center gap-2 w-full mb-3"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <svg 
              className="w-4 h-4 text-cyan-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
          {isDepthSliderExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-left"
            >
              <span className="text-[10px] uppercase tracking-wider text-white/40 block">
                Depth
              </span>
              <span className="text-sm font-medium text-cyan-400">
                {getDepthLabel(selectedDepth)}
              </span>
            </motion.div>
          )}
        </button>
        
        {/* Depth buttons */}
        <div className="flex flex-col gap-1">
          {STANDARD_DEPTHS.map((depth, index) => {
            const isSelected = depth === selectedDepth;
            const depthPercent = (depth / 100) * 100;
            
            return (
              <motion.button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className={`
                  relative flex items-center gap-2 p-2 rounded-lg transition-colors
                  ${isSelected 
                    ? 'bg-cyan-500/20 border border-cyan-500/30' 
                    : 'hover:bg-white/5 border border-transparent'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Depth indicator bar */}
                <div className="w-6 h-6 rounded flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 rounded"
                    style={{
                      background: `linear-gradient(to bottom, 
                        rgba(34, 211, 238, ${0.3 - depthPercent * 0.002}) 0%, 
                        rgba(30, 58, 138, ${0.2 + depthPercent * 0.003}) 100%
                      )`,
                    }}
                  />
                  <span className="relative text-[10px] font-medium text-white/70">
                    {index + 1}
                  </span>
                </div>
                
                {isDepthSliderExpanded && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex items-center justify-between"
                  >
                    <span className={`text-xs ${isSelected ? 'text-cyan-400 font-medium' : 'text-white/60'}`}>
                      {getDepthLabel(depth)}
                    </span>
                    {isSelected && (
                      <motion.span
                        layoutId="depthIndicator"
                        className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                      />
                    )}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        
        {/* Quick navigation */}
        {!isDepthSliderExpanded && (
          <div className="flex flex-col items-center gap-1 mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => currentIndex > 0 && setSelectedDepth(STANDARD_DEPTHS[currentIndex - 1])}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              disabled={currentIndex === 0}
            >
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className="text-[10px] text-cyan-400 font-medium">
              {selectedDepth}m
            </span>
            <button
              onClick={() => currentIndex < STANDARD_DEPTHS.length - 1 && setSelectedDepth(STANDARD_DEPTHS[currentIndex + 1])}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              disabled={currentIndex === STANDARD_DEPTHS.length - 1}
            >
              <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
