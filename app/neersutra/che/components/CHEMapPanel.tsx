/**
 * ============================================
 * CHE Map Panel - Specialized Map for CHE View
 * Focused on data visualization, minimal ship traffic
 * ============================================
 */

"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import { ScatterplotLayer } from "@deck.gl/layers";
import {
  useCHEStore,
  getLayerColorScale,
} from "../../../../src/store/useCHEStore";
import {
  generateSimulationGrid,
  generateLocationAnalysis,
} from "../../../../src/lib/che/engine";
import type { GridCell } from "../../../../src/lib/che/types";

interface CHEMapPanelProps {
  onLocationClick?: (lat: number, lon: number) => void;
  className?: string;
}

export default function CHEMapPanel({
  onLocationClick,
  className = "",
}: CHEMapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    activeLayer: cheActiveLayer,
    selectedDepth,
    layerOpacity: cheOpacity,
    setSimulationGrid,
    selectLocation,
    selectedLocation,
  } = useCHEStore();

  // Default view state centered on Bay of Bengal
  const [viewState, setViewState] = useState({
    latitude: 15.0,
    longitude: 85.0,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

  // Local grid state (avoid setState during render)
  const [cheGrid, setCheGrid] = useState<ReturnType<
    typeof generateSimulationGrid
  > | null>(null);

  // Generate CHE grid data in useEffect (not during render)
  useEffect(() => {
    if (cheActiveLayer === "none" || !mapLoaded) {
      setCheGrid(null);
      return;
    }

    const bounds = {
      minLat: viewState.latitude - 8,
      maxLat: viewState.latitude + 8,
      minLon: viewState.longitude - 10,
      maxLon: viewState.longitude + 10,
    };

    const grid = generateSimulationGrid(bounds, 0.8, selectedDepth, new Date());
    setCheGrid(grid);
    setSimulationGrid(grid);
  }, [
    cheActiveLayer,
    selectedDepth,
    viewState.latitude,
    viewState.longitude,
    mapLoaded,
    setSimulationGrid,
  ]);

  // CHE color getter - only show significant values
  const getCHEColor = useCallback(
    (cell: GridCell): [number, number, number, number] => {
      let value: number;
      switch (cheActiveLayer) {
        case "dzri":
          value = cell.DZRI;
          break;
        case "pei":
          value = cell.PEI;
          break;
        case "ors":
          value = cell.ORS;
          break;
        case "do":
          value = cell.DO_atDepth / 10;
          break;
        default:
          value = 0;
      }

      // Only show points above a threshold for cleaner visualization
      const threshold = 0.25;
      if (value < threshold) {
        return [0, 0, 0, 0]; // Invisible below threshold
      }

      const colorScale = getLayerColorScale(cheActiveLayer);
      const t = Math.min(Math.max(value, 0), 1);

      let color: [number, number, number];
      if (t < 0.5) {
        const localT = t * 2;
        color = [
          Math.round(
            colorScale[0][0] + (colorScale[1][0] - colorScale[0][0]) * localT
          ),
          Math.round(
            colorScale[0][1] + (colorScale[1][1] - colorScale[0][1]) * localT
          ),
          Math.round(
            colorScale[0][2] + (colorScale[1][2] - colorScale[0][2]) * localT
          ),
        ];
      } else {
        const localT = (t - 0.5) * 2;
        color = [
          Math.round(
            colorScale[1][0] + (colorScale[2][0] - colorScale[1][0]) * localT
          ),
          Math.round(
            colorScale[1][1] + (colorScale[2][1] - colorScale[1][1]) * localT
          ),
          Math.round(
            colorScale[1][2] + (colorScale[2][2] - colorScale[1][2]) * localT
          ),
        ];
      }

      // Scale alpha based on value intensity (higher = more visible)
      const alpha = Math.round(cheOpacity * (60 + value * 100));
      return [...color, alpha] as [number, number, number, number];
    },
    [cheActiveLayer, cheOpacity]
  );

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current) return;

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    if (!googleMapsApiKey) {
      setError("Google Maps API key not configured.");
      initFallbackMap();
      return;
    }

    setOptions({
      key: googleMapsApiKey,
      v: "weekly",
      libraries: ["maps", "marker"],
    });

    importLibrary("maps")
      .then((mapsLibrary) => {
        if (!mapContainer.current) return;

        const { Map } = mapsLibrary;

        mapRef.current = new Map(mapContainer.current, {
          center: { lat: viewState.latitude, lng: viewState.longitude },
          zoom: viewState.zoom,
          tilt: 0,
          heading: 0,
          mapId: "CHE_ANALYSIS_MAP",
          mapTypeId: "satellite",
          disableDefaultUI: true,
          gestureHandling: "greedy",
        });

        overlayRef.current = new GoogleMapsOverlay({ layers: [] });
        overlayRef.current.setMap(mapRef.current);

        mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lon = e.latLng.lng();
            const analysis = generateLocationAnalysis(lat, lon, new Date());
            selectLocation(lat, lon, analysis);
            onLocationClick?.(lat, lon);
          }
        });

        mapRef.current.addListener("idle", () => {
          if (!mapRef.current) return;
          const center = mapRef.current.getCenter();
          if (center) {
            setViewState({
              longitude: center.lng(),
              latitude: center.lat(),
              zoom: mapRef.current.getZoom() || viewState.zoom,
              pitch: 0,
              bearing: 0,
            });
          }
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("Google Maps failed to load:", err);
        setError("Failed to load Google Maps.");
        initFallbackMap();
      });

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, []);

  // Fallback to MapLibre
  const initFallbackMap = useCallback(async () => {
    if (!mapContainer.current) return;

    const maplibregl = (await import("maplibre-gl")).default;

    const fallbackMap = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: "CHE Fallback",
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          { id: "carto-dark-layer", type: "raster", source: "carto-dark" },
        ],
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
    });

    fallbackMap.on("load", () => setMapLoaded(true));

    fallbackMap.on("click", (e) => {
      const lat = e.lngLat.lat;
      const lon = e.lngLat.lng;
      const analysis = generateLocationAnalysis(lat, lon, new Date());
      selectLocation(lat, lon, analysis);
      onLocationClick?.(lat, lon);
    });
  }, [viewState, selectLocation, onLocationClick]);

  // Update Deck.gl layers
  useEffect(() => {
    if (!overlayRef.current || !mapLoaded) return;

    const layers: any[] = [];

    // CHE Data Layer
    if (cheActiveLayer !== "none" && cheGrid && cheGrid.cells.length > 0) {
      layers.push(
        new ScatterplotLayer({
          id: "che-data-layer",
          data: cheGrid.cells,
          pickable: true,
          opacity: cheOpacity,
          stroked: true,
          filled: true,
          radiusScale: 6000, // Reduced for better visibility
          radiusMinPixels: 3, // Smaller minimum
          radiusMaxPixels: 15, // Smaller maximum
          getPosition: (d: GridCell) => [d.lon, d.lat],
          getFillColor: getCHEColor,
          getLineColor: [255, 255, 255, 30] as [number, number, number, number],
          lineWidthMinPixels: 1,
          onClick: (info: any) => {
            if (info.object) {
              const cell = info.object as GridCell;
              const analysis = generateLocationAnalysis(
                cell.lat,
                cell.lon,
                new Date()
              );
              selectLocation(cell.lat, cell.lon, analysis);
              onLocationClick?.(cell.lat, cell.lon);
            }
          },
          updateTriggers: {
            getFillColor: [cheActiveLayer, cheOpacity],
          },
        })
      );
    }

    // Selected location marker
    if (selectedLocation) {
      layers.push(
        new ScatterplotLayer({
          id: "selected-location",
          data: [selectedLocation],
          pickable: false,
          opacity: 1,
          stroked: true,
          filled: false,
          radiusMinPixels: 20,
          radiusMaxPixels: 30,
          getPosition: (d: any) => [d.lon, d.lat],
          getLineColor: [34, 211, 238, 255] as [number, number, number, number],
          lineWidthMinPixels: 3,
        })
      );
    }

    overlayRef.current.setProps({ layers });
  }, [
    cheGrid,
    cheActiveLayer,
    cheOpacity,
    getCHEColor,
    selectedLocation,
    mapLoaded,
    selectLocation,
    onLocationClick,
  ]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      />

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 text-sm text-amber-400 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-sm text-cyan-400">
              LOADING CHE MAP...
            </span>
          </div>
        </div>
      )}

      {/* Layer Legend */}
      {cheActiveLayer !== "none" && mapLoaded && (
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
            {cheActiveLayer.toUpperCase()} Legend
          </div>
          <div
            className="h-2 w-32 rounded-full mb-2"
            style={{
              background: `linear-gradient(to right, 
                rgb(${getLayerColorScale(cheActiveLayer)[0].join(",")}), 
                rgb(${getLayerColorScale(cheActiveLayer)[1].join(",")}), 
                rgb(${getLayerColorScale(cheActiveLayer)[2].join(",")})
              )`,
            }}
          />
          <div className="flex justify-between text-[9px] text-white/50">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
