/**
 * ============================================
 * Advisory Panel - PFZ Fishing Recommendations
 * Zone details and actionable insights
 * ============================================
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  usePFZStore,
  useSelectedSpeciesProfile,
  usePFZPolygons,
  useHighPotentialZones,
} from "../../../../src/store/usePFZStore";
import { SPECIES_PROFILES } from "../../../../src/lib/pfz/types";

export default function AdvisoryPanel() {
  const {
    currentForecast,
    selectedSpecies,
    selectedZone,
    setSelectedZone,
    locationAnalysis,
    hsiThreshold,
    setHSIThreshold,
    layerOpacity,
    setLayerOpacity,
    showConfidenceOverlay,
    toggleConfidenceOverlay,
  } = usePFZStore();

  const profile = useSelectedSpeciesProfile();
  const polygons = usePFZPolygons();
  const highZones = useHighPotentialZones();

  // Fix: Hydration-safe Date (prevents server/client mismatch)
  const [dateString, setDateString] = useState<string>("");
  useEffect(() => {
    setDateString(
      new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  // Zone stats
  const stats = useMemo(() => {
    if (!currentForecast) return null;

    const totalArea = polygons.reduce((sum, p) => sum + p.areaKm2, 0);
    const avgHSI =
      polygons.length > 0
        ? polygons.reduce((sum, p) => sum + p.meanHSI, 0) / polygons.length
        : 0;

    return {
      totalZones: polygons.length,
      highZones: highZones.length,
      totalArea: Math.round(totalArea),
      avgHSI: (avgHSI * 100).toFixed(0),
      confidence: Math.round(currentForecast.confidence * 100),
    };
  }, [currentForecast, polygons, highZones]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1">
      <div className="flex flex-col gap-3 pb-4">
        {/* Advisory Text */}
        <motion.div
          className="glass-panel rounded-2xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-semibold tracking-tight">
                Daily Advisory
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40 min-w-[80px] text-right">
              {dateString || "..."}
            </span>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">
            {currentForecast?.advisory || "Analyzing oceanographic data..."}
          </p>

          {/* Gear Recommendation */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Recommended Fishery
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {profile.targetFishery.map((fishery, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[11px] rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {fishery}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid - with skeleton loader to prevent layout shift */}
        {stats ? (
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              label="Total Zones"
              value={stats.totalZones}
              color="#f59e0b"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              }
            />
            <StatCard
              label="High Potential"
              value={stats.highZones}
              color="#22c55e"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            />
            <StatCard
              label="Area Coverage"
              value={`${stats.totalArea} km²`}
              color="#3b82f6"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"
                  />
                </svg>
              }
            />
            <StatCard
              label="Avg HSI"
              value={`${stats.avgHSI}%`}
              color="#a855f7"
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5"
                  />
                </svg>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass-panel rounded-xl p-3 h-[72px] animate-pulse bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Zone List - Scrollable area with fixed height */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <h2 className="text-sm font-semibold tracking-tight">
                Detected Zones
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-white/40">
              Click to select
            </span>
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            <AnimatePresence>
              {polygons.map((zone, idx) => (
                <motion.button
                  key={zone.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() =>
                    setSelectedZone(selectedZone?.id === zone.id ? null : zone)
                  }
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedZone?.id === zone.id
                      ? "bg-white/10 border border-amber-500/30"
                      : "bg-white/[0.02] border border-transparent hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white">
                      Zone {idx + 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                        zone.potential === "high"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : zone.potential === "medium"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {zone.potential.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/50">
                    <span>
                      HSI:{" "}
                      <span className="text-amber-400">
                        {(zone.meanHSI * 100).toFixed(0)}%
                      </span>
                    </span>
                    <span>•</span>
                    <span>{Math.round(zone.areaKm2)} km²</span>
                    <span>•</span>
                    <span>{zone.nearestPort}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            {polygons.length === 0 && (
              <div className="text-center py-8 text-white/40 text-sm flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-amber-400 animate-spin" />
                <span>Scanning ocean data...</span>
              </div>
            )}
          </div>
        </div>

        {/* Visualization Controls */}
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-sm font-semibold tracking-tight">
              Display Settings
            </h2>
          </div>

          <div className="space-y-3">
            {/* HSI Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/50">HSI Threshold</span>
                <span className="text-amber-400 font-mono">
                  {(hsiThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={hsiThreshold}
                onChange={(e) => setHSIThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              />
            </div>

            {/* Layer Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-white/50">Layer Opacity</span>
                <span className="text-cyan-400 font-mono">
                  {Math.round(layerOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              />
            </div>

            {/* Confidence Toggle */}
            <button
              onClick={toggleConfidenceOverlay}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                showConfidenceOverlay
                  ? "bg-purple-500/20 border border-purple-500/30"
                  : "bg-white/[0.03] border border-white/5 hover:bg-white/5"
              }`}
            >
              <span className="text-[11px] text-white/70">
                Show Confidence Overlay
              </span>
              <div
                className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                  showConfidenceOverlay ? "bg-purple-500" : "bg-white/10"
                }`}
              >
                {showConfidenceOverlay && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Location Analysis (if available) */}
        <AnimatePresence>
          {locationAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="glass-panel rounded-2xl p-4 border border-cyan-500/20"
              style={{ boxShadow: "0 0 20px rgba(34,211,238,0.1)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-semibold tracking-tight">
                    Location Analysis
                  </h3>
                </div>
                <span className="text-[10px] text-white/40">
                  {locationAnalysis.lat.toFixed(2)}°N,{" "}
                  {locationAnalysis.lon.toFixed(2)}°E
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${locationAnalysis.totalHSI * 100}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-white">
                  {(locationAnalysis.totalHSI * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-[11px] text-white/60">
                {locationAnalysis.recommendation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: ReactNode;
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div
      className="glass-panel rounded-xl p-3 border"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color }} className="opacity-70">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {label}
        </span>
      </div>
      <p className="text-lg font-semibold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
