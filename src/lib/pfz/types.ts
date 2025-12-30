/**
 * ============================================
 * PFZ Domain Types
 * Potential Fishing Zone Forecasting System
 * ============================================
 */

// ─────────────────────────────────────────────────────────────
// Species & Ecological Types
// ─────────────────────────────────────────────────────────────

export type SpeciesId = 'indian_mackerel' | 'oil_sardine' | 'yellowfin_tuna' | 'skipjack_tuna' | 'threadfin_bream';

export interface SpeciesProfile {
  id: SpeciesId;
  name: string;
  scientificName: string;
  icon: string; // emoji or icon path
  color: string; // primary color for visualization
  
  // Habitat preferences (optimal ranges)
  preferences: {
    sst: { min: number; max: number; optimal: number }; // Sea Surface Temperature (°C)
    chlorophyll: { min: number; max: number; optimal: number }; // mg/m³
    depth: { min: number; max: number; optimal: number }; // meters
    dissolvedOxygen: { min: number; max: number; optimal: number }; // mg/L
    salinity?: { min: number; max: number; optimal: number }; // PSU
  };
  
  // Factor weights for HSI calculation (must sum to 1.0)
  weights: {
    sst: number;
    chlorophyll: number;
    depth: number;
    dissolvedOxygen: number;
    salinity?: number;
  };
  
  // Seasonal patterns
  peakSeasons: number[]; // months (1-12)
  migrationPatterns?: string;
  
  // Economic importance
  economicValue: 'high' | 'medium' | 'low';
  targetFishery: string[];
}

// ─────────────────────────────────────────────────────────────
// Ocean Data Types
// ─────────────────────────────────────────────────────────────

export interface OceanDataPoint {
  lat: number;
  lon: number;
  depth: number; // bathymetry (meters, positive downward)
  sst: number; // Sea Surface Temperature (°C)
  chlorophyll: number; // Chlorophyll-a (mg/m³)
  dissolvedOxygen: number; // DO (mg/L)
  salinity: number; // PSU
  currentU: number; // east-west current (m/s)
  currentV: number; // north-south current (m/s)
  timestamp: Date;
}

export interface OceanDataGrid {
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  resolution: number; // degrees
  cells: OceanDataPoint[];
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────
// HSI (Habitat Suitability Index) Types
// ─────────────────────────────────────────────────────────────

export interface HSIFactorScore {
  factor: keyof SpeciesProfile['weights'];
  value: number; // actual environmental value
  suitability: number; // 0-1 score
  weight: number;
  contribution: number; // weight * suitability
}

export interface HSIResult {
  lat: number;
  lon: number;
  species: SpeciesId;
  totalHSI: number; // 0-1 composite score
  factors: HSIFactorScore[];
  confidence: number; // 0-1 data confidence
  timestamp: Date;
}

export interface HSIGrid {
  species: SpeciesId;
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  resolution: number;
  cells: HSIResult[];
  generatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// PFZ Output Types
// ─────────────────────────────────────────────────────────────

export type PFZPotential = 'high' | 'medium' | 'low';

export interface PFZPolygon {
  id: string;
  species: SpeciesId[];
  dominantSpecies: SpeciesId;
  geometry: {
    type: 'Polygon';
    coordinates: [number, number][][]; // GeoJSON format
  };
  centroid: { lat: number; lon: number };
  areaKm2: number;
  meanDepth: number;
  
  // Scores
  meanHSI: number;
  maxHSI: number;
  potential: PFZPotential;
  confidence: number;
  
  // Advisory metadata
  distanceToShoreKm: number;
  nearestPort?: string;
  estimatedTravelTime?: number; // hours
  
  // Environmental summary
  environmental: {
    meanSST: number;
    meanChlorophyll: number;
    meanDO: number;
  };
  
  timestamp: Date;
}

export interface PFZForecast {
  date: Date;
  species: SpeciesId;
  polygons: PFZPolygon[];
  gridSummary: {
    totalCells: number;
    highPotentialCells: number;
    coverage: number; // percentage
  };
  advisory: string;
  confidence: number;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const SPECIES_PROFILES: Record<SpeciesId, SpeciesProfile> = {
  indian_mackerel: {
    id: 'indian_mackerel',
    name: 'Indian Mackerel',
    scientificName: 'Rastrelliger kanagurta',
    icon: '🐟',
    color: '#3B82F6', // blue
    preferences: {
      sst: { min: 24, max: 31, optimal: 27.5 },
      chlorophyll: { min: 0.3, max: 5.0, optimal: 1.5 },
      depth: { min: 20, max: 80, optimal: 40 },
      dissolvedOxygen: { min: 4, max: 8, optimal: 6 },
    },
    weights: { sst: 0.30, chlorophyll: 0.30, depth: 0.25, dissolvedOxygen: 0.15 },
    peakSeasons: [9, 10, 11, 12, 1, 2], // Sep-Feb
    economicValue: 'high',
    targetFishery: ['Ring seine', 'Gill net', 'Trawl'],
  },
  
  oil_sardine: {
    id: 'oil_sardine',
    name: 'Oil Sardine',
    scientificName: 'Sardinella longiceps',
    icon: '🐠',
    color: '#10B981', // emerald
    preferences: {
      sst: { min: 23, max: 29, optimal: 26.5 },
      chlorophyll: { min: 0.5, max: 8.0, optimal: 3.0 },
      depth: { min: 10, max: 50, optimal: 25 },
      dissolvedOxygen: { min: 4, max: 8, optimal: 5.5 },
    },
    weights: { sst: 0.25, chlorophyll: 0.35, depth: 0.25, dissolvedOxygen: 0.15 },
    peakSeasons: [7, 8, 9, 10], // Jul-Oct (monsoon upwelling)
    economicValue: 'high',
    targetFishery: ['Ring seine', 'Boat seine'],
  },
  
  yellowfin_tuna: {
    id: 'yellowfin_tuna',
    name: 'Yellowfin Tuna',
    scientificName: 'Thunnus albacares',
    icon: '🦈',
    color: '#F59E0B', // amber
    preferences: {
      sst: { min: 20, max: 30, optimal: 25 },
      chlorophyll: { min: 0.05, max: 0.5, optimal: 0.15 },
      depth: { min: 100, max: 1000, optimal: 400 },
      dissolvedOxygen: { min: 3, max: 7, optimal: 5 },
    },
    weights: { sst: 0.35, chlorophyll: 0.15, depth: 0.35, dissolvedOxygen: 0.15 },
    peakSeasons: [1, 2, 3, 4, 10, 11, 12],
    economicValue: 'high',
    targetFishery: ['Longline', 'Purse seine'],
  },
  
  skipjack_tuna: {
    id: 'skipjack_tuna',
    name: 'Skipjack Tuna',
    scientificName: 'Katsuwonus pelamis',
    icon: '🐬',
    color: '#8B5CF6', // purple
    preferences: {
      sst: { min: 22, max: 30, optimal: 27 },
      chlorophyll: { min: 0.1, max: 0.8, optimal: 0.3 },
      depth: { min: 50, max: 500, optimal: 200 },
      dissolvedOxygen: { min: 3.5, max: 7, optimal: 5 },
    },
    weights: { sst: 0.30, chlorophyll: 0.20, depth: 0.30, dissolvedOxygen: 0.20 },
    peakSeasons: [3, 4, 5, 9, 10, 11],
    economicValue: 'medium',
    targetFishery: ['Pole and line', 'Purse seine'],
  },
  
  threadfin_bream: {
    id: 'threadfin_bream',
    name: 'Threadfin Bream',
    scientificName: 'Nemipterus japonicus',
    icon: '🐡',
    color: '#EC4899', // pink
    preferences: {
      sst: { min: 22, max: 28, optimal: 25 },
      chlorophyll: { min: 0.2, max: 2.0, optimal: 0.8 },
      depth: { min: 30, max: 120, optimal: 60 },
      dissolvedOxygen: { min: 3, max: 7, optimal: 5 },
    },
    weights: { sst: 0.20, chlorophyll: 0.25, depth: 0.40, dissolvedOxygen: 0.15 },
    peakSeasons: [10, 11, 12, 1, 2, 3],
    economicValue: 'medium',
    targetFishery: ['Trawl'],
  },
};

export const HSI_THRESHOLDS = {
  high: 0.7,
  medium: 0.5,
  low: 0.3,
} as const;

export const MIN_PFZ_AREA_KM2 = 10;
