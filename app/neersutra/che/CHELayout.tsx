/**
 * ============================================
 * CHE Layout - Scientific Dashboard Interface
 * Dedicated workspace for Coastal Health Analysis
 * ============================================
 */

"use client";

import { useEffect, useState, useCallback, ComponentType } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "../components/ThemeProvider";
import { TopBar } from "../components/HUD/TopBar";
import { useCHEStore } from "../../../src/store/useCHEStore";
import { generateLocationAnalysis } from "../../../src/lib/che/engine";
import SidebarControls from "./components/SidebarControls";
import AnalyticsPanel from "./components/AnalyticsPanel";
import TimelinePanel from "./components/TimelinePanel";

// Import styles
import "../styles/liquid-glass.css";

// Props interface for CHEMapPanel
interface CHEMapPanelProps {
  onLocationClick?: (lat: number, lon: number) => void;
  className?: string;
}

// Dynamic import MapPanel to avoid SSR issues
const CHEMapPanel = dynamic<CHEMapPanelProps>(
  () => import("./components/CHEMapPanel"),
  {
    ssr: false,
    loading: () => <MapLoader />,
  }
);

function MapLoader() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse 120% 80% at 50% 100%, #041c14 0%, #020c1b 55%, #010810 100%)" }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-[#10b981] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(16,185,129,0.2)] animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-display text-base text-white/90 tracking-tight">Coastal Health</p>
          <p className="text-xs text-[#10b981]/60 font-mono">Initializing 4D Simulation…</p>
        </div>
      </div>
    </div>
  );
}

function CHELayoutInner() {
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    selectedLocation,
    selectLocation,
    clearSelection,
    selectedDepth,
    activeLayer,
  } = useCHEStore();

  // Initialize with a default location analysis
  useEffect(() => {
    // Default to Bay of Bengal center
    const defaultLat = 15.0;
    const defaultLon = 85.0;
    const analysis = generateLocationAnalysis(
      defaultLat,
      defaultLon,
      new Date()
    );
    selectLocation(defaultLat, defaultLon, analysis);
    setIsInitialized(true);
  }, []);

  // Handle map click
  const handleMapClick = useCallback(
    (lat: number, lon: number) => {
      const analysis = generateLocationAnalysis(lat, lon, new Date());
      selectLocation(lat, lon, analysis);
    },
    [selectLocation]
  );

  return (
    <div className="theme-che relative w-full h-screen overflow-hidden ocean-bg text-white font-sans selection:bg-emerald-500/30">
      {/* Layer 0: Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <CHEMapPanel onLocationClick={handleMapClick} />
      </div>

      {/* Layer 1: Subtle edge vignette only — map centre stays clear */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.22) 100%),
            linear-gradient(180deg, rgba(2,12,27,0.15) 0%, transparent 12%, transparent 88%, rgba(2,12,27,0.20) 100%)
          `,
        }}
      />

      {/* Layer 2: TopBar */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pt-4 pb-2"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,12,27,0.82) 0%, rgba(2,12,27,0.50) 55%, transparent 100%)",
        }}
      >
        <div className="pointer-events-auto">
          <TopBar />
        </div>
      </div>

      {/* Layer 3a: Left Panel — floating island, not grid column */}
      <motion.div
        className="absolute left-4 z-20 pointer-events-auto w-[260px] overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ top: 84, maxHeight: "calc(100vh - 164px)" }}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <SidebarControls />
      </motion.div>

      {/* Layer 3b: Right Panel — floating island, not grid column */}
      <motion.div
        className="absolute right-4 z-20 pointer-events-auto w-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ top: 84, maxHeight: "calc(100vh - 164px)" }}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
      >
        <AnalyticsPanel analysis={selectedLocation?.analysis ?? null} />
      </motion.div>

      {/* Layer 4: Bottom Timeline Capsule */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-2xl px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      >
        <TimelinePanel />
      </motion.div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none opacity-[0.012]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </div>
  );
}

export default function CHELayout() {
  return (
    <ThemeProvider>
      <CHELayoutInner />
    </ThemeProvider>
  );
}
