'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer, PathLayer, IconLayer } from '@deck.gl/layers';
import { useMapStore, useTimeStore } from '../../store';
import type { AISData, Route } from '../../types';

interface MapPanelProps {
  aisData?: AISData[];
  routes?: Route[];
  onShipClick?: (ship: AISData) => void;
  onMapClick?: (lat: number, lon: number) => void;
  className?: string;
  googleMapsApiKey?: string;
}

/**
 * MapPanel - Google Maps 3D Tiles with Deck.gl overlay
 * Uses Google Maps Photorealistic 3D for stunning visual fidelity
 */
export function MapPanel({
  aisData = [],
  routes = [],
  onShipClick,
  onMapClick,
  className = '',
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { viewState, setViewState, layerVisibility, selectedShip } = useMapStore();
  const { currentTime } = useTimeStore();

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current) return;

    // If no API key, show fallback message
    if (!googleMapsApiKey) {
      setError('Google Maps API key not configured. Using fallback map.');
      initFallbackMap();
      return;
    }

    // Use the new functional API
    setOptions({
      key: googleMapsApiKey,
      v: 'weekly',
      libraries: ['maps', 'marker'],
    });

    importLibrary('maps')
      .then((mapsLibrary) => {
        if (!mapContainer.current) return;

        const { Map } = mapsLibrary;

        mapRef.current = new Map(mapContainer.current, {
          center: { lat: viewState.latitude, lng: viewState.longitude },
          zoom: viewState.zoom,
          tilt: viewState.pitch,
          heading: viewState.bearing,
          mapId: 'NEERSUTRA_3D_MAP', // Required for 3D tiles
          mapTypeId: 'satellite',
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          // Enable 3D buildings
          mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'terrain'],
          },
        });

        // Initialize Deck.gl overlay
        overlayRef.current = new GoogleMapsOverlay({
          layers: [],
        });
        overlayRef.current.setMap(mapRef.current);

        // Handle map clicks
        mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick?.(e.latLng.lat(), e.latLng.lng());
          }
        });

        // Sync view state on camera change
        mapRef.current.addListener('idle', () => {
          if (!mapRef.current) return;
          const center = mapRef.current.getCenter();
          if (center) {
            setViewState({
              longitude: center.lng(),
              latitude: center.lat(),
              zoom: mapRef.current.getZoom() || viewState.zoom,
              pitch: mapRef.current.getTilt() || 0,
              bearing: mapRef.current.getHeading() || 0,
            });
          }
        });

        setMapLoaded(true);
      })
      .catch((err) => {
        console.error('Google Maps failed to load:', err);
        setError('Failed to load Google Maps. Using fallback.');
        initFallbackMap();
      });

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [googleMapsApiKey]);

  // Fallback to MapLibre if Google Maps fails
  const initFallbackMap = useCallback(async () => {
    if (!mapContainer.current) return;

    const maplibregl = (await import('maplibre-gl')).default;
    // @ts-ignore - CSS import
    await import('maplibre-gl/dist/maplibre-gl.css');

    const fallbackMap = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'NeerSutra Fallback',
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
          },
        ],
      },
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    });

    fallbackMap.on('load', () => {
      setMapLoaded(true);
    });
  }, [viewState]);

  // Update Deck.gl layers
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
              Cargo: [16, 185, 129, 220],      // Emerald
              Tanker: [245, 158, 11, 220],     // Amber
              Container: [59, 130, 246, 220],  // Blue
              Passenger: [139, 92, 246, 220],  // Purple
              Fishing: [20, 184, 166, 220],    // Teal
              Other: [148, 163, 184, 220],     // Slate
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

        // Waypoint markers
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
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      />
      
      {/* Error message overlay */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 glass-capsule px-4 py-2 text-sm text-amber-500">
          ⚠️ {error}
        </div>
      )}
      
      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="font-data text-sm text-sky-400">
              INITIALIZING 3D MAP...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPanel;
