"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./components/HUD/TopBar";
import { TimeCapsule } from "./components/HUD/TimeCapsule";
import { RouteSidebar } from "./components/HUD/RouteSidebar";
import { LayerPanel } from "./components/HUD/LayerPanel";
import { ShipCalloutCard } from "./components/HUD/ShipCalloutCard";
import { ThemeProvider } from "./components/ThemeProvider";
import {
  useMockAISData,
  useMockRoute,
  useMockAlternativeRoutes,
} from "./components/Map";
import { useRouteStore, useMapStore } from "./store";
import type { AISData } from "./types";

// Import styles
import "./styles/liquid-glass.css";

// Dynamic import MapPanel to avoid SSR issues
const MapPanel = dynamic(
  () => import("./components/Map/MapPanel3D").then((mod) => mod.MapPanel),
  {
    ssr: false,
    loading: () => <MapLoader />,
  }
);

function MapLoader() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse 120% 80% at 50% 100%, #051830 0%, #020c1b 55%, #010810 100%)" }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
          <div className="absolute inset-1 rounded-full border-2 border-t-[#22d3ee] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[rgba(34,211,238,0.2)] animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-display text-base text-white/90 tracking-tight">NeerSutra</p>
          <p className="text-xs text-[#22d3ee]/60 font-mono">Fleet Tracking</p>
        </div>
      </div>
    </div>
  );
}

/**
 * NeerSutraLayout - The "Liquid Glass / Aerogel" Cockpit Layout
 * Features floating islands, spatial UI, and cinematic aesthetics
 */
function NeerSutraLayoutInner() {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed for cleaner look

  // Mock data for development
  const aisData = useMockAISData(50);
  const mockRoute = useMockRoute();
  const alternativeRoutes = useMockAlternativeRoutes();

  const { setSelectedRoute, setAlternativeRoutes, setOrigin, setDestination } =
    useRouteStore();
  const { setSelectedShip, selectedShip } = useMapStore();

  // Initialize with mock data
  useEffect(() => {
    setSelectedRoute(mockRoute);
    setAlternativeRoutes(alternativeRoutes);
    setOrigin({ lat: 18.94, lon: 72.84 }); // Mumbai
    setDestination({ lat: 1.26, lon: 103.85 }); // Singapore

    // Simulate map load
    const timer = setTimeout(() => setIsMapLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleShipClick = (ship: AISData) => {
    setSelectedShip(ship);
  };

  const handleMapClick = (lat: number, lon: number) => {
    console.log("Map clicked:", lat, lon);
    // Clear ship selection when clicking empty area
    setSelectedShip(null);
  };

  return (
    <div className="theme-fleet relative w-full h-screen overflow-hidden ocean-bg text-white font-sans selection:bg-cyan-500/30">
      {/* Layer 0: Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <MapPanel
          aisData={aisData}
          routes={[mockRoute, ...alternativeRoutes]}
          onShipClick={handleShipClick}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Layer 1: Subtle edge vignette — edges only, map centre stays open */}
      <div
        className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.22) 100%),
            linear-gradient(180deg, rgba(2,12,27,0.15) 0%, transparent 12%, transparent 88%, rgba(2,12,27,0.20) 100%)
          `,
        }}
      />

      {/* Layer 2: Floating HUD Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top: Dynamic Island Navigation */}
        <motion.div
          className="absolute top-0 left-0 right-0 flex justify-center pointer-events-auto pt-4 pb-2 px-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(2,12,27,0.82) 0%, rgba(2,12,27,0.50) 55%, transparent 100%)",
          }}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.3,
          }}
        >
          <TopBar />
        </motion.div>

        {/* Left: Collapsible Route Sidebar */}
        <motion.div
          className="absolute top-28 left-4 bottom-24 pointer-events-auto flex flex-col justify-center"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.4,
          }}
        >
          <RouteSidebar className="max-h-full" />
        </motion.div>

        {/* Right Top: Layer Controls */}
        <motion.div
          className="absolute top-28 right-4 pointer-events-auto flex flex-col gap-3"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.5,
          }}
        >
          <LayerPanel />
        </motion.div>

        {/* Right Bottom: Ship Callout Card (Context Aware) */}
        <AnimatePresence>
          {selectedShip && (
            <motion.div
              className="absolute right-4 bottom-24 pointer-events-auto"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <ShipCalloutCard />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Center: Time Capsule */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto w-full max-w-2xl px-4"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.6,
          }}
        >
          <TimeCapsule />
        </motion.div>
      </div>

      {/* Subtle Scanlines (Optional - for extra sci-fi effect) */}
      <div
        className="absolute inset-0 z-[15] pointer-events-none opacity-[0.02]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </div>
  );
}

/**
 * Wrapped with ThemeProvider for light/dark mode support
 */
export function NeerSutraLayout() {
  return (
    <ThemeProvider>
      <NeerSutraLayoutInner />
    </ThemeProvider>
  );
}

export default NeerSutraLayout;
