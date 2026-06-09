/**
 * ============================================
 * EWS Layout - Hazard Watch Dashboard
 * IOHD-EWS: Multi-hazard ocean early warning
 * Collapsible sidebars for better map visibility
 * ============================================
 */

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeProvider } from "../components/ThemeProvider";
import { TopBar } from "../components/HUD/TopBar";
import { useEWSStore } from "../../../src/store/useEWSStore";
import { HAZARD_CONFIG } from "../../../src/lib/ews/types";
import HazardSelector from "./components/HazardSelector";
import AlertFeed from "./components/AlertFeed";
import EventDetailPanel from "./components/EventDetailPanel";
import ForecastTimeline from "./components/ForecastTimeline";
import ConfidenceGauge from "./components/ConfidenceGauge";
import LayerControls from "./components/LayerControls";
import CycloneInfoPanel from "./components/CycloneInfoPanel";
import OilSpillStatsPanel from "./components/OilSpillStatsPanel";
import { generateCycloneTrack } from "../../../src/lib/ews/engine";

// Import styles
import "../styles/liquid-glass.css";

// Props interface for EWSMapPanel
interface EWSMapPanelProps {
  className?: string;
}

// Dynamic import MapLibre-based MapPanel to avoid SSR issues
const EWSMapPanel = dynamic<EWSMapPanelProps>(
  () => import("./components/EWSMapPanelMapLibre"),
  {
    ssr: false,
    loading: () => <MapLoader />,
  }
);

function MapLoader() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse 120% 80% at 50% 100%, #1c0404 0%, #020c1b 55%, #010810 100%)" }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-[#ef4444] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(239,68,68,0.2)] animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-display text-base text-white/90 tracking-tight">Hazard Watch</p>
          <p className="text-xs text-[#ef4444]/60 font-mono">Initializing Early Warning System…</p>
        </div>
      </div>
    </div>
  );
}

function EWSLayoutInner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);

  const {
    activeHazard,
    selectedEventId,
    isLoading,
    refreshData,
    currentForecastHour,
    isPlaying,
    events,
    alerts,
  } = useEWSStore();

  const hazardConfig = HAZARD_CONFIG[activeHazard];

  // Initialize data on mount
  useEffect(() => {
    refreshData().then(() => {
      setIsInitialized(true);
    });
  }, []);

  // Playback interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      useEWSStore.getState().stepForward();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  const LEFT_W = 264;

  return (
    <div
      className="theme-ews relative w-full h-screen overflow-hidden ocean-bg text-white font-sans"
      style={
        {
          "--hazard-accent": hazardConfig.accentColor,
          "--hazard-gradient-from": hazardConfig.gradientFrom,
          "--hazard-gradient-to": hazardConfig.gradientTo,
        } as React.CSSProperties
      }
    >
      {/* Layer 0: Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <EWSMapPanel className="w-full h-full" />
      </div>

      {/* Layer 1: Subtle edge vignette */}
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

      {/* Layer 3: Left sidebar — collapsible, absolute, no flex layout fight */}
      <motion.div
        initial={false}
        animate={{ width: isLeftOpen ? LEFT_W : 0, opacity: isLeftOpen ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute left-0 top-0 h-full z-20 bg-[rgba(2,12,27,0.55)] backdrop-blur-[24px] border-r border-white/[0.07] overflow-hidden"
      >
        {/* min-width keeps content from collapsing while animating to 0 */}
        <div
          className="overflow-y-auto p-4 pb-6 space-y-3 custom-scrollbar h-full"
          style={{ minWidth: LEFT_W, paddingTop: 88 }}
        >
          <HazardSelector />
          <LayerControls />
          <AlertFeed />
        </div>
      </motion.div>

      {/* Left toggle — animates x in sync with sidebar width (same spring) */}
      <motion.button
        animate={{ x: isLeftOpen ? LEFT_W : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={() => setIsLeftOpen(!isLeftOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-[rgba(2,12,27,0.75)] hover:bg-[rgba(2,12,27,0.92)] p-1.5 rounded-r-md backdrop-blur-sm border border-l-0 border-white/[0.10] transition-colors text-white/60 hover:text-white"
      >
        {isLeftOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </motion.button>

      {/* Layer 4: Right floating event-detail card — only renders when event is selected */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            key={selectedEvent.eventId}
            className="absolute right-4 z-20 pointer-events-auto w-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar"
            style={{ top: 84, maxHeight: "calc(100vh - 164px)" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col gap-3">
              <ConfidenceGauge event={selectedEvent} />

              {activeHazard === "cyclone" &&
                selectedEvent.hazardType === "cyclone" &&
                (() => {
                  const track = generateCycloneTrack(selectedEvent, currentForecastHour);
                  return track ? (
                    <CycloneInfoPanel track={track} currentHour={currentForecastHour} />
                  ) : null;
                })()}

              {activeHazard === "oil_spill" &&
                selectedEvent.hazardType === "oil_spill" && (
                  <OilSpillStatsPanel
                    event={selectedEvent}
                    particleCount={300}
                    currentHour={currentForecastHour}
                  />
                )}

              <EventDetailPanel event={selectedEvent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 5: Bottom Timeline */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-2xl px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
      >
        <ForecastTimeline />
      </motion.div>

      {/* Extreme-alert banner (above map, below TopBar) */}
      <AnimatePresence>
        {alerts.some((a) => a.event.severity === "extreme") && (
          <motion.div
            className="absolute top-[88px] left-1/2 -translate-x-1/2 z-[25] pointer-events-auto"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div className="glass-panel rounded-xl px-5 py-2.5 border border-red-500/40 bg-red-950/25 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="text-red-400 font-medium text-sm">
                {alerts.filter((a) => a.event.severity === "extreme").length}{" "}
                EXTREME ALERT
                {alerts.filter((a) => a.event.severity === "extreme").length > 1 ? "S" : ""} ACTIVE
              </span>
              <button className="text-xs text-white/40 hover:text-white/70 transition-colors ml-1">
                View →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default function EWSLayout() {
  return (
    <ThemeProvider>
      <EWSLayoutInner />
    </ThemeProvider>
  );
}
