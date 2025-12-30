/**
 * ============================================
 * Confidence Gauge - Visual confidence display
 * IOHD-EWS: Aggregate & component scores
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { type HazardEvent } from '../../../../src/lib/ews/types';
import { HAZARD_CONFIG } from '../../../../src/lib/ews/types';
import { 
  Target,
  Radar,
  Database,
  Brain,
  Gauge,
} from 'lucide-react';

interface ConfidenceGaugeProps {
  event: HazardEvent;
}

const COMPONENT_ICONS = {
  detectionCertainty: Target,
  ensembleSpread: Radar,
  dataCoverage: Database,
  modelSkill: Brain,
};

const COMPONENT_LABELS = {
  detectionCertainty: 'Detection',
  ensembleSpread: 'Ensemble',
  dataCoverage: 'Data',
  modelSkill: 'Model',
};

export default function ConfidenceGauge({ event }: ConfidenceGaugeProps) {
  const { confidenceScore } = event;
  const hazardConfig = HAZARD_CONFIG[event.hazardType];
  
  const overallPercent = confidenceScore.overall * 100;
  
  // Determine color based on confidence level
  const getConfidenceColor = (value: number) => {
    if (value >= 0.8) return '#22c55e'; // Green
    if (value >= 0.6) return '#eab308'; // Yellow
    if (value >= 0.4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const overallColor = getConfidenceColor(confidenceScore.overall);

  return (
    <div className="glass-panel rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-white/70" />
          <h2 className="text-sm font-semibold text-white/90">
            Confidence Score
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          Aggregated
        </span>
      </div>

      {/* Main Gauge */}
      <div className="relative flex items-center justify-center py-4">
        {/* Circular Progress */}
        <div className="relative w-28 h-28">
          {/* Background Circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={overallColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 42 * (1 - confidenceScore.overall) 
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                filter: `drop-shadow(0 0 8px ${overallColor}80)`,
              }}
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className="text-2xl font-bold"
              style={{ color: overallColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {overallPercent.toFixed(0)}
            </motion.span>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              percent
            </span>
          </div>
        </div>

        {/* Confidence Level Label */}
        <div 
          className="absolute -bottom-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ 
            backgroundColor: `${overallColor}20`,
            color: overallColor,
          }}
        >
          {confidenceScore.overall >= 0.8 ? 'High' :
           confidenceScore.overall >= 0.6 ? 'Moderate' :
           confidenceScore.overall >= 0.4 ? 'Low' : 'Very Low'}
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="mt-6 space-y-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-3">
          Component Scores
        </span>
        
        {(Object.keys(confidenceScore.components) as Array<keyof typeof confidenceScore.components>).map((key) => {
          const value = confidenceScore.components[key];
          const weight = confidenceScore.weights[key];
          const Icon = COMPONENT_ICONS[key];
          const label = COMPONENT_LABELS[key];
          const color = getConfidenceColor(value);

          return (
            <div key={key} className="flex items-center gap-3">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/60">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/30">
                      ×{weight}
                    </span>
                    <span 
                      className="text-xs font-medium w-10 text-right"
                      style={{ color }}
                    >
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[10px] text-white/30 leading-relaxed">
          Confidence aggregates detection certainty, ensemble spread, data coverage, and regional model skill using weighted averaging.
        </p>
      </div>
    </div>
  );
}
