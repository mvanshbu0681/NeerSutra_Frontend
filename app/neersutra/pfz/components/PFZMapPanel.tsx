/**
 * ============================================
 * PFZ Map Panel - Fishing Zone Visualization
 * HSI heatmap + Zone polygons overlay
 * ============================================
 */

"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScatterplotLayer, PolygonLayer, TextLayer } from "@deck.gl/layers";

const MAPTILER_STYLE = `https://api.maptiler.com/maps/satellite-v4/style.json?key=${
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY || "BzBDfbnpDAN0yIDfeSBN"
}`;
import { usePFZStore } from "../../../../src/store/usePFZStore";
import {
  generatePFZForecast,
  analyzeLocation,
  generateHSIGrid,
} from "../../../../src/lib/pfz/engine";
import {
  SPECIES_PROFILES,
  HSI_THRESHOLDS,
} from "../../../../src/lib/pfz/types";
import type { HSIResult, PFZPolygon } from "../../../../src/lib/pfz/types";

interface PFZMapPanelProps {
  onLocationClick?: (lat: number, lon: number) => void;
  className?: string;
}

export default function PFZMapPanel({
  onLocationClick,
  className = "",
}: PFZMapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsiGrid, setHsiGrid] = useState<HSIResult[]>([]);

  const {
    selectedSpecies,
    currentForecast,
    setCurrentForecast,
    layerOpacity,
    hsiThreshold,
    viewMode,
    selectedZone,
    setSelectedZone,
    setLocationAnalysis,
    forecastDate,
    isLoading,
    setIsLoading,
  } = usePFZStore();

  // Default view state centered on Indian Ocean (better coverage)
  const [viewState, setViewState] = useState({
    latitude: 12.0,
    longitude: 78.0,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

  // Generate HSI grid when species or viewport changes
  useEffect(() => {
    if (!mapLoaded) return;

    setIsLoading(true);

    // Extended bounds covering Indian coastline and Bay of Bengal
    const bounds = {
      minLat: 6,
      maxLat: 24,
      minLon: 66,
      maxLon: 90,
    };

    // 1.0° resolution: ~430 cells instead of 2700 at 0.4° — prevents the
    // solid-orange overlay effect while still covering the full Indian coast.
    const grid = generateHSIGrid(bounds, 1.0, selectedSpecies);

    // Debug logging
    console.log("🗺️ PFZ Grid Generated:", {
      totalCells: grid.cells.length,
      highHSI: grid.cells.filter((c) => c.totalHSI > 0.7).length,
      mediumHSI: grid.cells.filter((c) => c.totalHSI > 0.5 && c.totalHSI <= 0.7)
        .length,
      sampleCell: grid.cells[0],
      bounds,
    });

    setHsiGrid(grid.cells);

    // Generate forecast
    const forecast = generatePFZForecast(selectedSpecies, forecastDate);

    console.log("🐟 PFZ Forecast:", {
      species: selectedSpecies,
      polygons: forecast.polygons.length,
      gridSummary: forecast.gridSummary,
    });

    setCurrentForecast(forecast);
    setIsLoading(false);
  }, [
    selectedSpecies,
    mapLoaded,
    forecastDate,
    setCurrentForecast,
    setIsLoading,
  ]);

  // HSI color getter (VIBRANT warm colors for high visibility)
  const getHSIColor = useCallback(
    (cell: HSIResult): [number, number, number, number] => {
      const hsi = cell.totalHSI;

      // Only show points above threshold for cleaner visualization
      if (hsi < hsiThreshold) {
        return [0, 0, 0, 0]; // Invisible below threshold
      }

      // Enhanced color scale: Show only important points
      let r: number, g: number, b: number, a: number;

      if (hsi < 0.4) {
        // Low-medium: faint teal, very transparent so map shows through
        const t = (hsi - hsiThreshold) / (0.4 - hsiThreshold);
        r = 60; g = 180; b = 200;
        a = 25 + Math.round(t * 25);           // max 50 — near-transparent
      } else if (hsi < 0.6) {
        // Medium: yellow-green
        const t = (hsi - 0.4) / 0.2;
        r = 120 + Math.round(t * 80); g = 210; b = 80 - Math.round(t * 40);
        a = 55 + Math.round(t * 30);           // max 85
      } else if (hsi < 0.75) {
        // High: warm amber
        const t = (hsi - 0.6) / 0.15;
        r = 255; g = 190 - Math.round(t * 50); b = 40;
        a = 90 + Math.round(t * 30);           // max 120
      } else {
        // Very high: orange-red hotspot
        const t = (hsi - 0.75) / 0.25;
        r = 255; g = 140 - Math.round(t * 90); b = 40 + Math.round(t * 30);
        a = 120 + Math.round(t * 40);          // max 160 — clearly visible but not opaque
      }

      return [r, g, b, Math.round(a * layerOpacity)];
    },
    [layerOpacity, hsiThreshold]
  );

  // ── Map initialisation — MapTiler Satellite via MapLibre ──────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const init = async () => {
      try {
        const maplibregl = (await import("maplibre-gl")).default;

        if (!document.getElementById("maplibre-gl-css")) {
          const link = document.createElement("link");
          link.id = "maplibre-gl-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
          document.head.appendChild(link);
          await new Promise((r) => setTimeout(r, 100));
        }

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAPTILER_STYLE,
          center: [78.0, 12.0],
          zoom: 5,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("style.load", () => {
          const overlay = new MapboxOverlay({ layers: [], interleaved: false });
          map.addControl(overlay as any);
          overlayRef.current = overlay;
          setMapLoaded(true);
        });

        map.on("error", (e) => {
          console.error("PFZ map error:", e);
          setError("Satellite tiles could not be loaded.");
        });

        map.on("click", (e: any) => {
          const lat = e.lngLat.lat;
          const lon = e.lngLat.lng;
          const analysis = analyzeLocation(lat, lon, selectedSpecies);
          setLocationAnalysis(analysis);
          onLocationClick?.(lat, lon);
        });

        map.on("move", () => {
          const c = map.getCenter();
          setViewState({
            longitude: c.lng,
            latitude: c.lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing(),
          });
        });
      } catch (err) {
        console.error("PFZ map init failed:", err);
        setError("Failed to initialise map.");
      }
    };

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // Update Deck.gl layers
  useEffect(() => {
    if (!overlayRef.current || !mapLoaded) return;

    console.log("🎨 Updating Deck.gl layers:", {
      viewMode,
      hsiGridLength: hsiGrid.length,
      hasOverlay: !!overlayRef.current,
      forecastPolygons: currentForecast?.polygons.length ?? 0,
    });

    const layers: any[] = [];

    // HSI Heatmap Layer - ALWAYS show if we have data (for debugging)
    if (hsiGrid.length > 0) {
      console.log(
        "🔴 Creating ScatterplotLayer with",
        hsiGrid.length,
        "points"
      );
      console.log(
        "📊 Sample positions:",
        hsiGrid
          .slice(0, 3)
          .map((c) => `[${c.lon}, ${c.lat}] HSI:${c.totalHSI.toFixed(2)}`)
      );

      layers.push(
        new ScatterplotLayer({
          id: "hsi-heatmap-layer",
          data: hsiGrid,
          pickable: true,
          opacity: 1,
          stroked: false,
          filled: true,
          radiusScale: 55000, // larger scale so 1° dots look right at zoom 5
          radiusMinPixels: 5,
          radiusMaxPixels: 20,
          getPosition: (d: HSIResult) => [d.lon, d.lat], // [lng, lat] format for Deck.gl
          getFillColor: getHSIColor,
          getLineColor: (d: HSIResult) => {
            // Contour lines for high-value cells
            if (viewMode === "contour") {
              if (d.totalHSI >= 0.85) {
                return [255, 255, 255, 255]; // Bright white for hotspots
              } else if (d.totalHSI >= 0.7) {
                return [255, 200, 100, 200]; // Golden for good zones
              } else if (d.totalHSI >= hsiThreshold) {
                return [100, 255, 200, 150]; // Cyan-green for threshold
              }
            }
            return [0, 0, 0, 0];
          },
          lineWidthMinPixels: viewMode === "contour" ? 2 : 0,
          onClick: (info: any) => {
            if (info.object) {
              const cell = info.object as HSIResult;
              const analysis = analyzeLocation(
                cell.lat,
                cell.lon,
                selectedSpecies
              );
              setLocationAnalysis(analysis);
              onLocationClick?.(cell.lat, cell.lon);
            }
          },
          updateTriggers: {
            getFillColor: [layerOpacity, hsiThreshold],
            getLineColor: [viewMode, hsiThreshold],
          },
        })
      );
    }

    // PFZ Zone Polygons Layer (ENHANCED) - Also show in zones mode
    if (currentForecast && currentForecast.polygons.length > 0) {
      console.log(
        "🟡 Creating PolygonLayer with",
        currentForecast.polygons.length,
        "zones"
      );

      // Polygon fills with vibrant colors
      layers.push(
        new PolygonLayer({
          id: "pfz-polygons-layer",
          data: currentForecast.polygons,
          pickable: true,
          stroked: true,
          filled: true,
          wireframe: false,
          lineWidthMinPixels: 3,
          getPolygon: (d: PFZPolygon) => d.geometry.coordinates[0],
          getFillColor: (d: PFZPolygon) => {
            const isSelected = selectedZone?.id === d.id;
            const alpha = isSelected ? 180 : 120;
            if (d.potential === "high") {
              // Hot red/orange glow
              return [255, 80, 60, alpha];
            } else if (d.potential === "medium") {
              // Warm yellow/orange
              return [255, 180, 40, alpha - 20];
            }
            // Lower potential - cyan
            return [100, 200, 180, alpha - 40];
          },
          getLineColor: (d: PFZPolygon) => {
            const isSelected = selectedZone?.id === d.id;
            if (d.potential === "high") {
              return isSelected ? [255, 255, 200, 255] : [255, 150, 100, 255];
            } else if (d.potential === "medium") {
              return isSelected ? [255, 220, 150, 255] : [255, 200, 80, 230];
            }
            return isSelected ? [150, 255, 220, 230] : [100, 200, 180, 200];
          },
          lineWidthScale: 1,
          onClick: (info: any) => {
            if (info.object) {
              setSelectedZone(info.object as PFZPolygon);
            }
          },
          updateTriggers: {
            getFillColor: [selectedZone?.id],
            getLineColor: [selectedZone?.id],
          },
        })
      );

      // Zone labels with better visibility
      layers.push(
        new TextLayer({
          id: "pfz-labels-layer",
          data: currentForecast.polygons,
          pickable: false,
          getPosition: (d: PFZPolygon) => [d.centroid.lon, d.centroid.lat],
          getText: (d: PFZPolygon) => `${(d.meanHSI * 100).toFixed(0)}%`,
          getSize: 16,
          getColor: [255, 255, 255, 255],
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
          fontFamily: "monospace",
          fontWeight: "bold",
          background: true,
          getBackgroundColor: (d: PFZPolygon) =>
            d.potential === "high" ? [200, 50, 30, 200] : [180, 120, 20, 180],
          backgroundPadding: [6, 3],
        })
      );
    }

    // Selected zone highlight
    if (selectedZone) {
      layers.push(
        new PolygonLayer({
          id: "selected-zone-highlight",
          data: [selectedZone],
          pickable: false,
          stroked: true,
          filled: false,
          lineWidthMinPixels: 3,
          getPolygon: (d: PFZPolygon) => d.geometry.coordinates[0],
          getLineColor: [255, 200, 100, 255],
        })
      );
    }

    console.log("📦 Setting", layers.length, "layers on overlay");
    overlayRef.current.setProps({ layers });
  }, [
    hsiGrid,
    currentForecast,
    viewMode,
    layerOpacity,
    hsiThreshold,
    getHSIColor,
    selectedZone,
    mapLoaded,
    selectedSpecies,
    setLocationAnalysis,
    setSelectedZone,
    onLocationClick,
  ]);

  const speciesProfile = SPECIES_PROFILES[selectedSpecies];

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      />

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 text-sm text-amber-400 rounded-xl">
          {error}
        </div>
      )}

      {(!mapLoaded || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-sm text-amber-400">
              {isLoading ? "CALCULATING HSI..." : "LOADING PFZ MAP..."}
            </span>
          </div>
        </div>
      )}

      {/* HSI Color Legend - Enhanced */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              HSI Legend - {speciesProfile.name}
            </span>
          </div>
          <div
            className="h-3 w-40 rounded-full mb-2 border border-white/20"
            style={{
              background:
                "linear-gradient(to right, rgba(50,80,150,0.5), #40d0c0, #c8c850, #ffa030, #ff5050, #ff50c0)",
              boxShadow: "0 0 10px rgba(255, 100, 50, 0.3)",
            }}
          />
          <div className="flex justify-between text-[9px] text-white/60">
            <span>Low</span>
            <span className="text-cyan-400">Fair</span>
            <span className="text-yellow-400">Good</span>
            <span className="text-orange-400">High</span>
            <span className="text-red-400 font-bold text-[9px]">MAX</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="text-white/40">Mode:</span>
              <span className="text-cyan-400 uppercase font-medium">
                {viewMode}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-white/40">Zones:</span>
              <span className="text-amber-400 font-medium">
                {currentForecast?.polygons.length ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Zone Quick Info (bottom right) */}
      {selectedZone && mapLoaded && (
        <div className="absolute bottom-4 right-4 glass-panel rounded-xl p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-white/50">
              Selected Zone
            </span>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-white/40 hover:text-white transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">HSI Score</span>
              <span className="font-medium text-amber-400">
                {(selectedZone.meanHSI * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Area</span>
              <span className="font-medium text-white">
                {Math.round(selectedZone.areaKm2)} km²
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Nearest Port</span>
              <span className="font-medium text-cyan-400">
                {selectedZone.nearestPort}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Potential</span>
              <span
                className={`font-medium px-1.5 py-0.5 rounded text-[10px] ${
                  selectedZone.potential === "high"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {selectedZone.potential.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
