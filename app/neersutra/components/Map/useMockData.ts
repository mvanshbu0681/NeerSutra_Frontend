'use client';

import { useMemo } from 'react';
import type { AISData, WeatherTile, Route } from '../../types';
import { useTimeStore } from '../../store';

/**
 * Mock data generators for development
 * Replace with actual API calls in production
 */

// Generate mock AIS data around Indian Ocean
export function useMockAISData(count: number = 50): AISData[] {
  return useMemo(() => {
    const ships: AISData[] = [];
    const shipTypes: AISData['shipType'][] = [
      'Cargo', 'Tanker', 'Container', 'Passenger', 'Fishing', 'Other'
    ];
    
    // Indian Ocean shipping lanes
    const lanes = [
      { lat: [8, 15], lon: [72, 85] },    // Mumbai to Singapore
      { lat: [5, 12], lon: [55, 75] },    // Arabian Sea
      { lat: [-5, 5], lon: [75, 95] },    // Equatorial route
      { lat: [20, 25], lon: [65, 72] },   // Gujarat coast
    ];

    for (let i = 0; i < count; i++) {
      const lane = lanes[i % lanes.length];
      const lat = lane.lat[0] + Math.random() * (lane.lat[1] - lane.lat[0]);
      const lon = lane.lon[0] + Math.random() * (lane.lon[1] - lane.lon[0]);
      
      ships.push({
        timestamp: new Date().toISOString(),
        MMSI: 200000000 + i,
        latitude: lat,
        longitude: lon,
        SOG: 10 + Math.random() * 10,
        COG: Math.random() * 360,
        shipType: shipTypes[Math.floor(Math.random() * shipTypes.length)],
        length: 100 + Math.random() * 200,
        beam: 20 + Math.random() * 30,
        draft: 5 + Math.random() * 10,
        heading: Math.random() * 360,
        timestamp_received: new Date().toISOString(),
      });
    }
    
    return ships;
  }, [count]);
}

// Generate mock weather tile
export function useMockWeatherTile(): WeatherTile {
  const { currentTime } = useTimeStore();
  
  return useMemo(() => {
    const wind = [];
    const waves = [];
    const currents = [];
    
    // Generate grid data
    for (let lat = 0; lat <= 25; lat += 2) {
      for (let lon = 55; lon <= 95; lon += 2) {
        wind.push({
          lat,
          lon,
          speed: 5 + Math.random() * 15,
          direction: Math.random() * 360,
        });
        
        waves.push({
          lat,
          lon,
          height: 0.5 + Math.random() * 3,
          period: 5 + Math.random() * 10,
          direction: Math.random() * 360,
        });
        
        currents.push({
          lat,
          lon,
          u: (Math.random() - 0.5) * 2,
          v: (Math.random() - 0.5) * 2,
        });
      }
    }
    
    return {
      tileID: `weather-${currentTime.toISOString()}`,
      time: currentTime.toISOString(),
      bounds: {
        lat_min: 0,
        lat_max: 25,
        lon_min: 55,
        lon_max: 95,
      },
      gridResolution: 2,
      wind,
      waves,
      currents,
    };
  }, [currentTime]);
}

// Generate mock route (Mumbai to Singapore)
export function useMockRoute(): Route {
  return useMemo(() => {
    const waypoints = [
      { lat: 18.94, lon: 72.84, time: '2025-12-20T08:00:00Z', speed: 14, ETA: '2025-12-20T08:00:00Z' },
      { lat: 15.00, lon: 73.50, time: '2025-12-20T18:00:00Z', speed: 14, ETA: '2025-12-20T18:00:00Z' },
      { lat: 10.00, lon: 75.00, time: '2025-12-21T08:00:00Z', speed: 14, ETA: '2025-12-21T08:00:00Z' },
      { lat: 6.00, lon: 78.00, time: '2025-12-21T22:00:00Z', speed: 13, ETA: '2025-12-21T22:00:00Z' },
      { lat: 4.00, lon: 82.00, time: '2025-12-22T10:00:00Z', speed: 13, ETA: '2025-12-22T10:00:00Z' },
      { lat: 2.00, lon: 88.00, time: '2025-12-23T02:00:00Z', speed: 14, ETA: '2025-12-23T02:00:00Z' },
      { lat: 1.26, lon: 103.85, time: '2025-12-24T12:00:00Z', speed: 12, ETA: '2025-12-24T12:00:00Z' },
    ];
    
    return {
      routeID: 'ROUTE_MUMBAI_SINGAPORE_001',
      waypoints,
      totalDistance: 2420,
      totalFuel: 285.5,
      totalCO2: 904.8, // 285.5 * 3.17
      arrivalTime: '2025-12-24T12:00:00Z',
      routeCost: 1.42,
    };
  }, []);
}

// Alternative routes for Pareto comparison
export function useMockAlternativeRoutes(): Route[] {
  return useMemo(() => [
    {
      routeID: 'ROUTE_FAST_001',
      waypoints: [
        { lat: 18.94, lon: 72.84, time: '2025-12-20T08:00:00Z', speed: 18, ETA: '2025-12-20T08:00:00Z' },
        { lat: 1.26, lon: 103.85, time: '2025-12-23T18:00:00Z', speed: 18, ETA: '2025-12-23T18:00:00Z' },
      ],
      totalDistance: 2380,
      totalFuel: 420.0,
      totalCO2: 1331.4,
      arrivalTime: '2025-12-23T18:00:00Z',
      routeCost: 1.85,
    },
    {
      routeID: 'ROUTE_ECO_001',
      waypoints: [
        { lat: 18.94, lon: 72.84, time: '2025-12-20T08:00:00Z', speed: 10, ETA: '2025-12-20T08:00:00Z' },
        { lat: 1.26, lon: 103.85, time: '2025-12-26T06:00:00Z', speed: 10, ETA: '2025-12-26T06:00:00Z' },
      ],
      totalDistance: 2500,
      totalFuel: 180.0,
      totalCO2: 570.6,
      arrivalTime: '2025-12-26T06:00:00Z',
      routeCost: 1.15,
    },
  ], []);
}
