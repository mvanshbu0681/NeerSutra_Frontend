/**
 * ============================================
 * EWS Map Panel - Hazard Visualization (MapLibre + Deck.gl)
 * IOHD-EWS: Multi-layer hazard rendering without Google Maps
 * ============================================
 */

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, PolygonLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import { motion, AnimatePresence } from 'framer-motion';
import { useEWSStore, useFilteredEvents } from '../../../../src/store/useEWSStore';
import { 
  generateCycloneTrack, 
  generateAnimatedParticles,
  generateCycloneWindField,
  type WindFieldPoint,
} from '../../../../src/lib/ews/engine';
import { 
  HAZARD_CONFIG, 
  SEVERITY_CONFIG,
  type HazardEvent,
  type Particle,
  type CycloneTrack,
} from '../../../../src/lib/ews/types';

interface EWSMapPanelProps {
  className?: string;
}

// Convert hex to RGB array
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [255, 255, 255];
}

// Interpolate between two colors
function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(color1[0] + (color2[0] - color1[0]) * t),
    Math.round(color1[1] + (color2[1] - color1[1]) * t),
    Math.round(color1[2] + (color2[2] - color1[2]) * t),
  ];
}

export default function EWSMapPanel({ className = '' }: EWSMapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [cycloneTracks, setCycloneTracks] = useState<CycloneTrack[]>([]);
  const [windField, setWindField] = useState<WindFieldPoint[]>([]);

  const {
    activeHazard,
    selectedEventId,
    selectEvent,
    currentForecastHour,
    showProbabilityLayer,
    showParticles,
    showUncertaintyCone,
    severityFilter,
  } = useEWSStore();

  const events = useFilteredEvents();
  const hazardConfig = HAZARD_CONFIG[activeHazard];
  
  // Filter events by severity (only show events matching selected severity)
  const visibleEvents = useMemo(() => {
    if (severityFilter === 'all') return events;
    return events.filter(e => e.severity === severityFilter);
  }, [events, severityFilter]);
  
  // Create stable event IDs string to use as dependency
  const visibleEventIds = useMemo(() => visibleEvents.map(e => e.eventId).join(','), [visibleEvents]);

  // Default view state centered on Bay of Bengal
  const [viewState, setViewState] = useState({
    latitude: 15.0,
    longitude: 85.0,
    zoom: 5,
    pitch: 0,
    bearing: 0,
  });

  // Generate particles for oil spill events
  useEffect(() => {
    if (activeHazard !== 'oil_spill' || !showParticles) {
      setParticles([]);
      return;
    }

    const allParticles: Particle[] = [];
    visibleEvents.forEach((event) => {
      if (event.hazardType === 'oil_spill') {
        const animatedParticles = generateAnimatedParticles(event, currentForecastHour, 0);
        allParticles.push(...animatedParticles);
      }
    });

    setParticles(allParticles);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHazard, visibleEventIds, currentForecastHour, showParticles]);

  // Generate cyclone tracks and wind fields
  useEffect(() => {
    if (activeHazard !== 'cyclone') {
      setCycloneTracks([]);
      setWindField([]);
      return;
    }

    const tracks: CycloneTrack[] = [];
    visibleEvents.forEach((event) => {
      if (event.hazardType === 'cyclone') {
        const track = generateCycloneTrack(event, currentForecastHour);
        if (track) tracks.push(track);
      }
    });

    setCycloneTracks(tracks);

    if (tracks.length > 0 && showUncertaintyCone) {
      const currentTrack = tracks[0];
      const currentPointIdx = Math.min(
        Math.floor(currentForecastHour / 6),
        currentTrack.trackPoints.length - 1
      );
      const currentPoint = currentTrack.trackPoints[currentPointIdx];
      
      if (currentPoint) {
        const field = generateCycloneWindField(
          currentPoint.lon,
          currentPoint.lat,
          currentPoint.intensity,
          currentPoint.rMax,
          8
        );
        setWindField(field);
      }
    } else {
      setWindField([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeHazard, visibleEventIds, currentForecastHour, showUncertaintyCone]);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('🗺️ EWS: Initializing MapLibre...');
        
        // Dynamically import maplibre-gl
        const maplibregl = (await import('maplibre-gl')).default;
        console.log('📦 EWS: MapLibre module loaded');
        
        // Inject MapLibre CSS - CRITICAL for rendering
        if (!document.getElementById('maplibre-gl-css')) {
          const link = document.createElement('link');
          link.id = 'maplibre-gl-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
          document.head.appendChild(link);
          console.log('🎨 EWS: MapLibre CSS injected');
          
          // Wait for CSS to load
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const map = new maplibregl.Map({
          container: mapContainer.current!,
          style: {
            version: 8,
            name: 'EWS Hazard Map',
            sources: {
              'carto-dark': {
                type: 'raster',
                tiles: [
                  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                  'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                ],
                tileSize: 256,
                attribution: '&copy; CARTO',
                maxzoom: 19,
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
          attributionControl: false,
        });

        mapRef.current = map;
        console.log('🗺️ EWS: Map instance created');

        // Wait for style to load before adding overlay
        map.on('style.load', () => {
          console.log('🎨 EWS: Map style loaded');
          
          // Initialize Deck.gl overlay
          try {
            const overlay = new MapboxOverlay({
              layers: [],
              interleaved: false,
            });
            
            map.addControl(overlay as any);
            overlayRef.current = overlay;
            console.log('📊 EWS: Deck.gl overlay initialized');
          } catch (overlayErr) {
            console.error('❌ EWS: Failed to add Deck.gl overlay:', overlayErr);
          }
        });

        // Handle map click
        map.on('click', (e) => {
          console.log('🗺️ EWS: Map clicked:', e.lngLat.lat, e.lngLat.lng);
        });

        // Track view state changes
        map.on('move', () => {
          const center = map.getCenter();
          setViewState({
            latitude: center.lat,
            longitude: center.lng,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing(),
          });
        });

        map.on('load', () => {
          setMapLoaded(true);
          console.log('✅ EWS: MapLibre Map fully loaded');
        });

        // Handle errors
        map.on('error', (e) => {
          console.error('❌ EWS: MapLibre error:', e);
        });

        // Mark map as ready after a short delay to ensure rendering
        setTimeout(() => {
          setMapReady(true);
          console.log('✅ EWS: Map marked as ready');
        }, 500);

      } catch (err: any) {
        console.error('❌ EWS: Failed to initialize map:', err);
        setError('Failed to load map: ' + (err.message || 'Unknown error'));
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Get current polygon for event based on forecast hour
  const getCurrentPolygon = useCallback((event: HazardEvent) => {
    const polygonIndex = Math.min(
      Math.floor(currentForecastHour / 3),
      event.polygons.length - 1
    );
    return event.polygons[polygonIndex] || event.polygons[0];
  }, [currentForecastHour]);

  // Get event fill color based on severity and hazard type
  const getEventColor = useCallback((event: HazardEvent): [number, number, number, number] => {
    const config = HAZARD_CONFIG[event.hazardType];
    const rgb = hexToRgb(config.accentColor);
    const polygon = getCurrentPolygon(event);
    const opacity = 80 + Math.floor(polygon.probability * 120);
    return [rgb[0], rgb[1], rgb[2], opacity];
  }, [getCurrentPolygon]);

  // Build Deck.gl layers
  const layers = useMemo(() => {
    if (!mapLoaded) return [];

    const layerList: any[] = [];

    // 1. Hazard Event Polygons (all hazard types)
    if (showProbabilityLayer) {
      const polygonData = visibleEvents.map((event) => {
        const polygon = getCurrentPolygon(event);
        return {
          event,
          polygon: polygon.geometry.coordinates[0],
          probability: polygon.probability,
        };
      });

      layerList.push(
        new PolygonLayer({
          id: 'hazard-polygons',
          data: polygonData,
          getPolygon: (d) => d.polygon,
          getFillColor: (d) => getEventColor(d.event),
          getLineColor: (d) => {
            const config = HAZARD_CONFIG[d.event.hazardType];
            const rgb = hexToRgb(config.accentColor);
            return [...rgb, 200];
          },
          getLineWidth: (d) => (d.event.eventId === selectedEventId ? 3 : 1),
          lineWidthUnits: 'pixels',
          filled: true,
          stroked: true,
          pickable: true,
          onClick: ({ object }) => {
            if (object) {
              selectEvent(object.event.eventId);
            }
          },
          updateTriggers: {
            getFillColor: [currentForecastHour],
            getLineWidth: [selectedEventId],
          },
        })
      );

      // Polygon outline glow for selected event
      if (selectedEventId) {
        const selectedEvent = visibleEvents.find((e) => e.eventId === selectedEventId);
        if (selectedEvent) {
          const polygon = getCurrentPolygon(selectedEvent);
          const config = HAZARD_CONFIG[selectedEvent.hazardType];
          const rgb = hexToRgb(config.accentColor);

          layerList.push(
            new PolygonLayer({
              id: 'selected-glow',
              data: [{ polygon: polygon.geometry.coordinates[0] }],
              getPolygon: (d) => d.polygon,
              getFillColor: [0, 0, 0, 0],
              getLineColor: [...rgb, 150],
              getLineWidth: 6,
              lineWidthUnits: 'pixels',
              filled: false,
              stroked: true,
            })
          );
        }
      }
    }

    // 2. Oil Spill Particle Layer
    if (activeHazard === 'oil_spill' && showParticles && particles.length > 0) {
      const config = HAZARD_CONFIG.oil_spill;
      const rgb = hexToRgb(config.accentColor);

      layerList.push(
        new ScatterplotLayer({
          id: 'oil-particles',
          data: particles,
          getPosition: (d) => [d.lon, d.lat],
          getRadius: (d) => 2 + d.probability * 4,
          getFillColor: (d) => {
            const ageFactor = Math.max(0.3, 1 - d.age / 168);
            return [rgb[0], rgb[1], rgb[2], Math.floor(150 * ageFactor * d.probability)];
          },
          radiusUnits: 'pixels',
          radiusMinPixels: 2,
          radiusMaxPixels: 8,
          updateTriggers: {
            getPosition: [currentForecastHour],
            getFillColor: [currentForecastHour],
          },
        })
      );
    }

    // 3. HAB Visualization Layer
    if (activeHazard === 'hab' && showProbabilityLayer) {
      const habEvents = visibleEvents.filter((e) => e.hazardType === 'hab');
      const scatterData: { position: [number, number]; weight: number; event: HazardEvent }[] = [];
      
      habEvents.forEach((event) => {
        const polygon = getCurrentPolygon(event);
        const coords = polygon.geometry.coordinates[0];
        const centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        
        scatterData.push({
          position: [centerLon, centerLat],
          weight: polygon.probability,
          event,
        });
        
        coords.forEach((coord) => {
          scatterData.push({
            position: [coord[0], coord[1]],
            weight: polygon.probability * 0.5,
            event,
          });
        });
        
        for (let i = 0; i < coords.length - 1; i++) {
          const midLon = (coords[i][0] + coords[i + 1][0]) / 2;
          const midLat = (coords[i][1] + coords[i + 1][1]) / 2;
          scatterData.push({
            position: [midLon, midLat],
            weight: polygon.probability * 0.7,
            event,
          });
        }
      });

      if (scatterData.length > 0) {
        layerList.push(
          new ScatterplotLayer({
            id: 'hab-scatter',
            data: scatterData,
            getPosition: (d) => d.position,
            getRadius: (d) => 8 + d.weight * 40,
            getFillColor: (d) => {
              const t = d.weight;
              if (t < 0.3) return [22, 101, 52, 80];
              if (t < 0.5) return [34, 197, 94, 120];
              if (t < 0.7) return [134, 239, 172, 160];
              if (t < 0.85) return [254, 240, 138, 180];
              return [239, 68, 68, 200];
            },
            radiusUnits: 'pixels',
            radiusMinPixels: 8,
            radiusMaxPixels: 50,
            pickable: true,
            onClick: ({ object }) => {
              if (object) {
                selectEvent(object.event.eventId);
              }
            },
          })
        );
      }
    }

    // 4. Cyclone Track Layer with Uncertainty Cone
    if (activeHazard === 'cyclone' && cycloneTracks.length > 0) {
      const config = HAZARD_CONFIG.cyclone;
      const rgb = hexToRgb(config.accentColor);

      cycloneTracks.forEach((track, idx) => {
        // Uncertainty cone
        if (showUncertaintyCone && track.uncertaintyCone) {
          layerList.push(
            new PolygonLayer({
              id: `cyclone-cone-${idx}`,
              data: [{ polygon: track.uncertaintyCone.coordinates[0] }],
              getPolygon: (d) => d.polygon,
              getFillColor: [...rgb, 30],
              getLineColor: [...rgb, 80],
              getLineWidth: 1,
              lineWidthUnits: 'pixels',
              filled: true,
              stroked: true,
            })
          );
        }

        const visiblePoints = track.trackPoints.slice(
          0,
          Math.ceil(currentForecastHour / 6) + 1
        );

        if (visiblePoints.length >= 1) {
          const pastPoints = visiblePoints.slice(0, -1);
          const futurePoints = visiblePoints;

          if (pastPoints.length >= 2) {
            layerList.push(
              new PathLayer({
                id: `cyclone-track-past-${idx}`,
                data: [{ path: pastPoints.map((p) => [p.lon, p.lat]) }],
                getPath: (d) => d.path,
                getColor: [...rgb, 255],
                getWidth: 4,
                widthUnits: 'pixels',
                capRounded: true,
                jointRounded: true,
              })
            );
          }

          if (futurePoints.length >= 2) {
            layerList.push(
              new PathLayer({
                id: `cyclone-track-future-${idx}`,
                data: [{ path: futurePoints.map((p) => [p.lon, p.lat]) }],
                getPath: (d) => d.path,
                getColor: [...rgb, 120],
                getWidth: 3,
                widthUnits: 'pixels',
                capRounded: true,
                jointRounded: true,
              })
            );
          }

          layerList.push(
            new ScatterplotLayer({
              id: `cyclone-points-${idx}`,
              data: visiblePoints.map((p, i) => ({
                position: [p.lon, p.lat] as [number, number],
                point: p,
                index: i,
                isLast: i === visiblePoints.length - 1,
              })),
              getPosition: (d) => d.position,
              getRadius: (d) => (d.isLast ? 12 : 5 + d.point.category),
              getFillColor: (d) => {
                const cat = d.point.category;
                if (cat >= 4) return [239, 68, 68, 255];
                if (cat >= 3) return [249, 115, 22, 255];
                if (cat >= 1) return [234, 179, 8, 255];
                return [...rgb, 200];
              },
              getLineColor: [255, 255, 255, 220],
              lineWidthUnits: 'pixels',
              getLineWidth: (d) => (d.isLast ? 2 : 1),
              stroked: true,
              radiusUnits: 'pixels',
            })
          );

          const currentPoint = visiblePoints[visiblePoints.length - 1];
          if (currentPoint) {
            layerList.push(
              new ScatterplotLayer({
                id: `cyclone-eye-glow-${idx}`,
                data: [{ position: [currentPoint.lon, currentPoint.lat] }],
                getPosition: (d) => d.position,
                getRadius: 28,
                getFillColor: [...rgb, 50],
                radiusUnits: 'pixels',
              })
            );

            layerList.push(
              new ScatterplotLayer({
                id: `cyclone-eye-${idx}`,
                data: [{ position: [currentPoint.lon, currentPoint.lat] }],
                getPosition: (d) => d.position,
                getRadius: 8,
                getFillColor: [15, 23, 42, 200],
                getLineColor: [...rgb, 255],
                lineWidthUnits: 'pixels',
                getLineWidth: 3,
                stroked: true,
                radiusUnits: 'pixels',
              })
            );

            layerList.push(
              new TextLayer({
                id: `cyclone-time-labels-${idx}`,
                data: visiblePoints.filter((_, i) => i % 2 === 0),
                getPosition: (d) => [d.lon, d.lat] as [number, number],
                getText: (d) => {
                  const hourOffset = visiblePoints.indexOf(d) * 6;
                  return `+${hourOffset}h`;
                },
                getSize: 10,
                getColor: [255, 255, 255, 180],
                getAngle: 0,
                getTextAnchor: 'start',
                getAlignmentBaseline: 'center',
                getPixelOffset: [12, 0],
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
              })
            );
          }
        }

        // Wind field vectors
        if (showUncertaintyCone && windField.length > 0) {
          layerList.push(
            new ScatterplotLayer({
              id: `wind-field-${idx}`,
              data: windField.filter((p) => p.speed > 10),
              getPosition: (d) => [d.lon, d.lat] as [number, number],
              getRadius: (d) => 2 + d.speed / 15,
              getFillColor: (d) => {
                if (d.speed >= 50) return [239, 68, 68, 180];
                if (d.speed >= 35) return [249, 115, 22, 160];
                if (d.speed >= 20) return [234, 179, 8, 140];
                return [168, 85, 247, 120];
              },
              radiusUnits: 'pixels',
              radiusMinPixels: 2,
              radiusMaxPixels: 6,
            })
          );
        }
      });
    }

    // 5. MHW (Marine Heatwave) Blob Layer
    if (activeHazard === 'mhw' && showProbabilityLayer) {
      const mhwEvents = visibleEvents.filter((e) => e.hazardType === 'mhw');
      
      const mhwData = mhwEvents.map((event) => {
        const polygon = getCurrentPolygon(event);
        return {
          event,
          polygon: polygon.geometry.coordinates[0],
          probability: polygon.probability,
        };
      });

      layerList.push(
        new PolygonLayer({
          id: 'mhw-blobs',
          data: mhwData,
          getPolygon: (d) => d.polygon,
          getFillColor: (d) => {
            const t = d.probability;
            const color = interpolateColor([249, 115, 22], [239, 68, 68], t);
            return [...color, 120 + Math.floor(t * 80)];
          },
          getLineColor: [251, 146, 60, 180],
          getLineWidth: 2,
          lineWidthUnits: 'pixels',
          filled: true,
          stroked: true,
          pickable: true,
          onClick: ({ object }) => {
            if (object) {
              selectEvent(object.event.eventId);
            }
          },
        })
      );
    }

    // 6. Rip Current Zone Markers
    if (activeHazard === 'rip_current') {
      const ripEvents = visibleEvents.filter((e) => e.hazardType === 'rip_current');
      
      const markerData = ripEvents.map((event) => {
        const polygon = getCurrentPolygon(event);
        const coords = polygon.geometry.coordinates[0];
        const centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return {
          event,
          position: [centerLon, centerLat] as [number, number],
          probability: polygon.probability,
        };
      });

      layerList.push(
        new ScatterplotLayer({
          id: 'rip-markers',
          data: markerData,
          getPosition: (d) => d.position,
          getRadius: 12,
          getFillColor: (d) => {
            const severity = d.event.severity;
            const config = SEVERITY_CONFIG[severity];
            const rgb = hexToRgb(config.color);
            return [...rgb, 200];
          },
          getLineColor: [255, 255, 255, 200],
          lineWidthUnits: 'pixels',
          getLineWidth: 2,
          stroked: true,
          radiusUnits: 'pixels',
          pickable: true,
          onClick: ({ object }) => {
            if (object) {
              selectEvent(object.event.eventId);
            }
          },
        })
      );

      layerList.push(
        new TextLayer({
          id: 'rip-labels',
          data: markerData,
          getPosition: (d) => d.position,
          getText: (d) => d.event.affectedRegions[0] || 'Rip Zone',
          getSize: 11,
          getColor: [255, 255, 255, 200],
          getAngle: 0,
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'top',
          getPixelOffset: [0, 18],
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
        })
      );
    }

    // 7. Event Labels (for all types)
    const labelData = visibleEvents.map((event) => {
      const polygon = getCurrentPolygon(event);
      const coords = polygon.geometry.coordinates[0];
      const centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
      const centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
      return {
        event,
        position: [centerLon, centerLat] as [number, number],
        label: `${(polygon.probability * 100).toFixed(0)}%`,
      };
    });

    layerList.push(
      new TextLayer({
        id: 'probability-labels',
        data: labelData,
        getPosition: (d) => d.position,
        getText: (d) => d.label,
        getSize: 12,
        getColor: [255, 255, 255, 230],
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        background: true,
        getBackgroundColor: [0, 0, 0, 150],
        backgroundPadding: [4, 2],
      })
    );

    return layerList;
  }, [
    mapLoaded,
    visibleEvents,
    activeHazard,
    selectedEventId,
    currentForecastHour,
    showProbabilityLayer,
    showParticles,
    showUncertaintyCone,
    particles,
    cycloneTracks,
    windField,
    getCurrentPolygon,
    getEventColor,
    selectEvent,
  ]);

  // Update Deck.gl overlay layers
  useEffect(() => {
    if (overlayRef.current && mapLoaded) {
      overlayRef.current.setProps({ layers });
    }
  }, [layers, mapLoaded]);

  // Error state
  if (error) {
    return (
      <div className={`w-full h-full bg-[#0a0a1a] flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <div className="text-red-400 text-lg mb-2">Map Error</div>
          <p className="text-white/50 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 text-sm transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-[#0a0a1a] ${className}`}>
      {/* Map Container - Must have explicit dimensions */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {!mapReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[#0a0a1a] flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border border-white/10" />
                <div 
                  className="absolute inset-1 rounded-full border-2 border-t-transparent border-r-transparent border-b-transparent animate-spin"
                  style={{ borderLeftColor: hazardConfig.accentColor }}
                />
              </div>
              <div className="text-center">
                <p className="text-white/80 font-medium">Loading Hazard Map</p>
                <p className="text-white/40 text-sm">Initializing MapLibre...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 z-20 min-w-[140px]">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          {hazardConfig.name}
        </div>
        <div className="space-y-1.5">
          {visibleEvents.length === 0 ? (
            <div className="text-xs text-white/30">
              {events.length > 0 ? 'No matching severity' : 'No active events'}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})` 
                  }}
                />
                <span className="text-xs text-white/60">
                  {visibleEvents.length} Event{visibleEvents.length !== 1 ? 's' : ''}
                  {severityFilter !== 'all' && (
                    <span className="text-white/40"> ({severityFilter})</span>
                  )}
                </span>
              </div>
              {activeHazard === 'oil_spill' && showParticles && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500/60 animate-pulse" />
                  <span className="text-xs text-white/60">{particles.length} Particles</span>
                </div>
              )}
              {activeHazard === 'cyclone' && cycloneTracks.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-purple-500/40 border border-purple-500/60" />
                    <span className="text-xs text-white/60">Uncertainty Cone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-purple-400" />
                    <span className="text-xs text-white/60">Track Path</span>
                  </div>
                  <div className="pt-1 border-t border-white/10 mt-1">
                    <div className="text-[9px] text-white/40 mb-1">Category</div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" title="Cat 1-2" />
                      <div className="w-2 h-2 rounded-full bg-orange-500" title="Cat 3" />
                      <div className="w-2 h-2 rounded-full bg-red-500" title="Cat 4-5" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hazard Type Indicator - Top Center */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 glass-panel rounded-xl px-4 py-2 z-20"
        style={{ borderBottom: `3px solid ${hazardConfig.accentColor}` }}
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
              {activeHazard === 'oil_spill' ? '💧' : 
               activeHazard === 'hab' ? '🧪' :
               activeHazard === 'cyclone' ? '🌀' :
               activeHazard === 'mhw' ? '🌡️' : '🌊'}
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

      {/* Map Controls - Bottom Right */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button 
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomIn();
            }
          }}
          className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button 
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.zoomOut();
            }
          }}
          className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <div className="h-px bg-white/10 my-1" />
        <button 
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [85.0, 15.0],
                zoom: 5,
                duration: 1000,
              });
            }
          }}
          className="glass-panel w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset View"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
