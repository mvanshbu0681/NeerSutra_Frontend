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
    <div className="w-full h-full bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.1)]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-[#22d3ee] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(34,211,238,0.3)] animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-display text-xl text-white tracking-tight">
            Coastal Health Engine
          </p>
          <p className="text-sm text-[#64748b] font-mono">
            Initializing 4D Simulation...
          </p>
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
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Layer 0: Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <CHEMapPanel onLocationClick={handleMapClick} />
      </div>

      {/* Layer 1: Cinematic Vignette */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, transparent 40%, rgba(0,0,0,0.5) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)
          `,
        }}
      />

      {/* Layer 2: Floating TopBar (above everything) */}
      <div
        className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 pt-4 pb-2"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.8) 60%, transparent 100%)",
        }}
      >
        <div className="pointer-events-auto">
          <TopBar />
        </div>
      </div>

      {/* Layer 3: Dashboard Panels */}
      <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-[300px_1fr_360px] grid-rows-[1fr] gap-3 p-4 pt-24 pb-24">
        {/* Left Panel - Controls */}
        <motion.div
          className="pointer-events-auto overflow-y-auto overflow-x-hidden custom-scrollbar"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.2,
          }}
        >
          <SidebarControls />
        </motion.div>

        {/* Center - Map (already rendered behind) */}
        <div />

        {/* Right Panel - Analytics */}
        <motion.div
          className="pointer-events-auto overflow-y-auto overflow-x-hidden custom-scrollbar"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.3,
          }}
        >
          <AnalyticsPanel analysis={selectedLocation?.analysis ?? null} />
        </motion.div>
      </div>

      {/* Layer 4: Floating Timeline Capsule (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-3xl px-6">
        <TimelinePanel />
      </div>

      {/* Subtle Scanlines */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none opacity-[0.015]"
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
