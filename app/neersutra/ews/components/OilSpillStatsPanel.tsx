/**
 * ============================================
 * Oil Spill Stats Panel
 * IOHD-EWS: Oil spill trajectory statistics
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Droplet, 
  Wind, 
  Clock, 
  MapPin,
  TrendingUp,
  Waves,
  AlertCircle,
} from 'lucide-react';
import { type HazardEvent, HAZARD_CONFIG } from '../../../../src/lib/ews/types';

interface OilSpillStatsPanelProps {
  event: HazardEvent;
  particleCount: number;
  currentHour: number;
  className?: string;
}

export default function OilSpillStatsPanel({ 
  event, 
  particleCount, 
  currentHour,
  className = '' 
}: OilSpillStatsPanelProps) {
  const config = HAZARD_CONFIG.oil_spill;
  
  // Calculate spread statistics
  const currentPolygon = event.polygons[Math.min(
    Math.floor(currentHour / 3),
    event.polygons.length - 1
  )];
  
  const seedCoords = event.seedPolygon?.coordinates[0] || [];
  const currentCoords = currentPolygon?.geometry.coordinates[0] || [];
  
  // Estimate area (rough approximation)
  const estimateArea = (coords: number[][]) => {
    if (coords.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1];
      area -= coords[i + 1][0] * coords[i][1];
    }
    return Math.abs(area / 2) * 111 * 111; // Convert to km²
  };
  
  const initialArea = estimateArea(seedCoords);
  const currentArea = estimateArea(currentCoords);
  const spreadRatio = initialArea > 0 ? currentArea / initialArea : 1;

  return (
    <motion.div
      className={`glass-panel rounded-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ borderTop: `3px solid ${config.accentColor}` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Lagrangian Trajectory
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">💧</span>
              Oil Spill Forecast
            </h3>
          </div>
          <div 
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: `${config.accentColor}30` }}
          >
            <span 
              className="text-sm font-bold"
              style={{ color: config.accentColor }}
            >
              T+{currentHour}h
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Particle Count */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Particles</span>
          </div>
          <div 
            className="text-xl font-mono font-bold"
            style={{ color: config.accentColor }}
          >
            {particleCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40">Active tracers</div>
        </div>

        {/* Spread Area */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Spread</span>
          </div>
          <div className="text-xl font-mono font-bold text-orange-400">
            {spreadRatio.toFixed(1)}×
          </div>
          <div className="text-[10px] text-white/40">From initial</div>
        </div>

        {/* Current Area */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Area</span>
          </div>
          <div className="text-sm font-mono text-white">
            ~{currentArea.toFixed(0)} km²
          </div>
        </div>

        {/* Probability */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Confidence</span>
          </div>
          <div className="text-sm font-mono text-white">
            {((currentPolygon?.probability || 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Ensemble Info */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">
            Ensemble Configuration
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-purple-400">50</div>
              <div className="text-[9px] text-white/40">Atmospheric</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-400">4</div>
              <div className="text-[9px] text-white/40">Ocean</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">10</div>
              <div className="text-[9px] text-white/40">Stochastic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Parameters */}
      <div className="px-4 pb-4">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          Transport Parameters
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3 text-white/40" />
              <span className="text-white/60">Windage Factor</span>
            </div>
            <span className="font-mono text-white">3%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Waves className="w-3 h-3 text-white/40" />
              <span className="text-white/60">Diffusivity</span>
            </div>
            <span className="font-mono text-white">100 m²/s</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-white/40" />
              <span className="text-white/60">Timestep</span>
            </div>
            <span className="font-mono text-white">3 hours</span>
          </div>
        </div>
      </div>

      {/* Probability Timeline */}
      <div className="px-4 pb-4">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          Probability Decay
        </div>
        <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex">
            {event.polygons.slice(0, 8).map((poly, idx) => (
              <div
                key={idx}
                className="flex-1 flex items-end px-0.5"
              >
                <div 
                  className="w-full rounded-t"
                  style={{
                    height: `${poly.probability * 100}%`,
                    backgroundColor: idx <= Math.floor(currentHour / 3) 
                      ? config.accentColor 
                      : `${config.accentColor}50`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-white/30 mt-1">
          <span>T+0h</span>
          <span>T+24h</span>
        </div>
      </div>
    </motion.div>
  );
}
