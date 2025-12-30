/**
 * ============================================
 * Data Command Menu - Context-Aware Mission Data Center
 * Displays mission-specific data & controls based on active page
 * ============================================
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { 
  Database, 
  X,
  Filter,
  AlertTriangle,
  Waves,
  Fish,
  Ship,
  Thermometer,
  Droplet,
  Activity,
  TrendingUp,
  MapPin,
  Gauge,
  Anchor,
} from 'lucide-react';

// Store imports
import { useEWSStore, useFilteredEvents } from '../../../../src/store/useEWSStore';
import { useCHEStore } from '../../../../src/store/useCHEStore';
import { usePFZStore, useHighPotentialZones } from '../../../../src/store/usePFZStore';

// Type imports
import { SEVERITY_CONFIG, HAZARD_CONFIG, type AlertSeverity } from '../../../../src/lib/ews/types';

interface DataCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_ORDER: (AlertSeverity | 'all')[] = ['all', 'extreme', 'severe', 'moderate', 'minor'];

// ─────────────────────────────────────────────────────────────
// EWS Data View - Severity Filter & Event Stats
// ─────────────────────────────────────────────────────────────

function EWSDataView() {
  const { severityFilter, setSeverityFilter, activeHazard, events } = useEWSStore();
  const filteredEvents = useFilteredEvents();
  const hazardConfig = HAZARD_CONFIG[activeHazard];

  // Count events by severity
  const severityCounts = filteredEvents.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<AlertSeverity, number>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
            boxShadow: `0 0 20px ${hazardConfig.accentColor}40`,
          }}
        >
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Hazard Watch</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{hazardConfig.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-white">{filteredEvents.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Active Events</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-red-400">
            {(severityCounts['extreme'] || 0) + (severityCounts['severe'] || 0)}
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Critical</div>
        </div>
      </div>

      {/* Severity Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3.5 h-3.5 text-white/50" />
          <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
            Filter by Severity
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SEVERITY_ORDER.map((severity) => {
            const isActive = severityFilter === severity;
            const count = severity === 'all' 
              ? filteredEvents.length 
              : severityCounts[severity] || 0;
            
            const config = severity !== 'all' ? SEVERITY_CONFIG[severity] : null;
            const color = config?.color || '#94a3b8';
            const label = config?.label || 'All';

            return (
              <motion.button
                key={severity}
                onClick={() => setSeverityFilter(severity)}
                className={`
                  relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                  text-[11px] font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-white/15 border border-white/20' 
                    : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                  style={{ 
                    backgroundColor: color,
                    boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                  }}
                />
                <span 
                  className={isActive ? 'text-white' : 'text-white/60'}
                  style={isActive ? { color } : {}}
                >
                  {label}
                </span>
                {count > 0 && (
                  <span 
                    className={`
                      ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                      ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}
                    `}
                  >
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Active Filter Indicator */}
        {severityFilter !== 'all' && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 pt-2 border-t border-white/5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40">
                Showing <span className="text-white/70 font-medium">{SEVERITY_CONFIG[severityFilter].label}</span> only
              </span>
              <button
                onClick={() => setSeverityFilter('all')}
                className="text-[10px] text-white/40 hover:text-white/60 underline transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHE Data View - Coastal Health Stats
// ─────────────────────────────────────────────────────────────

function CHEDataView() {
  const { 
    selectedDepth, 
    activeLayer, 
    simulationGrid,
    selectedLocation,
    showHypoxiaZones,
    showContours,
  } = useCHEStore();

  // Calculate mock stats from grid (in real app, this would come from actual data)
  const gridStats = {
    avgDZRI: 0.65,
    hypoxiaZones: 3,
    safeZones: 12,
    criticalZones: 2,
  };

  const layerLabels: Record<string, string> = {
    dzri: 'Dead Zone Risk Index',
    pei: 'Pollution Exposure Index',
    ors: 'Ocean Resilience Score',
    do: 'Dissolved Oxygen',
    none: 'No Layer',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Waves className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Coastal Health</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">{layerLabels[activeLayer]}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-400" />
            <div className="text-lg font-bold text-white">{selectedDepth}m</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Depth</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-amber-400" />
            <div className="text-lg font-bold text-white">{(gridStats.avgDZRI * 100).toFixed(0)}%</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Avg DZRI</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-lg font-bold text-emerald-400">{gridStats.safeZones}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Safe Zones</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-lg font-bold text-red-400">{gridStats.hypoxiaZones}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Hypoxia Zones</div>
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="space-y-2">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">Active Overlays</div>
        <div className="flex flex-wrap gap-2">
          <div className={`px-2.5 py-1.5 rounded-lg text-[11px] ${showHypoxiaZones ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/40'}`}>
            Hypoxia Zones {showHypoxiaZones ? '✓' : ''}
          </div>
          <div className={`px-2.5 py-1.5 rounded-lg text-[11px] ${showContours ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
            Contours {showContours ? '✓' : ''}
          </div>
        </div>
      </div>

      {/* Selected Location */}
      {selectedLocation && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-emerald-400">Selected Location</span>
          </div>
          <div className="text-[10px] text-white/60">
            {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PFZ Data View - Fishing Zone Stats
// ─────────────────────────────────────────────────────────────

function PFZDataView() {
  const { 
    selectedSpecies, 
    currentForecast, 
    hsiThreshold,
    viewMode,
    showContours,
    selectedZone,
  } = usePFZStore();
  
  const highPotentialZones = useHighPotentialZones();
  const allZones = currentForecast?.polygons ?? [];

  // Calculate average confidence
  const avgConfidence = allZones.length > 0
    ? allZones.reduce((sum, z) => sum + z.confidence, 0) / allZones.length
    : 0;

  const speciesLabels: Record<string, string> = {
    indian_mackerel: 'Indian Mackerel',
    oil_sardine: 'Oil Sardine',
    skipjack_tuna: 'Skipjack Tuna',
    yellowfin_tuna: 'Yellowfin Tuna',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Fish className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Fishing Zones</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            {speciesLabels[selectedSpecies] || selectedSpecies}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-amber-400">{highPotentialZones.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">High Potential</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-white">{allZones.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Zones</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div className="text-lg font-bold text-white">{(avgConfidence * 100).toFixed(0)}%</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Avg Confidence</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-lg font-bold text-white">{(hsiThreshold * 100).toFixed(0)}%</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">HSI Threshold</div>
        </div>
      </div>

      {/* View Mode */}
      <div className="space-y-2">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">View Mode</div>
        <div className="flex gap-2">
          {['heatmap', 'contour', 'zones'].map((mode) => (
            <div 
              key={mode}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] capitalize ${
                viewMode === mode 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-white/5 text-white/40'
              }`}
            >
              {mode}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Zone */}
      {selectedZone && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-amber-400">Selected Zone</span>
          </div>
          <div className="text-[10px] text-white/60">
            HSI: {(selectedZone.meanHSI * 100).toFixed(0)}% • Confidence: {(selectedZone.confidence * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fleet Data View - Vessel Stats (Placeholder)
// ─────────────────────────────────────────────────────────────

function FleetDataView() {
  // Mock fleet data (in real app, would come from fleet store)
  const fleetStats = {
    totalVessels: 24,
    activeVessels: 18,
    fuelConsumption: 2340,
    maintenanceAlerts: 3,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <Ship className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Fleet Tracking</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Real-time Monitoring</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-cyan-400">{fleetStats.activeVessels}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Active Vessels</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-2xl font-bold text-white">{fleetStats.totalVessels}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Fleet</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <div className="text-lg font-bold text-white">{fleetStats.fuelConsumption}</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Fuel (L/hr)</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div className="text-lg font-bold text-amber-400">{fleetStats.maintenanceAlerts}</div>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Maintenance</div>
        </div>
      </div>

      {/* Fleet Status */}
      <div className="space-y-2">
        <div className="text-[10px] text-white/50 uppercase tracking-wider">Fleet Status</div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {fleetStats.activeVessels} Online
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/40 text-[11px]">
            {fleetStats.totalVessels - fleetStats.activeVessels} Docked
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function DataCommandMenu({ isOpen, onClose }: DataCommandMenuProps) {
  const pathname = usePathname();

  // Determine active mission from pathname
  const isEWS = pathname?.includes('/ews');
  const isPFZ = pathname?.includes('/pfz');
  const isCHE = pathname?.includes('/che');
  const isFleet = pathname === '/neersutra' || (!isEWS && !isPFZ && !isCHE);

  // Get mission label
  const getMissionLabel = () => {
    if (isEWS) return 'EWS';
    if (isPFZ) return 'PFZ';
    if (isCHE) return 'CHE';
    return 'FLEET';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full right-0 mt-2 w-80 z-50 rounded-2xl overflow-hidden bg-[#0a0a12]/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-white/50" />
                <span className="text-sm font-medium text-white">Data Center</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white/60">
                  {getMissionLabel()}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isEWS && <EWSDataView />}
              {isCHE && <CHEDataView />}
              {isPFZ && <PFZDataView />}
              {isFleet && <FleetDataView />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
