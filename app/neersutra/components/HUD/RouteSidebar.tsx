'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Fuel,
  Clock,
  Leaf,
  MapPin,
  Ship,
  ChevronLeft,
  ChevronRight,
  Gauge,
  AlertTriangle,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useRouteStore, useMapStore } from '../../store';
import { cn } from '../../types/utils';
import {
  formatDistance,
  formatFuel,
  formatCO2,
  formatDuration,
  formatCoordinate,
} from '../../types/utils';
import type { Route } from '../../types';

interface RouteSidebarProps {
  className?: string;
}

/**
 * RouteSidebar - Collapsible route planning sidebar
 * With improved spacing and visual hierarchy
 */
export function RouteSidebar({ className }: RouteSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    selectedRoute,
    alternativeRoutes,
    origin,
    destination,
    optimizationWeights,
    setPreset,
    isComputing,
  } = useRouteStore();

  const presets = [
    { id: 'fastest', label: 'Fastest', icon: Zap, description: 'Minimize time', color: '#fbbf24' },
    { id: 'greenest', label: 'Eco', icon: Leaf, description: 'Low emissions', color: '#34d399' },
    { id: 'safest', label: 'Safe', icon: AlertTriangle, description: 'Avoid risk', color: '#f87171' },
    { id: 'balanced', label: 'Balanced', icon: Gauge, description: 'Optimal mix', color: '#22d3ee' },
  ] as const;

  const getActivePreset = () => {
    if (optimizationWeights.gamma > 0.5) return 'fastest';
    if (optimizationWeights.beta > 0.4) return 'greenest';
    if (optimizationWeights.delta > 0.5) return 'safest';
    return 'balanced';
  };

  const activePreset = getActivePreset();

  return (
    <motion.div
      className={cn(
        'glass-panel flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-80',
        className
      )}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 }}
      layout
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#22d3ee] to-[#2997ff] flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display text-base text-white">Route Planner</h2>
                <p className="text-xs text-[#64748b]">Optimize your voyage</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-5 space-y-6"
          >
            {/* Origin / Destination */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Voyage
              </h3>
              
              <div className="space-y-3">
                {/* Origin */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-[#34d399] ring-4 ring-[#34d399]/20" />
                  <div className="flex-1">
                    <span className="text-xs text-[#64748b]">Origin</span>
                    {origin ? (
                      <p className="font-mono text-sm text-white">
                        {formatCoordinate(origin.lat, 'lat')}, {formatCoordinate(origin.lon, 'lon')}
                      </p>
                    ) : (
                      <p className="text-sm text-[#64748b]">Click map to set</p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-white/10" />
                </div>

                {/* Destination */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-[#f87171] ring-4 ring-[#f87171]/20" />
                  <div className="flex-1">
                    <span className="text-xs text-[#64748b]">Destination</span>
                    {destination ? (
                      <p className="font-mono text-sm text-white">
                        {formatCoordinate(destination.lat, 'lat')}, {formatCoordinate(destination.lon, 'lon')}
                      </p>
                    ) : (
                      <p className="text-sm text-[#64748b]">Click map to set</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Optimization Mode */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                Optimization
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = activePreset === preset.id;
                  
                  return (
                    <motion.button
                      key={preset.id}
                      onClick={() => setPreset(preset.id)}
                      className={cn(
                        'flex flex-col items-start gap-2 p-3 rounded-xl border transition-all text-left',
                        isActive
                          ? 'bg-white/[0.06] border-white/10'
                          : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isActive ? preset.color : '#64748b' }}
                      />
                      <div>
                        <p className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-white' : 'text-[#94a3b8]'
                        )}>
                          {preset.label}
                        </p>
                        <p className="text-xs text-[#64748b]">{preset.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Computing State */}
            {isComputing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-[#22d3ee]/10 border border-[#22d3ee]/20"
              >
                <div className="w-5 h-5 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[#22d3ee]">
                  Computing optimal route...
                </span>
              </motion.div>
            )}

            {/* Route Statistics */}
            {selectedRoute && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                    Route Details
                  </h3>
                  <span className="font-mono text-xs text-[#22d3ee]">
                    {selectedRoute.routeID}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    icon={<MapPin className="w-4 h-4" />}
                    label="Distance"
                    value={formatDistance(selectedRoute.totalDistance)}
                    color="#2997ff"
                  />
                  <StatCard
                    icon={<Clock className="w-4 h-4" />}
                    label="Duration"
                    value={formatDuration(
                      (new Date(selectedRoute.arrivalTime).getTime() -
                        new Date(selectedRoute.waypoints[0].time).getTime()) /
                        (1000 * 60 * 60)
                    )}
                    color="#fbbf24"
                  />
                  <StatCard
                    icon={<Fuel className="w-4 h-4" />}
                    label="Fuel"
                    value={formatFuel(selectedRoute.totalFuel)}
                    color="#f97316"
                  />
                  <StatCard
                    icon={<Leaf className="w-4 h-4" />}
                    label="CO₂"
                    value={formatCO2(selectedRoute.totalCO2)}
                    color="#34d399"
                  />
                </div>

                {/* Waypoints Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748b]">
                      {selectedRoute.waypoints.length} waypoints
                    </span>
                    <button className="text-xs text-[#22d3ee] hover:underline">
                      View all
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Compute Button */}
            {origin && destination && (
              <motion.button
                className="w-full py-3 rounded-2xl font-medium bg-gradient-to-r from-[#22d3ee] to-[#2997ff] text-black shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(34, 211, 238, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                disabled={isComputing}
              >
                <BarChart3 className="w-5 h-5" />
                Compute Route
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Icons */}
      <AnimatePresence mode="wait">
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.button className="p-3 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors" whileHover={{ scale: 1.1 }}>
              <MapPin className="w-5 h-5" />
            </motion.button>
            <motion.button className="p-3 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors" whileHover={{ scale: 1.1 }}>
              <Gauge className="w-5 h-5" />
            </motion.button>
            <motion.button className="p-3 rounded-xl text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors" whileHover={{ scale: 1.1 }}>
              <BarChart3 className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Stat Card sub-component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-center gap-2 mb-1" style={{ color }}>
        {icon}
        <span className="text-xs text-[#64748b] uppercase tracking-wider">{label}</span>
      </div>
      <span className="font-mono text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default RouteSidebar;
