/**
 * ============================================
 * Validation Metrics Chart
 * IOHD-EWS: Visual display of forecast skill
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { type ValidationMetrics } from '../../../../src/lib/ews/types';

interface ValidationMetricsChartProps {
  metrics: ValidationMetrics;
  className?: string;
}

// Metric explanations for tooltips
const METRIC_INFO: Record<string, { label: string; description: string; range: [number, number]; optimal: 'low' | 'high' }> = {
  brierScore: {
    label: 'Brier Score',
    description: 'Lower is better. 0 = perfect forecast, 1 = worst possible',
    range: [0, 1],
    optimal: 'low',
  },
  pod: {
    label: 'POD',
    description: 'Probability of Detection when event occurs',
    range: [0, 1],
    optimal: 'high',
  },
  far: {
    label: 'FAR',
    description: 'False Alarm Rate when no event',
    range: [0, 1],
    optimal: 'low',
  },
  rocAuc: {
    label: 'ROC AUC',
    description: 'Area under ROC curve. 0.5 = random, 1 = perfect',
    range: [0.5, 1],
    optimal: 'high',
  },
  iou: {
    label: 'IoU',
    description: 'Intersection over Union for polygon accuracy',
    range: [0, 1],
    optimal: 'high',
  },
  hk: {
    label: 'HK Score',
    description: 'Hanssen-Kuipers skill score',
    range: [-1, 1],
    optimal: 'high',
  },
};

export default function ValidationMetricsChart({ metrics, className = '' }: ValidationMetricsChartProps) {
  const getScoreColor = (value: number, optimal: 'low' | 'high'): string => {
    if (optimal === 'low') {
      if (value < 0.15) return '#22c55e'; // Green
      if (value < 0.25) return '#eab308'; // Yellow
      if (value < 0.4) return '#f97316';  // Orange
      return '#ef4444';                    // Red
    } else {
      if (value > 0.85) return '#22c55e'; // Green
      if (value > 0.7) return '#eab308';  // Yellow
      if (value > 0.5) return '#f97316';  // Orange
      return '#ef4444';                    // Red
    }
  };

  const getBarWidth = (value: number, range: [number, number]): number => {
    const [min, max] = range;
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  // Build metric entries from available metrics
  const metricEntries: { key: string; value: number }[] = [];
  if (metrics.brierScore !== undefined) metricEntries.push({ key: 'brierScore', value: metrics.brierScore });
  if (metrics.pod !== undefined) metricEntries.push({ key: 'pod', value: metrics.pod });
  if (metrics.far !== undefined) metricEntries.push({ key: 'far', value: metrics.far });
  if (metrics.rocAuc !== undefined) metricEntries.push({ key: 'rocAuc', value: metrics.rocAuc });
  if (metrics.iou !== undefined) metricEntries.push({ key: 'iou', value: metrics.iou });
  if (metrics.hk !== undefined) metricEntries.push({ key: 'hk', value: metrics.hk });

  const brierScore = metrics.brierScore ?? 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Brier Score Highlight */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Primary Metric
            </div>
            <div className="text-lg font-bold text-white">
              Brier Score
            </div>
          </div>
          <motion.div 
            className="text-3xl font-mono font-bold"
            style={{ color: getScoreColor(brierScore, 'low') }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={brierScore}
          >
            {brierScore.toFixed(3)}
          </motion.div>
        </div>
        
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(1 - brierScore) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              background: `linear-gradient(90deg, ${getScoreColor(brierScore, 'low')}80, ${getScoreColor(brierScore, 'low')})`,
            }}
          />
          {/* Threshold markers */}
          <div className="absolute inset-y-0 left-[85%] w-px bg-yellow-500/50" />
          <div className="absolute inset-y-0 left-[75%] w-px bg-orange-500/50" />
          <div className="absolute inset-y-0 left-[60%] w-px bg-red-500/50" />
        </div>

        <div className="flex justify-between mt-1 text-[9px] text-white/30 font-mono">
          <span>1.0 (Worst)</span>
          <span>0.0 (Perfect)</span>
        </div>
      </div>

      {/* Other Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {metricEntries.filter(e => e.key !== 'brierScore').map(({ key, value }, idx) => {
          const info = METRIC_INFO[key];
          if (!info) return null;
          const color = getScoreColor(value, info.optimal);
          
          return (
            <motion.div 
              key={key}
              className="glass-panel rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-white/50 uppercase tracking-wider">
                  {info.label}
                </span>
                <span 
                  className="text-sm font-mono font-bold"
                  style={{ color }}
                >
                  {value.toFixed(2)}
                </span>
              </div>
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute inset-y-0 left-0 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getBarWidth(value, info.range)}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
