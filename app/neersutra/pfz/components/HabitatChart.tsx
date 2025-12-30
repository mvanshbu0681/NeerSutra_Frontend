/**
 * ============================================
 * Habitat Chart - Species Suitability Curves
 * Visualizes environmental preference profiles
 * ============================================
 */

'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePFZStore, useSelectedSpeciesProfile } from '../../../../src/store/usePFZStore';
import { SPECIES_PROFILES } from '../../../../src/lib/pfz/types';

type Factor = 'sst' | 'chlorophyll' | 'depth';

const factorConfig: Record<Factor, { 
  label: string; 
  unit: string; 
  color: string; 
  icon: ReactNode;
  range: [number, number];
}> = {
  sst: { 
    label: 'Temperature', 
    unit: '°C', 
    color: '#ef4444',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    range: [15, 35],
  },
  chlorophyll: { 
    label: 'Chlorophyll', 
    unit: 'mg/m³', 
    color: '#22c55e',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    range: [0, 10],
  },
  depth: { 
    label: 'Depth', 
    unit: 'm', 
    color: '#3b82f6',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    range: [0, 300],
  },
};

// Generate Gaussian curve points
function generateCurve(
  min: number, 
  max: number, 
  optimal: number, 
  rangeMin: number, 
  rangeMax: number,
  points: number = 50
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const sigma = (max - min) / 4;
  
  for (let i = 0; i <= points; i++) {
    const x = rangeMin + (rangeMax - rangeMin) * (i / points);
    let y = 0;
    if (x >= min && x <= max) {
      const exponent = -Math.pow(x - optimal, 2) / (2 * Math.pow(sigma, 2));
      y = Math.exp(exponent);
    }
    result.push({ x, y });
  }
  return result;
}

export default function HabitatChart() {
  const [activeFactor, setActiveFactor] = useState<Factor>('sst');
  const profile = useSelectedSpeciesProfile();
  const { selectedSpecies } = usePFZStore();
  
  const factors: Factor[] = ['sst', 'chlorophyll', 'depth'];
  
  // Generate curve data for active factor
  const curveData = useMemo(() => {
    const pref = profile.preferences[activeFactor];
    const config = factorConfig[activeFactor];
    return generateCurve(pref.min, pref.max, pref.optimal, config.range[0], config.range[1]);
  }, [profile, activeFactor]);
  
  // SVG path from curve data
  const pathD = useMemo(() => {
    if (curveData.length === 0) return '';
    
    const width = 260;
    const height = 80;
    const padding = 10;
    
    const config = factorConfig[activeFactor];
    const xScale = (x: number) => padding + ((x - config.range[0]) / (config.range[1] - config.range[0])) * (width - 2 * padding);
    const yScale = (y: number) => height - padding - y * (height - 2 * padding);
    
    let d = `M ${xScale(curveData[0].x)} ${yScale(curveData[0].y)}`;
    for (let i = 1; i < curveData.length; i++) {
      d += ` L ${xScale(curveData[i].x)} ${yScale(curveData[i].y)}`;
    }
    return d;
  }, [curveData, activeFactor]);
  
  // Fill path (closed area under curve)
  const fillPath = useMemo(() => {
    if (curveData.length === 0) return '';
    
    const width = 260;
    const height = 80;
    const padding = 10;
    
    const config = factorConfig[activeFactor];
    const xScale = (x: number) => padding + ((x - config.range[0]) / (config.range[1] - config.range[0])) * (width - 2 * padding);
    const yScale = (y: number) => height - padding - y * (height - 2 * padding);
    
    let d = `M ${xScale(curveData[0].x)} ${yScale(0)}`;
    for (const point of curveData) {
      d += ` L ${xScale(point.x)} ${yScale(point.y)}`;
    }
    d += ` L ${xScale(curveData[curveData.length - 1].x)} ${yScale(0)} Z`;
    return d;
  }, [curveData, activeFactor]);
  
  const config = factorConfig[activeFactor];
  const pref = profile.preferences[activeFactor];

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 flex-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <h2 className="text-sm font-semibold tracking-tight">Habitat Suitability</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          Gaussian Model
        </span>
      </div>

      {/* Factor Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-lg border border-white/5">
        {factors.map((factor) => (
          <button
            key={factor}
            onClick={() => setActiveFactor(factor)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all flex-1 justify-center ${
              activeFactor === factor 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:text-white/60'
            }`}
            style={activeFactor === factor ? { color: factorConfig[factor].color } : {}}
          >
            {factorConfig[factor].icon}
            <span>{factorConfig[factor].label}</span>
          </button>
        ))}
      </div>

      {/* Curve Visualization */}
      <div className="relative bg-black/20 rounded-xl p-3 border border-white/5">
        <AnimatePresence mode="wait">
          <motion.svg
            key={`${selectedSpecies}-${activeFactor}`}
            viewBox="0 0 260 80"
            className="w-full h-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Grid lines */}
            <defs>
              <linearGradient id={`grad-${activeFactor}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Horizontal grid */}
            {[0.25, 0.5, 0.75, 1].map((y, i) => (
              <line
                key={i}
                x1="10"
                y1={70 - y * 60}
                x2="250"
                y2={70 - y * 60}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
            ))}
            
            {/* Fill area */}
            <motion.path
              d={fillPath}
              fill={`url(#grad-${activeFactor})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            />
            
            {/* Curve line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={config.color}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* Optimal marker */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <circle
                cx={10 + ((pref.optimal - config.range[0]) / (config.range[1] - config.range[0])) * 240}
                cy={10}
                r="4"
                fill={config.color}
              />
              <text
                x={10 + ((pref.optimal - config.range[0]) / (config.range[1] - config.range[0])) * 240}
                y={24}
                fill="white"
                fontSize="8"
                textAnchor="middle"
                opacity="0.7"
              >
                optimal
              </text>
            </motion.g>
          </motion.svg>
        </AnimatePresence>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-1 px-2 text-[10px] text-white/40">
          <span>{config.range[0]}{config.unit}</span>
          <span className="font-medium" style={{ color: config.color }}>
            {pref.optimal}{config.unit}
          </span>
          <span>{config.range[1]}{config.unit}</span>
        </div>
      </div>

      {/* Factor Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Min</p>
          <p className="text-sm font-medium text-white/80">{pref.min}{config.unit}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5" style={{ borderColor: `${config.color}30` }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: `${config.color}80` }}>Optimal</p>
          <p className="text-sm font-medium" style={{ color: config.color }}>{pref.optimal}{config.unit}</p>
        </div>
        <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Max</p>
          <p className="text-sm font-medium text-white/80">{pref.max}{config.unit}</p>
        </div>
      </div>

      {/* Weight indicator */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">Weight:</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${profile.weights[activeFactor] * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: config.color }}>
          {(profile.weights[activeFactor] * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
