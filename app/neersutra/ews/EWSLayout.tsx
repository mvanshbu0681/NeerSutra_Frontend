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
    <div className="w-full h-full bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.1)]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-[#ef4444] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(239,68,68,0.3)] animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-display text-xl text-white tracking-tight">
            Hazard Watch
          </p>
          <p className="text-sm text-[#64748b] font-mono">
            Initializing Early Warning System...
          </p>
        </div>
      </div>
    </div>
  );
}

function EWSLayoutInner() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

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

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#050505] text-white font-sans"
      style={
        {
          "--hazard-accent": hazardConfig.accentColor,
          "--hazard-gradient-from": hazardConfig.gradientFrom,
          "--hazard-gradient-to": hazardConfig.gradientTo,
        } as React.CSSProperties
      }
    >
      {/* Layer 0: Floating TopBar (z-50 for dropdown visibility) */}
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

      {/* Main Content - Flexbox Layout */}
      <div className="relative w-full h-full flex">
        {/* Left Sidebar (Collapsible) */}
        <motion.div
          initial={false}
          animate={{
            width: isLeftOpen ? 320 : 0,
            opacity: isLeftOpen ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-30 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 pt-24 pb-6 space-y-4 min-w-[320px]">
            <HazardSelector />
            <LayerControls />
            <div className="flex-1 min-h-[300px]">
              <AlertFeed />
            </div>
          </div>
        </motion.div>

        {/* Left Toggle Button */}
        <button
          onClick={() => setIsLeftOpen(!isLeftOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 p-1.5 rounded-r-lg backdrop-blur-md border border-l-0 border-white/10 transition-all text-white/70 hover:text-white"
          style={{ left: isLeftOpen ? 320 : 0 }}
        >
          {isLeftOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Center - Map Area */}
        <div className="flex-1 relative h-full bg-[#050510]">
          <EWSMapPanel className="w-full h-full" />

          {/* Bottom Timeline (Floating) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full max-w-2xl px-4">
            <ForecastTimeline />
          </div>

          {/* Alert Banner (Top Center, if extreme) */}
          <AnimatePresence>
            {alerts.some((a) => a.event.severity === "extreme") && (
              <motion.div
                className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="glass-panel rounded-xl px-6 py-3 border border-red-500/50 bg-red-950/30 flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-medium text-sm">
                    {
                      alerts.filter((a) => a.event.severity === "extreme")
                        .length
                    }{" "}
                    EXTREME ALERT
                    {alerts.filter((a) => a.event.severity === "extreme")
                      .length > 1
                      ? "S"
                      : ""}{" "}
                    ACTIVE
                  </span>
                  <button className="text-xs text-white/50 hover:text-white/80 transition-colors">
                    View All →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar (Collapsible) */}
        <motion.div
          initial={false}
          animate={{
            width: isRightOpen ? 380 : 0,
            opacity: isRightOpen ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-30 h-full bg-black/40 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 pt-24 pb-6 space-y-4 min-w-[380px]">
            {selectedEvent ? (
              <>
                <ConfidenceGauge event={selectedEvent} />

                {/* Hazard-specific panels */}
                {activeHazard === "cyclone" &&
                  selectedEvent.hazardType === "cyclone" &&
                  (() => {
                    const track = generateCycloneTrack(
                      selectedEvent,
                      currentForecastHour
                    );
                    return track ? (
                      <CycloneInfoPanel
                        track={track}
                        currentHour={currentForecastHour}
                      />
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
              </>
            ) : (
              <div className="glass-panel rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
                    boxShadow: `0 0 30px ${hazardConfig.accentColor}40`,
                  }}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                  Select an Event
                </h3>
                <p className="text-sm text-white/50 max-w-[200px]">
                  Click on a hazard event on the map or select from the alert
                  feed to view details
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-white/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{events.length} active events</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Toggle Button */}
        <button
          onClick={() => setIsRightOpen(!isRightOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-40 bg-black/60 hover:bg-black/80 p-1.5 rounded-l-lg backdrop-blur-md border border-r-0 border-white/10 transition-all text-white/70 hover:text-white"
          style={{ right: isRightOpen ? 380 : 0 }}
        >
          {isRightOpen ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Subtle Scanlines */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none opacity-[0.015]"
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
