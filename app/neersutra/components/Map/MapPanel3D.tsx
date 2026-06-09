'use client';

/**
 * MapPanel3D — Fleet Tracking Map
 * MapTiler Satellite v4 via MapLibre + Deck.gl overlay.
 * All AIS / route layer logic is unchanged.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { useMapStore, useTimeStore } from '../../store';
import type { AISData, Route } from '../../types';

const MAPTILER_STYLE = `https://api.maptiler.com/maps/satellite-v4/style.json?key=${
  process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'BzBDfbnpDAN0yIDfeSBN'
}`;

interface MapPanelProps {
  aisData?: AISData[];
  routes?: Route[];
  onShipClick?: (ship: AISData) => void;
  onMapClick?: (lat: number, lon: number) => void;
  className?: string;
}

export function MapPanel({
  aisData = [],
  routes = [],
  onShipClick,
  onMapClick,
  className = '',
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { viewState, setViewState, layerVisibility, selectedShip } = useMapStore();
  const { currentTime } = useTimeStore();

  // ── Map initialisation — MapTiler Satellite via MapLibre ──────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const init = async () => {
      try {
        const maplibregl = (await import('maplibre-gl')).default;

        if (!document.getElementById('maplibre-gl-css')) {
          const link = document.createElement('link');
          link.id = 'maplibre-gl-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
          document.head.appendChild(link);
          await new Promise((r) => setTimeout(r, 100));
        }

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: MAPTILER_STYLE,
          center: [viewState.longitude, viewState.latitude],
          zoom: viewState.zoom,
          pitch: viewState.pitch,
          bearing: viewState.bearing,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on('style.load', () => {
          const overlay = new MapboxOverlay({ layers: [], interleaved: false });
          map.addControl(overlay as any);
          overlayRef.current = overlay;
          setMapLoaded(true);
        });

        map.on('error', (e) => {
          console.error('Fleet map error:', e);
          setError('Satellite tiles could not be loaded.');
        });

        map.on('click', (e: any) => {
          onMapClick?.(e.lngLat.lat, e.lngLat.lng);
        });

        map.on('move', () => {
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
        console.error('Fleet map init failed:', err);
        setError('Failed to initialise map.');
      }
    };

    init();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // Update Deck.gl layers — unchanged
  useEffect(() => {
    if (!overlayRef.current || !mapLoaded) return;

    const layers: any[] = [];

    // AIS Traffic Layer
    if (layerVisibility.aisTraffic && aisData.length > 0) {
      layers.push(
        new ScatterplotLayer({
          id: 'ais-traffic',
          data: aisData,
          pickable: true,
          opacity: 0.9,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 8,
          radiusMaxPixels: 24,
          lineWidthMinPixels: 2,
          getPosition: (d: AISData) => [d.longitude, d.latitude],
          getRadius: (d: AISData) => Math.max(d.length / 8, 60),
          getFillColor: (d: AISData) => {
            const colors: Record<string, [number, number, number, number]> = {
              Cargo:     [16, 185, 129, 220],
              Tanker:    [245, 158, 11,  220],
              Container: [59, 130, 246,  220],
              Passenger: [139, 92, 246,  220],
              Fishing:   [20, 184, 166,  220],
              Other:     [148, 163, 184, 220],
            };
            return colors[d.shipType] || colors.Other;
          },
          getLineColor: (d: AISData) =>
            selectedShip?.MMSI === d.MMSI
              ? [255, 255, 255, 255] as [number, number, number, number]
              : [255, 255, 255, 120] as [number, number, number, number],
          getLineWidth: (d: AISData) =>
            selectedShip?.MMSI === d.MMSI ? 4 : 2,
          onClick: (info: any) => {
            if (info.object) onShipClick?.(info.object as AISData);
          },
          updateTriggers: {
            getLineColor: [selectedShip?.MMSI],
            getLineWidth:  [selectedShip?.MMSI],
          },
        })
      );
    }

    // Route Layers
    if (layerVisibility.routes && routes.length > 0) {
      routes.forEach((route, idx) => {
        const isSelected = idx === 0;
        const path = route.waypoints.map((wp) => [wp.lon, wp.lat]);

        layers.push(
          new PathLayer({
            id: `route-${route.routeID}`,
            data: [{ path, route }],
            pickable: true,
            widthScale: 1,
            widthMinPixels: isSelected ? 5 : 3,
            widthMaxPixels: 12,
            getPath: (d: any) => d.path,
            getColor: isSelected
              ? [16, 185, 129, 255] as [number, number, number, number]
              : [100, 116, 139, 180] as [number, number, number, number],
            getWidth: isSelected ? 5 : 3,
            jointRounded: true,
            capRounded: true,
          })
        );

        if (isSelected) {
          layers.push(
            new ScatterplotLayer({
              id: `waypoints-${route.routeID}`,
              data: route.waypoints,
              pickable: true,
              opacity: 1,
              stroked: true,
              filled: true,
              radiusMinPixels: 6,
              radiusMaxPixels: 10,
              getPosition: (d: any) => [d.lon, d.lat],
              getRadius: 80,
              getFillColor: [16, 185, 129, 255],
              getLineColor: [255, 255, 255, 255],
              lineWidthMinPixels: 2,
            })
          );
        }
      });
    }

    overlayRef.current.setProps({ layers });
  }, [aisData, routes, layerVisibility, selectedShip, mapLoaded, currentTime, onShipClick]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="w-full h-full" style={{ minHeight: '100%' }} />

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-capsule px-4 py-2 text-sm text-amber-500">
          {error}
        </div>
      )}

      {!mapLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
          style={{ background: "radial-gradient(ellipse at 50% 70%, #051830 0%, #020c1b 60%)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-sm text-cyan-400">LOADING SATELLITE MAP…</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPanel;
