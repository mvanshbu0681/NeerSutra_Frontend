'use client';

import { useState } from 'react';
import {
  Navigation,
  Fuel,
  Clock,
  AlertTriangle,
  Leaf,
  Anchor,
  ChevronRight,
  MapPin,
  Ship,
  Gauge,
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
import { AsyncView, SkeletonBox, SkeletonText } from '../../../../src/components/ui/AsyncView';
import type { Route } from '../../types';

interface GlassSidebarProps {
  className?: string;
}

/**
 * GlassSidebar - Route details and vessel info panel
 * Uses glassmorphism for "HUD" aesthetic
 */
export function GlassSidebar({ className }: GlassSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    selectedRoute,
    alternativeRoutes,
    origin,
    destination,
    optimizationWeights,
    setPreset,
    setSelectedRoute,
    isComputing,
  } = useRouteStore();
  const { selectedShip } = useMapStore();

  const presets = [
    { id: 'fastest', label: 'Fastest', icon: Clock, color: 'text-amber-400' },
    { id: 'greenest', label: 'Eco', icon: Leaf, color: 'text-emerald-400' },
    { id: 'safest', label: 'Safest', icon: AlertTriangle, color: 'text-red-400' },
    { id: 'balanced', label: 'Balanced', icon: Gauge, color: 'text-cyan-400' },
  ] as const;

  return (
    <div
      className={cn(
        'glass-panel rounded-xl transition-all duration-300 overflow-hidden',
        isExpanded ? 'w-80' : 'w-14',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Navigation className="w-5 h-5 text-cyan-400" />
          {isExpanded && (
            <span className="font-semibold text-white">Route Planner</span>
          )}
        </div>
        <ChevronRight
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </div>

      {isExpanded && (
        <AsyncView
          isLoading={isComputing}
          skeleton={<SidebarSkeleton />}
          minHeight="300px"
        >
          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          {/* Origin / Destination */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30" />
              <span className="text-sm text-gray-400">Origin</span>
              {origin && (
                <span className="font-mono text-xs text-white ml-auto">
                  {formatCoordinate(origin.lat, 'lat')}, {formatCoordinate(origin.lon, 'lon')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 ring-2 ring-red-400/30" />
              <span className="text-sm text-gray-400">Destination</span>
              {destination && (
                <span className="font-mono text-xs text-white ml-auto">
                  {formatCoordinate(destination.lat, 'lat')}, {formatCoordinate(destination.lon, 'lon')}
                </span>
              )}
            </div>
          </div>

          {/* Optimization Presets */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-mono">OPTIMIZATION MODE</span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isActive = 
                  (preset.id === 'fastest' && optimizationWeights.gamma > 0.5) ||
                  (preset.id === 'greenest' && optimizationWeights.beta > 0.4) ||
                  (preset.id === 'safest' && optimizationWeights.delta > 0.5) ||
                  (preset.id === 'balanced' && optimizationWeights.alpha === 0.3);
                
                return (
                  <button
                    key={preset.id}
                    onClick={() => setPreset(preset.id)}
                    className={cn(
                      'hud-button flex items-center gap-2 p-2 justify-center',
                      isActive && 'border-cyan-400 bg-cyan-500/10'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', preset.color)} />
                    <span className="text-xs">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Route Stats */}
          {selectedRoute && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">ROUTE STATISTICS</span>
                <span className="font-mono text-xs text-cyan-400">{selectedRoute.routeID}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<MapPin className="w-4 h-4" />}
                  label="Distance"
                  value={formatDistance(selectedRoute.totalDistance)}
                  color="text-blue-400"
                />
                <StatCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Duration"
                  value={formatDuration(
                    (new Date(selectedRoute.arrivalTime).getTime() -
                      new Date(selectedRoute.waypoints[0].time).getTime()) /
                      (1000 * 60 * 60)
                  )}
                  color="text-amber-400"
                />
                <StatCard
                  icon={<Fuel className="w-4 h-4" />}
                  label="Fuel"
                  value={formatFuel(selectedRoute.totalFuel)}
                  color="text-orange-400"
                />
                <StatCard
                  icon={<Leaf className="w-4 h-4" />}
                  label="CO₂"
                  value={formatCO2(selectedRoute.totalCO2)}
                  color="text-emerald-400"
                />
              </div>

              {/* Waypoints */}
              <div className="space-y-2">
                <span className="text-xs text-gray-500 font-mono">WAYPOINTS</span>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedRoute.waypoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="font-mono text-xs text-gray-500 w-4">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs text-white flex-1">
                        {formatCoordinate(wp.lat, 'lat')}, {formatCoordinate(wp.lon, 'lon')}
                      </span>
                      <span className="font-mono text-xs text-cyan-400">
                        {wp.speed.toFixed(1)} kn
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Ship Info */}
          {selectedShip && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-gray-500 font-mono">SELECTED VESSEL</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">MMSI</span>
                  <span className="font-mono text-white">{selectedShip.MMSI}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white">{selectedShip.shipType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Speed</span>
                  <span className="font-mono text-white">{selectedShip.SOG.toFixed(1)} kn</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Heading</span>
                  <span className="font-mono text-white">{selectedShip.heading.toFixed(0)}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size</span>
                  <span className="font-mono text-white">
                    {selectedShip.length}m × {selectedShip.beam}m
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Routes */}
          {alternativeRoutes.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-xs text-gray-500 font-mono">ALTERNATIVE ROUTES</span>
              {alternativeRoutes.map((route) => (
                <button
                  key={route.routeID}
                  onClick={() => setSelectedRoute(route)}
                  className="w-full hud-button p-3 text-left"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs text-gray-400">
                      {route.routeID}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-blue-400">{formatDistance(route.totalDistance)}</span>
                    <span className="text-orange-400">{formatFuel(route.totalFuel)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          </div>
        </AsyncView>
      )}
    </div>
  );
}

// Sidebar skeleton for loading state
function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Origin/Destination skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-3 h-3 rounded-full" />
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-3 w-24 ml-auto" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-3 h-3 rounded-full" />
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-3 w-24 ml-auto" />
        </div>
      </div>
      
      {/* Optimization presets skeleton */}
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-32" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Computing indicator */}
      <div className="flex items-center gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/30">
        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-cyan-400">Computing optimal route...</span>
      </div>
      
      {/* Stats skeleton */}
      <div className="space-y-3">
        <SkeletonBox className="h-3 w-28" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <SkeletonBox key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Stat card component
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
    <div className="bg-white/5 rounded-lg p-3">
      <div className={cn('flex items-center gap-2 mb-1', color)}>
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

export default GlassSidebar;
