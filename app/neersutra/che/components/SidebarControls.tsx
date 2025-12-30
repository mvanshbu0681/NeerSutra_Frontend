/**
 * ============================================
 * CHE Sidebar Controls - Left Panel
 * Depth Slider, Layer Selection, Time Controls
 * ============================================
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useCHEStore, getDepthLabel, type CHELayerType } from '../../../../src/store/useCHEStore';
import { STANDARD_DEPTHS, type StandardDepth } from '../../../../src/lib/che/types';

const LAYER_CONFIG: Record<CHELayerType, { 
  label: string; 
  color: string; 
  icon: string;
  description: string;
}> = {
  dzri: {
    label: 'DZRI',
    color: '#ef4444',
    icon: '⚠️',
    description: 'Dead Zone Risk Index',
  },
  pei: {
    label: 'PEI',
    color: '#a855f7',
    icon: '🧪',
    description: 'Pollution-Eutrophication',
  },
  ors: {
    label: 'ORS',
    color: '#34d399',
    icon: '💨',
    description: 'Oxygen Resilience Score',
  },
  do: {
    label: 'DO',
    color: '#22d3ee',
    icon: '🫧',
    description: 'Dissolved Oxygen',
  },
  none: {
    label: 'None',
    color: '#6b7280',
    icon: '○',
    description: 'No overlay',
  },
};

export default function SidebarControls() {
  const { 
    selectedDepth, 
    setSelectedDepth,
    activeLayer,
    setActiveLayer,
    layerOpacity,
    setLayerOpacity,
    showContours,
    toggleContours,
    showHypoxiaZones,
    toggleHypoxiaZones,
  } = useCHEStore();

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto scrollbar-hide">
      {/* Depth Control */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Depth Control
          </h3>
          <span className="text-lg font-bold text-cyan-400 tabular-nums">
            {getDepthLabel(selectedDepth)}
          </span>
        </div>

        {/* Vertical Depth Selector */}
        <div className="space-y-1">
          {STANDARD_DEPTHS.map((depth, index) => {
            const isSelected = depth === selectedDepth;
            const depthPercent = depth / 100;
            
            return (
              <motion.button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className={`
                  w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
                  ${isSelected 
                    ? 'bg-cyan-500/20 border border-cyan-500/40' 
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Depth gradient indicator */}
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                  style={{
                    background: `linear-gradient(180deg, 
                      rgba(34, 211, 238, ${0.4 - depthPercent * 0.3}) 0%, 
                      rgba(30, 64, 175, ${0.3 + depthPercent * 0.4}) 100%
                    )`,
                    color: isSelected ? '#22d3ee' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {index + 1}
                </div>
                
                <div className="flex-1 text-left">
                  <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-white/60'}`}>
                    {getDepthLabel(depth)}
                  </span>
                </div>
                
                {isSelected && (
                  <motion.div
                    layoutId="depthIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    style={{ boxShadow: '0 0 8px #22d3ee' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Layer Selection */}
      <div className="glass-panel rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Data Layer
        </h3>

        <div className="space-y-2">
          {(Object.keys(LAYER_CONFIG) as CHELayerType[]).filter(l => l !== 'none').map((layer) => {
            const config = LAYER_CONFIG[layer];
            const isActive = layer === activeLayer;
            
            return (
              <motion.button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl transition-all
                  ${isActive 
                    ? 'border' 
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }
                `}
                style={{
                  backgroundColor: isActive ? `${config.color}15` : undefined,
                  borderColor: isActive ? `${config.color}40` : undefined,
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 text-left">
                  <span 
                    className={`text-sm font-medium ${isActive ? '' : 'text-white/70'}`}
                    style={{ color: isActive ? config.color : undefined }}
                  >
                    {config.label}
                  </span>
                  <span className="text-[10px] text-white/40 block">
                    {config.description}
                  </span>
                </div>
                {isActive && (
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: config.color,
                      boxShadow: `0 0 8px ${config.color}`,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Opacity Slider */}
        {activeLayer !== 'none' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Layer Opacity</span>
              <span className="text-xs text-white/70 tabular-nums">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)]
                [&::-webkit-slider-thumb]:cursor-pointer
              "
            />
          </div>
        )}
      </div>

      {/* Display Options */}
      <div className="glass-panel rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Display Options
        </h3>

        <div className="space-y-3">
          <ToggleOption
            label="Contour Lines"
            description="Show iso-concentration lines"
            isEnabled={showContours}
            onToggle={toggleContours}
            color="#22d3ee"
          />
          <ToggleOption
            label="Hypoxia Zones"
            description="Highlight DO < 2.0 mg/L"
            isEnabled={showHypoxiaZones}
            onToggle={toggleHypoxiaZones}
            color="#ef4444"
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="glass-panel rounded-2xl p-4 mt-auto">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/80 mb-1">Tip</h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Click anywhere on the map to analyze that location's coastal health metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toggle Option Component
function ToggleOption({ 
  label, 
  description, 
  isEnabled, 
  onToggle, 
  color 
}: { 
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div className="text-left">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-[10px] text-white/40 block">{description}</span>
      </div>
      <div 
        className={`w-10 h-5 rounded-full transition-colors relative ${isEnabled ? '' : 'bg-white/20'}`}
        style={{ backgroundColor: isEnabled ? `${color}40` : undefined }}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{ left: isEnabled ? 'calc(100% - 18px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ 
            backgroundColor: isEnabled ? color : 'white',
            boxShadow: isEnabled ? `0 0 8px ${color}` : undefined,
          }}
        />
      </div>
    </button>
  );
}
