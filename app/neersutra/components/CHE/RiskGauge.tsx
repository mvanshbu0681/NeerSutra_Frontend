/**
 * ============================================
 * Risk Gauge - Circular DZRI Visualization
 * Animated gauge showing risk level from 0.0 to 1.0
 * ============================================
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RiskLevel } from '../../../../src/lib/che/types';
import { RISK_THRESHOLDS } from '../../../../src/lib/che/types';

interface RiskGaugeProps {
  value: number;
  label?: string;
  size?: number;
  className?: string;
}

const getRiskInfo = (value: number): { level: RiskLevel; color: string; glow: string; label: string } => {
  if (value < RISK_THRESHOLDS.SAFE) {
    return { 
      level: 'safe', 
      color: '#34d399', 
      glow: 'rgba(52, 211, 153, 0.5)',
      label: 'Safe Zone'
    };
  }
  if (value < RISK_THRESHOLDS.WARNING) {
    return { 
      level: 'warning', 
      color: '#fbbf24', 
      glow: 'rgba(251, 191, 36, 0.5)',
      label: 'Warning'
    };
  }
  return { 
    level: 'high', 
    color: '#ef4444', 
    glow: 'rgba(239, 68, 68, 0.5)',
    label: 'High Risk'
  };
};

export default function RiskGauge({
  value,
  label = 'DZRI',
  size = 160,
  className = '',
}: RiskGaugeProps) {
  const riskInfo = useMemo(() => getRiskInfo(value), [value]);
  
  // SVG calculations
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degree arc
  const offset = arc - (arc * Math.min(value, 1));
  
  // Tick marks for scale
  const ticks = [0, 0.3, 0.6, 1.0];
  
  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/90">{label}</h3>
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ 
            backgroundColor: `${riskInfo.color}20`,
            color: riskInfo.color,
          }}
        >
          {riskInfo.label}
        </span>
      </div>
      
      <div className="relative flex items-center justify-center" style={{ height: size }}>
        {/* Background glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            background: `radial-gradient(circle, ${riskInfo.glow} 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <svg width={size} height={size} className="transform -rotate-[135deg]">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          
          {/* Risk zone indicators (subtle) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth={strokeWidth * 0.3}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
            opacity={0.3}
          />
          
          {/* Active progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={riskInfo.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arc }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${riskInfo.glow})`,
            }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center value display */}
        <div className="absolute flex flex-col items-center">
          <motion.span
            className="text-3xl font-bold tabular-nums"
            style={{ color: riskInfo.color }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={value.toFixed(2)}
          >
            {value.toFixed(2)}
          </motion.span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
            Risk Index
          </span>
        </div>
      </div>
      
      {/* Scale labels */}
      <div className="flex justify-between px-2 mt-2">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="flex flex-col items-center"
          >
            <span 
              className="text-[10px] font-medium"
              style={{
                color: tick < 0.3 ? '#34d399' : tick < 0.6 ? '#fbbf24' : '#ef4444',
                opacity: 0.7,
              }}
            >
              {tick.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Zone legend */}
      <div className="flex justify-center gap-4 mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-white/50">&lt;0.3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-white/50">0.3-0.6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-[10px] text-white/50">&ge;0.6</span>
        </div>
      </div>
    </div>
  );
}
