'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Compass, Gauge, Anchor, ExternalLink, MapPin } from 'lucide-react';
import { useMapStore } from '../../store';
import { cn } from '../../types/utils';
import { formatCoordinate, formatSpeed } from '../../types/utils';
import type { AISData } from '../../types';

/**
 * ShipCalloutCard - Context-aware popup for selected vessels
 * Docks to the right side of the screen
 */
export function ShipCalloutCard() {
  const { selectedShip, setSelectedShip } = useMapStore();

  if (!selectedShip) return null;

  const shipTypeColors: Record<string, string> = {
    Cargo: 'from-emerald-400 to-emerald-600',
    Tanker: 'from-amber-400 to-orange-600',
    Container: 'from-blue-400 to-blue-600',
    Passenger: 'from-violet-400 to-purple-600',
    Fishing: 'from-teal-400 to-cyan-600',
    Other: 'from-slate-400 to-slate-600',
  };

  const gradientClass = shipTypeColors[selectedShip.shipType] || shipTypeColors.Other;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-80"
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <div className="glass-card overflow-hidden">
          {/* Header with gradient */}
          <div className={cn('bg-gradient-to-r p-5', gradientClass)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Ship className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-white/80 font-medium uppercase tracking-wider">
                    {selectedShip.shipType}
                  </p>
                  <p className="font-data text-lg text-white font-bold">
                    {selectedShip.MMSI}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={() => setSelectedShip(null)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Position */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Position</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="stat-card">
                  <span className="stat-label">Latitude</span>
                  <span className="stat-value text-base">
                    {formatCoordinate(selectedShip.latitude, 'lat')}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Longitude</span>
                  <span className="stat-value text-base">
                    {formatCoordinate(selectedShip.longitude, 'lon')}
                  </span>
                </div>
              </div>
            </div>

            {/* Movement */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Compass className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Movement</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-card">
                  <span className="stat-label">Speed</span>
                  <span className="stat-value text-base">
                    {selectedShip.SOG.toFixed(1)}
                    <span className="stat-unit">kn</span>
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Course</span>
                  <span className="stat-value text-base">
                    {selectedShip.COG.toFixed(0)}°
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Heading</span>
                  <span className="stat-value text-base">
                    {selectedShip.heading.toFixed(0)}°
                  </span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Anchor className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Vessel</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="stat-card">
                  <span className="stat-label">Length</span>
                  <span className="stat-value text-base">
                    {selectedShip.length.toFixed(0)}
                    <span className="stat-unit">m</span>
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Beam</span>
                  <span className="stat-value text-base">
                    {selectedShip.beam.toFixed(0)}
                    <span className="stat-unit">m</span>
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Draft</span>
                  <span className="stat-value text-base">
                    {selectedShip.draft.toFixed(1)}
                    <span className="stat-unit">m</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                className="btn-primary flex-1 py-3 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Track Vessel
              </motion.button>
              <motion.button
                className="btn-glass py-3 px-4 rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ShipCalloutCard;
