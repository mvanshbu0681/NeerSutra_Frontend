/**
 * ============================================
 * CHE Details Panel - Complete Location Analysis
 * Side panel showing all CHE metrics and visualizations
 * ============================================
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCHEStore } from '../../../../src/store/useCHEStore';
import DepthProfileChart from './DepthProfileChart';
import RiskGauge from './RiskGauge';
import PollutionRadar from './PollutionRadar';
import ORSCard from './ORSCard';
import type { LocationAnalysis } from '../../../../src/lib/che/types';

interface CHEDetailsPanelProps {
  analysis: LocationAnalysis;
  onClose: () => void;
}

export default function CHEDetailsPanel({
  analysis,
  onClose,
}: CHEDetailsPanelProps) {
  const { selectedDepth } = useCHEStore();
  const { location, indices, doProfile, peiComponents, physical, hypoxia, T_rec, surfaceBGC } = analysis;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-0 top-0 h-full w-[420px] z-50 flex flex-col"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Backdrop blur */}
        <div 
          className="absolute inset-0 glass-panel-solid"
          style={{
            borderLeft: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Coastal Health Analysis
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/50">
                    {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
                  </span>
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: indices.riskLevel === 'safe' ? 'rgba(52, 211, 153, 0.2)' :
                                       indices.riskLevel === 'warning' ? 'rgba(251, 191, 36, 0.2)' :
                                       'rgba(239, 68, 68, 0.2)',
                      color: indices.riskLevel === 'safe' ? '#34d399' :
                             indices.riskLevel === 'warning' ? '#fbbf24' :
                             '#ef4444',
                    }}
                  >
                    {indices.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3">
              <QuickStatCard
                label="DZRI"
                value={indices.DZRI}
                color={indices.DZRI < 0.3 ? '#34d399' : indices.DZRI < 0.6 ? '#fbbf24' : '#ef4444'}
              />
              <QuickStatCard
                label="PEI"
                value={indices.PEI}
                color={indices.PEI < 0.3 ? '#3b82f6' : indices.PEI < 0.6 ? '#a855f7' : '#ec4899'}
              />
              <QuickStatCard
                label="ORS"
                value={indices.ORS}
                color={indices.ORS > 0.6 ? '#34d399' : indices.ORS > 0.3 ? '#fbbf24' : '#ef4444'}
              />
            </div>
            
            {/* DZRI Gauge */}
            <RiskGauge 
              value={indices.DZRI} 
              label="Dead Zone Risk Index (DZRI)"
              size={150}
            />
            
            {/* DO Profile */}
            <DepthProfileChart 
              profile={doProfile}
              selectedDepth={selectedDepth}
              height={240}
            />
            
            {/* PEI Radar */}
            <PollutionRadar 
              components={peiComponents}
              peiValue={indices.PEI}
              height={240}
            />
            
            {/* ORS Card */}
            <ORSCard 
              ors={indices.ORS}
              recoveryTime={T_rec}
            />
            
            {/* Physical Context */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Physical Context
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <PhysicalMetric label="SST" value={`${physical.SST.toFixed(1)}°C`} />
                <PhysicalMetric label="MLD" value={`${physical.MLD.toFixed(1)}m`} />
                <PhysicalMetric label="Stratification" value={`${(physical.S_strat * 100).toFixed(0)}%`} />
                <PhysicalMetric label="Bathymetry" value={`${physical.bathymetry.toFixed(0)}m`} />
                <PhysicalMetric label="Dist. to Coast" value={`${physical.distanceToCoast.toFixed(1)}km`} />
                <PhysicalMetric label="Hypoxic Fraction" value={`${(hypoxia.f_hyp * 100).toFixed(0)}%`} />
              </div>
            </div>
            
            {/* Surface BGC */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">
                Surface Biogeochemistry
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <BGCMetric label="DO" value={surfaceBGC.DO} unit="mg/L" />
                <BGCMetric label="NO₃" value={surfaceBGC.NO3} unit="μmol/L" />
                <BGCMetric label="PO₄" value={surfaceBGC.PO4} unit="μmol/L" />
                <BGCMetric label="Chl-a" value={surfaceBGC.Chl} unit="μg/L" />
                <BGCMetric label="Turbidity" value={surfaceBGC.Turbidity} unit="NTU" />
                <BGCMetric label="CDOM" value={surfaceBGC.CDOM} unit="m⁻¹" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper components
function QuickStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-panel rounded-lg p-3 text-center">
      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
        {label}
      </span>
      <span className="text-xl font-bold" style={{ color }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function PhysicalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-medium text-white/90">{value}</span>
    </div>
  );
}

function BGCMetric({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs font-medium text-cyan-400">
        {value.toFixed(2)} <span className="text-white/40">{unit}</span>
      </span>
    </div>
  );
}
