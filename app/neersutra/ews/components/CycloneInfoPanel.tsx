/**
 * ============================================
 * Cyclone Info Panel
 * IOHD-EWS: Detailed cyclone track information
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { 
  Wind, 
  TrendingUp, 
  MapPin, 
  Clock, 
  AlertTriangle,
  ThermometerSun,
  Waves,
} from 'lucide-react';
import { type CycloneTrack, type CycloneTrackPoint, HAZARD_CONFIG } from '../../../../src/lib/ews/types';

interface CycloneInfoPanelProps {
  track: CycloneTrack;
  currentHour: number;
  className?: string;
}

const CATEGORY_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Tropical Storm' },
  1: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Category 1' },
  2: { bg: 'bg-yellow-600/20', text: 'text-yellow-500', label: 'Category 2' },
  3: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Category 3' },
  4: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Category 4' },
  5: { bg: 'bg-red-700/20', text: 'text-red-500', label: 'Category 5' },
};

function formatWindSpeed(ms: number): string {
  return `${Math.round(ms * 1.944)} kt / ${Math.round(ms * 3.6)} km/h`;
}

export default function CycloneInfoPanel({ track, currentHour, className = '' }: CycloneInfoPanelProps) {
  const config = HAZARD_CONFIG.cyclone;
  const currentPointIdx = Math.min(
    Math.floor(currentHour / 6),
    track.trackPoints.length - 1
  );
  const currentPoint = track.trackPoints[currentPointIdx];
  const categoryInfo = CATEGORY_COLORS[currentPoint?.category ?? 0];

  if (!currentPoint) {
    return null;
  }

  return (
    <motion.div
      className={`glass-panel rounded-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ borderTop: `3px solid ${config.accentColor}` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
              {track.basin}
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🌀</span>
              {track.name}
            </h3>
            <div className="text-xs text-white/50">{track.designation}</div>
          </div>
          <div 
            className={`px-3 py-1.5 rounded-lg ${categoryInfo.bg}`}
          >
            <span className={`text-sm font-bold ${categoryInfo.text}`}>
              {categoryInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Position */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Position</span>
          </div>
          <div className="text-sm font-mono text-white">
            {currentPoint.lat.toFixed(2)}°N, {currentPoint.lon.toFixed(2)}°E
          </div>
        </div>

        {/* Max Wind */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Max Wind</span>
          </div>
          <div 
            className="text-sm font-mono font-bold"
            style={{ color: config.accentColor }}
          >
            {formatWindSpeed(currentPoint.intensity)}
          </div>
        </div>

        {/* Central Pressure */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <ThermometerSun className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Pressure</span>
          </div>
          <div className="text-sm font-mono text-white">
            {Math.round(currentPoint.centralPressure)} hPa
          </div>
        </div>

        {/* RMax */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Eye Radius</span>
          </div>
          <div className="text-sm font-mono text-white">
            {Math.round(currentPoint.rMax)} km
          </div>
        </div>
      </div>

      {/* Uncertainty */}
      <div className="px-4 pb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500/60" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Forecast Uncertainty (T+{currentPointIdx * 6}h)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-white/50">Position: </span>
              <span className="text-white font-mono">
                ±{Math.round(currentPoint.uncertainty.positionErrorKm)} km
              </span>
            </div>
            <div>
              <span className="text-white/50">Intensity: </span>
              <span className="text-white font-mono">
                ±{currentPoint.uncertainty.intensityErrorMs.toFixed(1)} m/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Track Preview */}
      <div className="px-4 pb-4">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          Forecast Track
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {track.trackPoints.slice(0, 10).map((point, idx) => {
            const isCurrent = idx === currentPointIdx;
            const catColor = CATEGORY_COLORS[point.category];
            
            return (
              <div
                key={idx}
                className={`
                  flex-shrink-0 w-12 rounded-lg p-1.5 text-center
                  ${isCurrent ? 'ring-2 ring-white/30' : ''}
                  ${catColor.bg}
                `}
              >
                <div className="text-[9px] text-white/50">+{idx * 6}h</div>
                <div className={`text-xs font-bold ${catColor.text}`}>
                  C{point.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storm Surge */}
      {track.surgeForecast && (
        <div className="px-4 pb-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-400">
                Storm Surge Warning
              </span>
            </div>
            <p className="text-xs text-white/70">
              Maximum surge of <strong className="text-red-400">{track.surgeForecast.maxSurgeM.toFixed(1)}m</strong> expected at landfall
            </p>
          </div>
        </div>
      )}

      {/* Potential Intensity */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Potential Intensity (PI):</span>
          <span className="font-mono text-white/60">
            {formatWindSpeed(track.potentialIntensity)}
          </span>
        </div>
        <div className="mt-1 relative h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${(currentPoint.intensity / track.potentialIntensity) * 100}%`,
              background: `linear-gradient(90deg, ${config.gradientFrom}, ${config.gradientTo})`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-white/30 mt-1">
          <span>Current: {Math.round(currentPoint.intensity)} m/s</span>
          <span>Max Potential: {Math.round(track.potentialIntensity)} m/s</span>
        </div>
      </div>
    </motion.div>
  );
}
