/**
 * ============================================
 * EWS Map Panel - Hazard Visualization (Deck.gl)
 * IOHD-EWS: Multi-layer hazard rendering
 * ============================================
 */

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer, PolygonLayer, PathLayer, TextLayer, LineLayer } from '@deck.gl/layers';
import { motion, AnimatePresence } from 'framer-motion';
import { useEWSStore, useFilteredEvents } from '../../../../src/store/useEWSStore';
import { 
  generateParticleEnsemble, 
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
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlayRef = useRef<GoogleMapsOverlay | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [cycloneTracks, setCycloneTracks] = useState<CycloneTrack[]>([]);
  const [windField, setWindField] = useState<WindFieldPoint[]>([]);
  const animationRef = useRef<number | null>(null);

  const {
    activeHazard,
    selectedEventId,
    selectEvent,
    currentForecastHour,
    showProbabilityLayer,
    showParticles,
    showUncertaintyCone,
    mapCenter,
    mapZoom,
    setMapView,
  } = useEWSStore();

  const events = useFilteredEvents();
  const hazardConfig = HAZARD_CONFIG[activeHazard];

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
    events.forEach((event) => {
      if (event.hazardType === 'oil_spill') {
        const animatedParticles = generateAnimatedParticles(event, currentForecastHour, animationPhase);
        allParticles.push(...animatedParticles);
      }
    });

    setParticles(allParticles);
  }, [activeHazard, events, currentForecastHour, showParticles, animationPhase]);

  // Particle animation loop
  useEffect(() => {
    if (activeHazard !== 'oil_spill' || !showParticles) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 100) { // Update every 100ms
        setAnimationPhase((prev) => (prev + 0.02) % 1);
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeHazard, showParticles]);

  // Generate cyclone tracks and wind fields
  useEffect(() => {
    if (activeHazard !== 'cyclone') {
      setCycloneTracks([]);
      setWindField([]);
      return;
    }

    const tracks: CycloneTrack[] = [];
    events.forEach((event) => {
      if (event.hazardType === 'cyclone') {
        const track = generateCycloneTrack(event, currentForecastHour);
        if (track) tracks.push(track);
      }
    });

    setCycloneTracks(tracks);

    // Generate wind field for first cyclone
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
  }, [activeHazard, events, currentForecastHour, showUncertaintyCone]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    if (!googleMapsApiKey) {
      setError('Google Maps API key not found');
      return;
    }

    setOptions({
      key: googleMapsApiKey,
      v: 'weekly',
      libraries: ['maps', 'marker'],
    });

    const initMap = async () => {
      try {
        const mapsLibrary = await importLibrary('maps');
        const { Map } = mapsLibrary;

        const map = new Map(mapContainer.current!, {
          center: { lat: viewState.latitude, lng: viewState.longitude },
          zoom: viewState.zoom,
          mapId: 'ews-hazard-map',
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          backgroundColor: '#050510',
          styles: [
            // Dark ocean-focused style
            { elementType: 'geometry', stylers: [{ color: '#0a0a1a' }] },
            { elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
            { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a5568' }] },
            { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
            { featureType: 'road', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d3748', weight: 0.5 }] },
            { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#64748b', visibility: 'simplified' }] },
            { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
          ],
        });

        mapRef.current = map;

        // Initialize Deck.gl overlay
        const overlay = new GoogleMapsOverlay({
          layers: [],
        });
        overlay.setMap(map);
        overlayRef.current = overlay;

        // Add click listener
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            console.log('🗺️ Map clicked:', e.latLng.lat(), e.latLng.lng());
          }
        });

        // Track view state changes
        map.addListener('bounds_changed', () => {
          const center = map.getCenter();
          const zoom = map.getZoom();
          if (center && zoom) {
            setViewState({
              latitude: center.lat(),
              longitude: center.lng(),
              zoom,
              pitch: 0,
              bearing: 0,
            });
          }
        });

        setMapLoaded(true);
        console.log('🗺️ EWS Map initialized');
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Failed to load map');
      }
    };

    initMap();

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
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
      const polygonData = events.map((event) => {
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
        const selectedEvent = events.find((e) => e.eventId === selectedEventId);
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
            // Fade particles by age
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

    // 3. HAB Visualization Layer (using ScatterplotLayer as heatmap alternative)
    if (activeHazard === 'hab' && showProbabilityLayer) {
      const habEvents = events.filter((e) => e.hazardType === 'hab');
      const config = HAZARD_CONFIG.hab;
      
      // Generate scatter points from event polygons to simulate heatmap
      const scatterData: { position: [number, number]; weight: number; event: HazardEvent }[] = [];
      
      habEvents.forEach((event) => {
        const polygon = getCurrentPolygon(event);
        const coords = polygon.geometry.coordinates[0];
        const centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        
        // Add central point with high weight
        scatterData.push({
          position: [centerLon, centerLat],
          weight: polygon.probability,
          event,
        });
        
        // Add edge points
        coords.forEach((coord) => {
          scatterData.push({
            position: [coord[0], coord[1]],
            weight: polygon.probability * 0.5,
            event,
          });
        });
        
        // Add intermediate points for denser visualization
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
        // HAB bloom scatter layer
        layerList.push(
          new ScatterplotLayer({
            id: 'hab-scatter',
            data: scatterData,
            getPosition: (d) => d.position,
            getRadius: (d) => 8 + d.weight * 40,
            getFillColor: (d) => {
              // Green to yellow to red gradient based on intensity
              const t = d.weight;
              if (t < 0.3) return [22, 101, 52, 80];     // Dark green
              if (t < 0.5) return [34, 197, 94, 120];    // Green
              if (t < 0.7) return [134, 239, 172, 160];  // Light green
              if (t < 0.85) return [254, 240, 138, 180]; // Yellow
              return [239, 68, 68, 200];                 // Red (bloom alert)
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
        // Uncertainty cone (rendered first, behind track)
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

        // Get visible track points up to current forecast hour
        const visiblePoints = track.trackPoints.slice(
          0,
          Math.ceil(currentForecastHour / 6) + 1
        );

        if (visiblePoints.length >= 1) {
          // Track path - solid line for past, dashed for future
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

          // Future track (more transparent)
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

          // Track points with category colors
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
                // Category-based coloring
                const cat = d.point.category;
                if (cat >= 4) return [239, 68, 68, 255];  // Cat 4-5: Red
                if (cat >= 3) return [249, 115, 22, 255]; // Cat 3: Orange
                if (cat >= 1) return [234, 179, 8, 255];  // Cat 1-2: Yellow
                return [...rgb, 200]; // Tropical Storm
              },
              getLineColor: [255, 255, 255, 220],
              lineWidthUnits: 'pixels',
              getLineWidth: (d) => (d.isLast ? 2 : 1),
              stroked: true,
              radiusUnits: 'pixels',
            })
          );

          // Current position eye marker (animated glow)
          const currentPoint = visiblePoints[visiblePoints.length - 1];
          if (currentPoint) {
            // Outer glow
            layerList.push(
              new ScatterplotLayer({
                id: `cyclone-eye-glow-${idx}`,
                data: [{ position: [currentPoint.lon, currentPoint.lat] }],
                getPosition: (d) => d.position,
                getRadius: 25 + Math.sin(animationPhase * Math.PI * 2) * 5,
                getFillColor: [...rgb, 50],
                radiusUnits: 'pixels',
              })
            );

            // Inner eye
            layerList.push(
              new ScatterplotLayer({
                id: `cyclone-eye-${idx}`,
                data: [{ position: [currentPoint.lon, currentPoint.lat] }],
                getPosition: (d) => d.position,
                getRadius: 8,
                getFillColor: [15, 23, 42, 200], // Dark center (eye)
                getLineColor: [...rgb, 255],
                lineWidthUnits: 'pixels',
                getLineWidth: 3,
                stroked: true,
                radiusUnits: 'pixels',
              })
            );

            // Time labels on track
            layerList.push(
              new TextLayer({
                id: `cyclone-time-labels-${idx}`,
                data: visiblePoints.filter((_, i) => i % 2 === 0), // Every 12h
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
          // Wind barbs/arrows
          layerList.push(
            new ScatterplotLayer({
              id: `wind-field-${idx}`,
              data: windField.filter((p) => p.speed > 10), // Only show significant winds
              getPosition: (d) => [d.lon, d.lat] as [number, number],
              getRadius: (d) => 2 + d.speed / 15,
              getFillColor: (d) => {
                // Color by wind speed
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
      const mhwEvents = events.filter((e) => e.hazardType === 'mhw');
      
      // Generate gradient fills for MHW blobs
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
            // Orange-red gradient based on intensity
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
      const ripEvents = events.filter((e) => e.hazardType === 'rip_current');
      
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

      // Warning triangles
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

      // Labels
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
    const labelData = events.map((event) => {
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
    events,
    activeHazard,
    selectedEventId,
    currentForecastHour,
    showProbabilityLayer,
    showParticles,
    showUncertaintyCone,
    particles,
    cycloneTracks,
    windField,
    animationPhase,
    getCurrentPolygon,
    getEventColor,
    selectEvent,
  ]);

  // Update Deck.gl overlay layers
  useEffect(() => {
    if (overlayRef.current && layers.length > 0) {
      overlayRef.current.setProps({ layers });
    }
  }, [layers]);

  // Error state
  if (error) {
    return (
      <div className={`w-full h-full bg-[#050510] flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️ {error}</div>
          <p className="text-white/50 text-sm">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050510] flex items-center justify-center z-10"
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
                <p className="text-white/40 text-sm">Initializing layers...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 z-20">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
          {hazardConfig.name}
        </div>
        <div className="space-y-1.5">
          {events.length === 0 ? (
            <div className="text-xs text-white/30">No active events</div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})` 
                  }}
                />
                <span className="text-xs text-white/60">{events.length} Events</span>
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

      {/* Hazard Type Indicator */}
      <div 
        className="absolute top-4 left-4 glass-panel rounded-xl px-4 py-2 z-20"
        style={{ borderLeft: `3px solid ${hazardConfig.accentColor}` }}
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

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button 
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom() || 5;
              mapRef.current.setZoom(currentZoom + 1);
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
              const currentZoom = mapRef.current.getZoom() || 5;
              mapRef.current.setZoom(Math.max(2, currentZoom - 1));
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
              mapRef.current.setCenter({ lat: 15.0, lng: 85.0 });
              mapRef.current.setZoom(5);
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
