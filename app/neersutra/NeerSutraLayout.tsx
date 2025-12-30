'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StatusBar, TimeSlider, GlassSidebar, LayerControls } from './components/HUD';
import { useMockAISData, useMockRoute, useMockAlternativeRoutes } from './components/Map';
import { useRouteStore, useMapStore } from './store';

// Dynamic import MapPanel to avoid SSR issues with MapLibre
const MapPanel = dynamic(
  () => import('./components/Map/MapPanel').then((mod) => mod.MapPanel),
  { ssr: false, loading: () => <MapLoader /> }
);

function MapLoader() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-cyan-400 font-mono text-sm">INITIALIZING MAP...</span>
      </div>
    </div>
  );
}

/**
 * NeerSutraLayout - The main "Glass Cockpit" layout
 * Map fills the entire viewport, HUD elements float over it
 */
export function NeerSutraLayout() {
  // Mock data for development
  const aisData = useMockAISData(50);
  const mockRoute = useMockRoute();
  const alternativeRoutes = useMockAlternativeRoutes();

  const { setSelectedRoute, setAlternativeRoutes, setOrigin, setDestination } = useRouteStore();
  const { setSelectedShip } = useMapStore();

  // Initialize with mock data
  useEffect(() => {
    setSelectedRoute(mockRoute);
    setAlternativeRoutes(alternativeRoutes);
    setOrigin({ lat: 18.94, lon: 72.84 }); // Mumbai
    setDestination({ lat: 1.26, lon: 103.85 }); // Singapore
  }, [mockRoute, alternativeRoutes, setSelectedRoute, setAlternativeRoutes, setOrigin, setDestination]);

  const handleShipClick = (ship: any) => {
    setSelectedShip(ship);
  };

  const handleMapClick = (lat: number, lon: number) => {
    console.log('Map clicked:', lat, lon);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Background: Full-screen Map */}
      <div className="absolute inset-0 z-0">
        <MapPanel
          aisData={aisData}
          routes={[mockRoute, ...alternativeRoutes]}
          onShipClick={handleShipClick}
          onMapClick={handleMapClick}
        />
      </div>

      {/* HUD Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top Status Bar */}
        <div className="absolute top-4 left-4 right-4 pointer-events-auto">
          <StatusBar />
        </div>

        {/* Left Sidebar */}
        <div className="absolute top-24 left-4 bottom-32 pointer-events-auto flex flex-col gap-4">
          <GlassSidebar />
        </div>

        {/* Right Controls */}
        <div className="absolute top-24 right-4 pointer-events-auto">
          <LayerControls />
        </div>

        {/* Bottom Time Slider */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
          <TimeSlider />
        </div>
      </div>

      {/* Decorative corner brackets (HUD aesthetic) */}
      <HUDCorners />
    </div>
  );
}

/**
 * Decorative HUD corner brackets
 */
function HUDCorners() {
  const cornerStyle = "absolute w-8 h-8 border-cyan-400/30 pointer-events-none";
  
  return (
    <>
      <div className={`${cornerStyle} top-2 left-2 border-l-2 border-t-2`} />
      <div className={`${cornerStyle} top-2 right-2 border-r-2 border-t-2`} />
      <div className={`${cornerStyle} bottom-2 left-2 border-l-2 border-b-2`} />
      <div className={`${cornerStyle} bottom-2 right-2 border-r-2 border-b-2`} />
    </>
  );
}

export default NeerSutraLayout;
