/**
 * ============================================
 * PEI Radar Chart - 5-Component Pollution Visualization
 * Shows NO3, PO4, Turbidity, CDOM, Chl contributions
 * ============================================
 */

'use client';

import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import type { PEIComponents } from '../../../../src/lib/che/types';
import { PEI_WEIGHTS } from '../../../../src/lib/che/types';

interface PollutionRadarProps {
  components: PEIComponents;
  peiValue: number;
  height?: number;
  className?: string;
}

// Component display config
const COMPONENT_CONFIG = {
  NO3_norm: { 
    label: 'NO₃', 
    fullName: 'Nitrate',
    color: '#f472b6',
    weight: PEI_WEIGHTS.alpha1,
  },
  PO4_norm: { 
    label: 'PO₄', 
    fullName: 'Phosphate',
    color: '#c084fc',
    weight: PEI_WEIGHTS.alpha2,
  },
  Turbidity_norm: { 
    label: 'Turb', 
    fullName: 'Turbidity',
    color: '#60a5fa',
    weight: PEI_WEIGHTS.alpha3,
  },
  CDOM_norm: { 
    label: 'CDOM', 
    fullName: 'Dissolved Organic Matter',
    color: '#4ade80',
    weight: PEI_WEIGHTS.alpha4,
  },
  Chl_norm: { 
    label: 'Chl-a', 
    fullName: 'Chlorophyll-a',
    color: '#22d3ee',
    weight: PEI_WEIGHTS.alpha5,
  },
};

export default function PollutionRadar({
  components,
  peiValue,
  height = 280,
  className = '',
}: PollutionRadarProps) {
  // Transform data for radar chart
  const chartData = useMemo(() => {
    return Object.entries(components).map(([key, value]) => {
      const config = COMPONENT_CONFIG[key as keyof typeof COMPONENT_CONFIG];
      return {
        component: config.label,
        value: value * 100, // Convert to percentage
        fullValue: value,
        fullName: config.fullName,
        weight: config.weight,
      };
    });
  }, [components]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    const severity = data.fullValue > 0.7 ? 'High' : data.fullValue > 0.4 ? 'Moderate' : 'Low';
    const severityColor = data.fullValue > 0.7 ? '#ef4444' : data.fullValue > 0.4 ? '#fbbf24' : '#34d399';
    
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs">
        <div className="font-medium text-white/90 mb-1">{data.fullName}</div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-white/60">Normalized:</span>
          <span className="font-medium" style={{ color: severityColor }}>
            {(data.fullValue * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-white/60">Weight (α):</span>
          <span className="text-white/80">{data.weight}</span>
        </div>
        <div className="text-[10px] mt-1 pt-1 border-t border-white/10" style={{ color: severityColor }}>
          {severity} contribution to PEI
        </div>
      </div>
    );
  };

  // Get PEI severity
  const peiSeverity = peiValue > 0.6 ? 'Eutrophic' : peiValue > 0.3 ? 'Mesotrophic' : 'Oligotrophic';
  const peiColor = peiValue > 0.6 ? '#ec4899' : peiValue > 0.3 ? '#a855f7' : '#3b82f6';

  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/90">
          Pollution-Eutrophication Index
        </h3>
        <div className="flex items-center gap-2">
          <span 
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ 
              backgroundColor: `${peiColor}20`,
              color: peiColor,
            }}
          >
            {peiSeverity}
          </span>
          <span 
            className="text-sm font-bold"
            style={{ color: peiColor }}
          >
            {peiValue.toFixed(2)}
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <defs>
            <linearGradient id="peiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          <PolarGrid 
            stroke="rgba(255,255,255,0.15)"
            gridType="polygon"
          />
          
          <PolarAngleAxis
            dataKey="component"
            tick={{ 
              fill: 'rgba(255,255,255,0.7)', 
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }}
            tickCount={5}
            axisLine={false}
          />
          
          <Radar
            name="Pollution"
            dataKey="value"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#peiGradient)"
            dot={{
              r: 4,
              fill: '#a855f7',
              stroke: '#ffffff',
              strokeWidth: 1,
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Component breakdown */}
      <div className="grid grid-cols-5 gap-1 mt-2 pt-2 border-t border-white/10">
        {Object.entries(COMPONENT_CONFIG).map(([key, config]) => {
          const value = components[key as keyof PEIComponents];
          return (
            <motion.div
              key={key}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span 
                className="text-[10px] font-medium"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-[9px] text-white/50">
                {(value * 100).toFixed(0)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
