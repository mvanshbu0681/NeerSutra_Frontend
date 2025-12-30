/**
 * ============================================
 * Dashboard Controls Component
 * Search, Filter, Time Range & Live Mode controls
 * ============================================
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  Radio,
  X,
  ChevronDown,
  RefreshCw,
  Zap,
  AlertTriangle,
  Waves,
  Fish,
  Ship,
  MapPin,
} from 'lucide-react';
import type { DashboardFilters, TimeRange } from '../hooks/useDashboardData';
import { HAZARD_CONFIG, type HazardType } from '../../src/lib/ews/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface DashboardControlsProps {
  filters: DashboardFilters;
  onUpdateFilters: (updates: Partial<DashboardFilters>) => void;
  onReset: () => void;
  onToggleLive: () => void;
  activeTab: 'ews' | 'che' | 'pfz' | 'fleet';
  summaryStats: {
    ews: { totalEvents: number; criticalAlerts: number };
    che: { dzriScore: number };
    pfz: { highPotentialZones: number };
    fleet: { activeVessels: number };
  };
}

// ─────────────────────────────────────────────────────────────
// Time Range Options
// ─────────────────────────────────────────────────────────────

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

// ─────────────────────────────────────────────────────────────
// Hazard Type Options
// ─────────────────────────────────────────────────────────────

const HAZARD_OPTIONS: { value: HazardType | null; label: string; color: string }[] = [
  { value: null, label: 'All Hazards', color: '#64748b' },
  { value: 'cyclone', label: 'Cyclone', color: '#ef4444' },
  { value: 'mhw', label: 'Marine Heat Wave', color: '#f97316' },
  { value: 'oil_spill', label: 'Oil Spill', color: '#7c3aed' },
  { value: 'hab', label: 'Algal Bloom', color: '#22c55e' },
  { value: 'rip_current', label: 'Rip Current', color: '#0ea5e9' },
];

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function DashboardControls({
  filters,
  onUpdateFilters,
  onReset,
  onToggleLive,
  activeTab,
  summaryStats,
}: DashboardControlsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setIsTimeRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = filters.search || filters.hazardType || filters.severity || filters.region;

  // Get context-specific placeholder
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'ews': return 'Search events, regions, hazards...';
      case 'che': return 'Search zones, parameters...';
      case 'pfz': return 'Search species, zones...';
      case 'fleet': return 'Search vessels, routes...';
      default: return 'Search...';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 mb-6 relative z-50">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-10 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          )}
        </div>

        {/* Time Range Selector */}
        <div ref={timeRef} className="relative">
          <button
            onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
              ${isTimeRangeOpen
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
              }
            `}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">
              {TIME_RANGES.find(t => t.value === filters.timeRange)?.label}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isTimeRangeOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isTimeRangeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[180px]"
              >
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      onUpdateFilters({ timeRange: range.value });
                      setIsTimeRangeOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                      ${filters.timeRange === range.value
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{range.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Button (for EWS) */}
        {activeTab === 'ews' && (
          <div ref={filterRef} className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
                ${isFilterOpen || filters.hazardType
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                }
              `}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">
                {filters.hazardType
                  ? HAZARD_OPTIONS.find(h => h.value === filters.hazardType)?.label
                  : 'Filter'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wider">Hazard Type</p>
                  </div>
                  {HAZARD_OPTIONS.map((hazard) => (
                    <button
                      key={hazard.value ?? 'all'}
                      onClick={() => {
                        onUpdateFilters({ hazardType: hazard.value });
                        setIsFilterOpen(false);
                      }}
                      className={`
                        w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                        ${filters.hazardType === hazard.value
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: hazard.color }}
                      />
                      <span>{hazard.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Divider */}
        <div className="h-8 w-px bg-white/10 hidden md:block" />

        {/* Live Mode Toggle */}
        <button
          onClick={onToggleLive}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
            ${filters.isLiveMode
              ? 'bg-green-500/20 border-green-500/50 text-green-400 animate-pulse'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            }
          `}
        >
          <Radio className={`w-5 h-5 ${filters.isLiveMode ? 'animate-pulse' : ''}`} />
          <span className="font-medium">
            {filters.isLiveMode ? 'LIVE' : 'Live Mode'}
          </span>
          {filters.isLiveMode && (
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          )}
        </button>

        {/* Reset Button */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">Reset</span>
          </motion.button>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-white/50">Quick Stats:</span>
        </div>

        {activeTab === 'ews' && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">
                {summaryStats.ews.criticalAlerts} Critical
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">
                {summaryStats.ews.totalEvents} Events
              </span>
            </div>
          </>
        )}

        {activeTab === 'che' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
            <Waves className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">
              DZRI: {summaryStats.che.dzriScore}%
            </span>
          </div>
        )}

        {activeTab === 'pfz' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg">
            <Fish className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">
              {summaryStats.pfz.highPotentialZones} High Potential Zones
            </span>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-lg">
            <Ship className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">
              {summaryStats.fleet.activeVessels} Active Vessels
            </span>
          </div>
        )}

        {filters.isLiveMode && (
          <div className="ml-auto flex items-center gap-2 text-green-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span>Updating every 5s</span>
          </div>
        )}
      </div>
    </div>
  );
}
