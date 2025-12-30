/**
 * ============================================
 * CHE Layer Selector - Toggle between DZRI/PEI/ORS/DO
 * ============================================
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCHEStore, type CHELayerType } from '../../../../src/store/useCHEStore';

const LAYER_CONFIG: Record<CHELayerType, { label: string; color: string; description: string }> = {
  dzri: {
    label: 'DZRI',
    color: '#ef4444',
    description: 'Dead Zone Risk',
  },
  pei: {
    label: 'PEI',
    color: '#a855f7',
    description: 'Pollution Index',
  },
  ors: {
    label: 'ORS',
    color: '#34d399',
    description: 'O₂ Resilience',
  },
  do: {
    label: 'DO',
    color: '#22d3ee',
    description: 'Dissolved O₂',
  },
  none: {
    label: 'Off',
    color: '#6b7280',
    description: 'No overlay',
  },
};

interface CHELayerSelectorProps {
  className?: string;
}

export default function CHELayerSelector({ className = '' }: CHELayerSelectorProps) {
  const { activeLayer, setActiveLayer, layerOpacity, setLayerOpacity } = useCHEStore();
  
  const layers: CHELayerType[] = ['dzri', 'pei', 'ors', 'do', 'none'];
  
  return (
    <div className={`glass-panel rounded-2xl p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          CHE Layers
        </span>
        <span className="text-[10px] text-cyan-400">
          {LAYER_CONFIG[activeLayer].description}
        </span>
      </div>
      
      {/* Layer buttons */}
      <div className="flex gap-1">
        {layers.map((layer) => {
          const config = LAYER_CONFIG[layer];
          const isActive = layer === activeLayer;
          
          return (
            <motion.button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`
                relative flex-1 py-2 px-1 rounded-lg text-center transition-colors
                ${isActive 
                  ? 'bg-white/10' 
                  : 'hover:bg-white/5'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeLayerIndicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    border: `1px solid ${config.color}40`,
                    boxShadow: `0 0 12px ${config.color}20`,
                  }}
                />
              )}
              
              {/* Dot indicator */}
              <div className="flex flex-col items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: isActive ? config.color : `${config.color}60`,
                    boxShadow: isActive ? `0 0 8px ${config.color}` : 'none',
                  }}
                />
                <span 
                  className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-white/50'}`}
                >
                  {config.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Opacity slider */}
      {activeLayer !== 'none' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 pt-3 border-t border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40">Opacity</span>
            <span className="text-[10px] text-white/60">{Math.round(layerOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={layerOpacity}
            onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-cyan-400
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.5)]
            "
          />
        </motion.div>
      )}
    </div>
  );
}
