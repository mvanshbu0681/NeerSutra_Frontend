/**
 * NeerSutra Type Definitions
 * Aligned with SYSTEM_CONTEXT.md canonical schemas
 */

// ============================================
// AIS Data Types
// ============================================
export interface AISData {
  timestamp: string; // ISO 8601
  MMSI: number;
  latitude: number;
  longitude: number;
  SOG: number; // Speed Over Ground (knots)
  COG: number; // Course Over Ground (degrees)
  shipType: 'Cargo' | 'Tanker' | 'Container' | 'Passenger' | 'Fishing' | 'Other';
  length: number; // meters
  beam: number; // meters
  draft: number; // meters
  heading: number; // degrees
  timestamp_received: string;
}

// ============================================
// Vessel Specification Types
// ============================================
export interface SFOCPoint {
  power: number; // kW
  sfoc: number; // g/kWh
}

export interface EngineSpecs {
  maxPower: number; // kW
  SFOC_curve: [number, number][]; // [[power, sfoc], ...]
}

export interface VesselSpec {
  vesselID: string;
  name: string;
  length: number; // meters
  beam: number; // meters
  draft: number; // meters
  displacement: number; // tonnes
  maxSpeed: number; // knots
  wettedSurface: number; // m²
  formFactor: number; // k factor (typically 1.0-1.2)
  engineSpecs: EngineSpecs;
}

// ============================================
// Weather & Ocean Types
// ============================================
export interface WindData {
  lat: number;
  lon: number;
  speed: number; // m/s
  direction: number; // degrees (from)
}

export interface WaveData {
  lat: number;
  lon: number;
  height: number; // meters (Hs - significant wave height)
  period: number; // seconds
  direction: number; // degrees
}

export interface CurrentData {
  lat: number;
  lon: number;
  u: number; // eastward velocity (m/s)
  v: number; // northward velocity (m/s)
}

export interface WeatherTileBounds {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export interface WeatherTile {
  tileID: string;
  time: string; // ISO 8601
  bounds: WeatherTileBounds;
  gridResolution: number; // degrees
  wind: WindData[];
  waves: WaveData[];
  currents: CurrentData[];
}

// ============================================
// Route Types
// ============================================
export interface Waypoint {
  lat: number;
  lon: number;
  time: string; // ISO 8601
  speed: number; // knots
  ETA: string; // ISO 8601
}

export interface Route {
  routeID: string;
  waypoints: Waypoint[];
  totalDistance: number; // nautical miles
  totalFuel: number; // tonnes
  totalCO2: number; // tonnes
  arrivalTime: string; // ISO 8601
  routeCost: number; // composite cost from J = αFuel + βCO₂ + γTime + δRisk + εCongestion
}

// ============================================
// Risk & Congestion Types
// ============================================
export interface RiskScore {
  segment: number;
  weatherRisk: number; // 0-1
  depthRisk: number; // 0-1
  incidentRisk: number; // 0-1
  anomalyRisk: number; // 0-1
  totalRisk: number; // 0-1
}

export interface CongestionForecast {
  portID: string;
  timestamp: string;
  queueLength: number; // number of vessels
  estimatedWaitTime: number; // hours
  congestionLevel: 'low' | 'moderate' | 'high' | 'critical';
}

// ============================================
// UI State Types
// ============================================
export interface TimeState {
  currentTime: Date;
  playbackSpeed: number; // 1 = real-time, 60 = 1 minute per second
  isPlaying: boolean;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface RouteState {
  selectedRoute: Route | null;
  alternativeRoutes: Route[];
  isComputing: boolean;
  optimizationWeights: {
    alpha: number; // Fuel weight
    beta: number; // CO2 weight
    gamma: number; // Time weight
    delta: number; // Risk weight
    epsilon: number; // Congestion weight
  };
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

// ============================================
// Layer Configuration Types
// ============================================
export interface LayerVisibility {
  aisTraffic: boolean;
  weatherWind: boolean;
  weatherWaves: boolean;
  weatherCurrents: boolean;
  routes: boolean;
  congestion: boolean;
  bathymetry: boolean;
}

// ============================================
// Constants from SYSTEM_CONTEXT.md
// ============================================
export const CO2_FACTOR = 3.17; // kg CO₂ per kg fuel
export const WATER_DENSITY = 1025; // kg/m³ (seawater)
export const WATER_KINEMATIC_VISCOSITY = 1.19e-6; // m²/s at ~15°C
