'use client';

import { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { IconLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { useMapStore, useTimeStore } from '../../store';
import type { AISData, Route } from '../../types';

// Import MapLibre CSS
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapPanelProps {
  aisData?: AISData[];
  routes?: Route[];
  onShipClick?: (ship: AISData) => void;
  onMapClick?: (lat: number, lon: number) => void;
  className?: string;
}

/**
 * MapPanel - The core 4D visualization component
 * Uses MapLibre GL (open-source Mapbox) with Deck.gl overlay
 */
export function MapPanel({
  aisData = [],
  routes = [],
  onShipClick,
  onMapClick,
  className = '',
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { viewState, setViewState, layerVisibility, selectedShip } = useMapStore();
  const { currentTime } = useTimeStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // @ts-ignore - antialias is valid but not in types
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Dark maritime style - using a free dark tile source
      style: {
        version: 8,
        name: 'NeerSutra Dark',
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    });

    // Add navigation controls
    map.current.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    // Add scale
    map.current.addControl(
      new maplibregl.ScaleControl({ unit: 'nautical' }),
      'bottom-left'
    );

    // Initialize Deck.gl overlay
    deckOverlay.current = new MapboxOverlay({
      interleaved: true,
      layers: [],
    });
    map.current.addControl(deckOverlay.current as any);

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Handle map clicks
    map.current.on('click', (e) => {
      onMapClick?.(e.lngLat.lat, e.lngLat.lng);
    });

    // Sync view state
    map.current.on('move', () => {
      if (!map.current) return;
      const center = map.current.getCenter();
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.current.getZoom(),
        pitch: map.current.getPitch(),
        bearing: map.current.getBearing(),
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Deck.gl layers when data changes
  useEffect(() => {
    if (!deckOverlay.current || !mapLoaded) return;

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
          radiusMinPixels: 6,
          radiusMaxPixels: 20,
          lineWidthMinPixels: 1,
          getPosition: (d: AISData) => [d.longitude, d.latitude],
          getRadius: (d: AISData) => Math.max(d.length / 10, 50),
          getFillColor: (d: AISData) => {
            // Color by ship type
            const colors: Record<string, [number, number, number, number]> = {
              Cargo: [34, 197, 94, 200],      // Green
              Tanker: [249, 115, 22, 200],     // Orange (warning)
              Container: [59, 130, 246, 200],  // Blue
              Passenger: [168, 85, 247, 200],  // Purple
              Fishing: [20, 184, 166, 200],    // Teal
              Other: [156, 163, 175, 200],     // Gray
            };
            return colors[d.shipType] || colors.Other;
          },
          getLineColor: (d: AISData) =>
            selectedShip?.MMSI === d.MMSI
              ? [255, 255, 255, 255] as [number, number, number, number]
              : [255, 255, 255, 100] as [number, number, number, number],
          getLineWidth: (d: AISData) =>
            selectedShip?.MMSI === d.MMSI ? 3 : 1,
          onClick: (info: any) => {
            if (info.object) {
              onShipClick?.(info.object as AISData);
            }
          },
          updateTriggers: {
            getLineColor: [selectedShip?.MMSI],
            getLineWidth: [selectedShip?.MMSI],
          },
        })
      );

      // Ship heading indicators (direction arrows)
      layers.push(
        new IconLayer({
          id: 'ais-heading',
          data: aisData,
          pickable: false,
          iconAtlas: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,4 24,28 16,22 8,28" fill="white" stroke="none"/>
            </svg>
          `),
          iconMapping: {
            arrow: { x: 0, y: 0, width: 32, height: 32, anchorY: 16 },
          },
          getIcon: () => 'arrow',
          getPosition: (d: AISData) => [d.longitude, d.latitude],
          getSize: 20,
          getAngle: (d: AISData) => 360 - d.heading,
          getColor: [255, 255, 255, 180],
        })
      );
    }

    // Route Layers
    if (layerVisibility.routes && routes.length > 0) {
      routes.forEach((route, idx) => {
        const isSelected = idx === 0; // First route is selected
        const path = route.waypoints.map((wp) => [wp.lon, wp.lat]);

        layers.push(
          new PathLayer({
            id: `route-${route.routeID}`,
            data: [{ path, route }],
            pickable: true,
            widthScale: 1,
            widthMinPixels: isSelected ? 4 : 2,
            widthMaxPixels: 10,
            getPath: (d: any) => d.path,
            getColor: isSelected
              ? [34, 197, 94, 255] as [number, number, number, number]  // Green for selected
              : [100, 100, 100, 150] as [number, number, number, number], // Gray for alternatives
            getWidth: isSelected ? 4 : 2,
          })
        );

        // Waypoint markers for selected route
        if (isSelected) {
          layers.push(
            new ScatterplotLayer({
              id: `waypoints-${route.routeID}`,
              data: route.waypoints,
              pickable: true,
              opacity: 1,
              stroked: true,
              filled: true,
              radiusMinPixels: 4,
              radiusMaxPixels: 8,
              getPosition: (d) => [d.lon, d.lat],
              getRadius: 100,
              getFillColor: [34, 197, 94, 255],
              getLineColor: [255, 255, 255, 255],
              lineWidthMinPixels: 1,
            })
          );
        }
      });
    }

    deckOverlay.current.setProps({ layers });
  }, [aisData, routes, layerVisibility, selectedShip, mapLoaded, currentTime]);

  return (
    <div
      ref={mapContainer}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100%' }}
    />
  );
}

export default MapPanel;
