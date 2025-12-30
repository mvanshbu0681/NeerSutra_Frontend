/**
 * ============================================
 * CHE Analytics Panel - Right Sidebar
 * Charts, Gauges, and Detailed Metrics
 * ============================================
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCHEStore } from '../../../../src/store/useCHEStore';
import type { LocationAnalysis } from '../../../../src/lib/che/types';
import DepthProfileChart from '../../components/CHE/DepthProfileChart';
import RiskGauge from '../../components/CHE/RiskGauge';
import PollutionRadar from '../../components/CHE/PollutionRadar';
import ORSCard from '../../components/CHE/ORSCard';

interface AnalyticsPanelProps {
  analysis: LocationAnalysis | null;
}

export default function AnalyticsPanel({ analysis }: AnalyticsPanelProps) {
  const { selectedDepth } = useCHEStore();

  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-[280px]">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-white/80 mb-2">
            Select a Location
          </h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Click anywhere on the map to analyze coastal health metrics for that location.
          </p>
        </div>
      </div>
    );
  }

  const { location, indices, doProfile, peiComponents, physical, T_rec, surfaceBGC } = analysis;

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto scrollbar-hide">
      {/* Location Header */}
      <motion.div 
        className="glass-panel rounded-2xl p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`${location.lat}-${location.lon}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
              Analyzing Location
            </span>
            <span className="text-sm font-medium text-white/90 font-mono tabular-nums">
              {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </span>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: indices.riskLevel === 'safe' ? 'rgba(52, 211, 153, 0.2)' :
                               indices.riskLevel === 'warning' ? 'rgba(251, 191, 36, 0.2)' :
                               'rgba(239, 68, 68, 0.2)',
              color: indices.riskLevel === 'safe' ? '#34d399' :
                     indices.riskLevel === 'warning' ? '#fbbf24' :
                     '#ef4444',
            }}
          >
            {indices.riskLevel.toUpperCase()} ZONE
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <QuickStat 
          label="DZRI" 
          value={indices.DZRI} 
          color={indices.DZRI < 0.3 ? '#34d399' : indices.DZRI < 0.6 ? '#fbbf24' : '#ef4444'}
        />
        <QuickStat 
          label="PEI" 
          value={indices.PEI} 
          color={indices.PEI < 0.3 ? '#3b82f6' : indices.PEI < 0.6 ? '#a855f7' : '#ec4899'}
        />
        <QuickStat 
          label="ORS" 
          value={indices.ORS} 
          color={indices.ORS > 0.6 ? '#34d399' : indices.ORS > 0.3 ? '#fbbf24' : '#ef4444'}
        />
      </div>

      {/* Risk Gauge */}
      <RiskGauge 
        value={indices.DZRI} 
        label="Dead Zone Risk Index"
        size={140}
      />

      {/* DO Profile Chart */}
      <DepthProfileChart 
        profile={doProfile}
        selectedDepth={selectedDepth}
        height={200}
      />

      {/* Pollution Radar */}
      <PollutionRadar 
        components={peiComponents}
        peiValue={indices.PEI}
        height={200}
      />

      {/* ORS Card */}
      <ORSCard 
        ors={indices.ORS}
        recoveryTime={T_rec}
      />

      {/* Physical Context */}
      <div className="glass-panel rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Physical Context
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricRow label="SST" value={`${physical.SST.toFixed(1)}°C`} />
          <MetricRow label="MLD" value={`${physical.MLD.toFixed(1)}m`} />
          <MetricRow label="Stratification" value={`${(physical.S_strat * 100).toFixed(0)}%`} />
          <MetricRow label="Bathymetry" value={`${physical.bathymetry.toFixed(0)}m`} />
        </div>
      </div>

      {/* Surface BGC */}
      <div className="glass-panel rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Surface Biogeochemistry
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <MetricRow label="DO" value={`${surfaceBGC.DO.toFixed(2)} mg/L`} highlight />
          <MetricRow label="NO₃" value={`${surfaceBGC.NO3.toFixed(1)} μmol/L`} />
          <MetricRow label="PO₄" value={`${surfaceBGC.PO4.toFixed(2)} μmol/L`} />
          <MetricRow label="Chl-a" value={`${surfaceBGC.Chl.toFixed(1)} μg/L`} />
        </div>
      </div>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-panel rounded-xl p-3 text-center">
      <span className="text-[9px] uppercase tracking-wider text-white/40 block mb-1">
        {label}
      </span>
      <span 
        className="text-lg font-bold tabular-nums"
        style={{ color }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
}

// Metric Row Component
function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <span className="text-[10px] text-white/50">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-cyan-400' : 'text-white/80'}`}>
        {value}
      </span>
    </div>
  );
}
