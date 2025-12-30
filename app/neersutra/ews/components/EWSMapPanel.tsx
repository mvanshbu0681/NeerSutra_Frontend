/**
 * ============================================
 * EWS Map Panel - Hazard Visualization Layer
 * IOHD-EWS: Google Maps + Deck.gl for multi-hazard display
 * ============================================
 */

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import {
  useEWSStore,
  useFilteredEvents,
} from "../../../../src/store/useEWSStore";
import {
  HAZARD_CONFIG,
  type HazardEvent,
  type TimedPolygon,
} from "../../../../src/lib/ews/types";

interface EWSMapPanelProps {
  className?: string;
}

// Convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [255, 255, 255];
}

export default function EWSMapPanel({ className }: EWSMapPanelProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const {
    activeHazard,
    selectedEventId,
    selectEvent,
    currentForecastHour,
    showProbabilityLayer,
    showParticles,
    mapCenter,
    mapZoom,
  } = useEWSStore();

  const events = useFilteredEvents();
  const hazardConfig = HAZARD_CONFIG[activeHazard];

  // Get current polygon for each event based on forecast hour
  const getCurrentPolygons = useMemo(() => {
    return events.map((event) => {
      // Find the polygon closest to current forecast hour
      const polygonIndex = Math.min(
        Math.floor(currentForecastHour / 3),
        event.polygons.length - 1
      );
      return {
        event,
        polygon: event.polygons[polygonIndex] || event.polygons[0],
      };
    });
  }, [events, currentForecastHour]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    if (!googleMapsApiKey) {
      setError("Google Maps API key not configured.");
      setMapLoaded(true); // Still set loaded to show fallback UI
      return;
    }

    setOptions({
      key: googleMapsApiKey,
      v: "weekly",
      libraries: ["maps", "marker"],
    });

    importLibrary("maps")
      .then((mapsLibrary) => {
        if (!mapContainerRef.current) return;

        const { Map } = mapsLibrary;

        mapRef.current = new Map(mapContainerRef.current, {
          center: { lat: mapCenter[1], lng: mapCenter[0] },
          zoom: mapZoom,
          tilt: 0,
          heading: 0,
          mapId: "EWS_HAZARD_MAP",
          mapTypeId: "satellite",
          disableDefaultUI: true,
          gestureHandling: "greedy",
        });

        overlayRef.current = new GoogleMapsOverlay({ layers: [] });
        overlayRef.current.setMap(mapRef.current);

        console.log("✅ EWS Google Maps loaded");
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("Google Maps failed to load:", err);
        setError("Failed to load Google Maps.");
        setMapLoaded(true);
      });

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [mapCenter, mapZoom]);

  // Update Deck.gl layers for hazard visualization
  useEffect(() => {
    if (!overlayRef.current || !mapLoaded) return;

    const layers: any[] = [];

    // Create polygon layers for each hazard event
    if (getCurrentPolygons.length > 0) {
      // Hazard zone polygons
      layers.push(
        new PolygonLayer({
          id: "ews-hazard-polygons",
          data: getCurrentPolygons,
          pickable: true,
          stroked: true,
          filled: true,
          wireframe: false,
          lineWidthMinPixels: 2,
          getPolygon: (d: { event: HazardEvent; polygon: TimedPolygon }) =>
            d.polygon.geometry.coordinates[0],
          getFillColor: (d: { event: HazardEvent; polygon: TimedPolygon }) => {
            const config = HAZARD_CONFIG[d.event.hazardType];
            const rgb = hexToRgb(config.accentColor);
            const isSelected = d.event.eventId === selectedEventId;
            const alpha = isSelected
              ? 150
              : Math.round(d.polygon.probability * 100 + 50);
            return [...rgb, alpha] as [number, number, number, number];
          },
          getLineColor: (d: { event: HazardEvent; polygon: TimedPolygon }) => {
            const config = HAZARD_CONFIG[d.event.hazardType];
            const rgb = hexToRgb(config.accentColor);
            const isSelected = d.event.eventId === selectedEventId;
            return [...rgb, isSelected ? 255 : 200] as [
              number,
              number,
              number,
              number
            ];
          },
          lineWidthScale: 1,
          onClick: (info: any) => {
            if (info.object) {
              selectEvent(info.object.event.eventId);
            }
          },
          updateTriggers: {
            getFillColor: [selectedEventId],
            getLineColor: [selectedEventId],
          },
        })
      );

      // Center markers for each hazard event
      layers.push(
        new ScatterplotLayer({
          id: "ews-hazard-centers",
          data: getCurrentPolygons,
          pickable: true,
          opacity: 1,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 8,
          radiusMaxPixels: 20,
          getPosition: (d: { event: HazardEvent; polygon: TimedPolygon }) => {
            const coords = d.polygon.geometry.coordinates[0];
            const centerLon =
              coords.reduce((s, c) => s + c[0], 0) / coords.length;
            const centerLat =
              coords.reduce((s, c) => s + c[1], 0) / coords.length;
            return [centerLon, centerLat];
          },
          getFillColor: (d: { event: HazardEvent; polygon: TimedPolygon }) => {
            const config = HAZARD_CONFIG[d.event.hazardType];
            const rgb = hexToRgb(config.accentColor);
            return [...rgb, 220] as [number, number, number, number];
          },
          getLineColor: [255, 255, 255, 255] as [
            number,
            number,
            number,
            number
          ],
          lineWidthMinPixels: 2,
          onClick: (info: any) => {
            if (info.object) {
              selectEvent(info.object.event.eventId);
            }
          },
        })
      );
    }

    overlayRef.current.setProps({ layers });
  }, [mapLoaded, getCurrentPolygons, selectedEventId, selectEvent]);

  const handleEventClick = useCallback(
    (eventId: string) => {
      selectEvent(eventId);
    },
    [selectEvent]
  );

  return (
    <div className={`relative w-full h-full bg-[#050510] ${className}`}>
      {/* Google Maps Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050510]">
          <div className="text-center">
            <div className="text-amber-400 text-lg mb-2">⚠️ Map Error</div>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050510]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-t-cyan-400 border-r-transparent border-b-cyan-400/30 border-l-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-sm">Loading hazard map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 z-10">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          Active Hazards
        </div>
        <div className="space-y-1.5">
          {events.length === 0 ? (
            <div className="text-xs text-white/30">No events in view</div>
          ) : (
            Object.entries(
              events.reduce((acc, e) => {
                acc[e.hazardType] = (acc[e.hazardType] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([type, count]) => {
              const config = HAZARD_CONFIG[type as keyof typeof HAZARD_CONFIG];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                    }}
                  />
                  <span className="text-xs text-white/60">
                    {config.shortName}
                  </span>
                  <span
                    className="text-xs font-medium ml-auto"
                    style={{ color: config.accentColor }}
                  >
                    {count}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() =>
            mapRef.current?.setZoom((mapRef.current.getZoom() || 5) + 1)
          }
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          onClick={() =>
            mapRef.current?.setZoom((mapRef.current.getZoom() || 5) - 1)
          }
        >
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
              d="M20 12H4"
            />
          </svg>
        </button>
        <div className="h-px bg-white/10 my-1" />
        <button className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
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
        </button>
      </div>

      {/* Hazard Type Indicator */}
      <div
        className="absolute top-4 left-4 glass-panel rounded-xl px-4 py-2 z-10"
        style={{
          borderLeft: `3px solid ${hazardConfig.accentColor}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
              boxShadow: `0 0 15px ${hazardConfig.accentColor}50`,
            }}
          >
            <span className="text-white text-lg">
              {activeHazard === "oil_spill"
                ? "💧"
                : activeHazard === "hab"
                ? "🧪"
                : activeHazard === "cyclone"
                ? "🌀"
                : activeHazard === "mhw"
                ? "🌡️"
                : "🌊"}
            </span>
          </div>
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: hazardConfig.accentColor }}
            >
              {hazardConfig.name}
            </div>
            <div className="text-[10px] text-white/40">
              T+{currentForecastHour}h Forecast
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
