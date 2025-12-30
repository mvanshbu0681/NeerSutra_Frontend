/**
 * ============================================
 * Depth Profile Chart - DO vs Depth Visualization
 * Shows vertical DO profile with hypoxia threshold
 * ============================================
 */

'use client';

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DO_CRIT, type VerticalDOProfile } from '../../../../src/lib/che/types';

interface DepthProfileChartProps {
  profile: VerticalDOProfile;
  selectedDepth?: number;
  height?: number;
  className?: string;
}

export default function DepthProfileChart({
  profile,
  selectedDepth,
  height = 280,
  className = '',
}: DepthProfileChartProps) {
  // Transform data for recharts (depth on Y axis, DO on X axis)
  const chartData = useMemo(() => {
    return profile.depths.map((depth, i) => ({
      depth,
      DO: profile.DO_values[i],
      isHypoxic: profile.DO_values[i] <= DO_CRIT,
    }));
  }, [profile]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    const isHypoxic = data.DO <= DO_CRIT;
    
    return (
      <div className="glass-panel rounded-lg px-3 py-2 text-xs">
        <div className="text-white/60 mb-1">
          {data.depth === 0 ? 'Surface' : `${data.depth}m depth`}
        </div>
        <div className={`font-medium ${isHypoxic ? 'text-red-400' : 'text-cyan-400'}`}>
          DO: {data.DO.toFixed(2)} mg/L
        </div>
        {isHypoxic && (
          <div className="text-red-400/80 text-[10px] mt-1">
            ⚠ Below hypoxia threshold
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/90">
          Dissolved Oxygen Profile
        </h3>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white/50">Normal</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-white/50">Hypoxic</span>
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="doGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="25%" stopColor="#f59e0b" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="hypoxiaZone" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.08)" 
            horizontal={true}
            vertical={true}
          />
          
          <XAxis
            type="number"
            dataKey="DO"
            domain={[0, 'dataMax + 1']}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            label={{ 
              value: 'DO (mg/L)', 
              position: 'bottom',
              offset: -5,
              style: { fill: 'rgba(255,255,255,0.5)', fontSize: 10 }
            }}
          />
          
          <YAxis
            type="category"
            dataKey="depth"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickFormatter={(value) => value === 0 ? '0m' : `${value}m`}
            reversed
          />
          
          {/* Hypoxia threshold reference line */}
          <ReferenceLine
            x={DO_CRIT}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: `Hypoxia: ${DO_CRIT} mg/L`,
              position: 'top',
              fill: '#ef4444',
              fontSize: 9,
            }}
          />
          
          {/* Selected depth indicator */}
          {selectedDepth !== undefined && (
            <ReferenceLine
              y={selectedDepth}
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="none"
            />
          )}
          
          <Tooltip content={<CustomTooltip />} />
          
          <Area
            type="monotone"
            dataKey="DO"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#doGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Depth Legend */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
        <span className="text-[10px] text-white/40">Surface</span>
        <span className="text-[10px] text-white/40">→ Increasing Depth</span>
        <span className="text-[10px] text-white/40">100m</span>
      </div>
    </div>
  );
}
