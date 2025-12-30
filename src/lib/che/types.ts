/**
 * ============================================
 * Coastal Health Engine (CHE) - Type Definitions
 * Based on SYSTEM_CONTEXT.md specification
 * ============================================
 */

// ============================================
// Section 4: Canonical Spatial & Temporal Grid
// ============================================

/** Standard depth levels in meters */
export const STANDARD_DEPTHS = [0, 2, 5, 10, 20, 30, 50, 100] as const;
export type StandardDepth = typeof STANDARD_DEPTHS[number];

/** Critical dissolved oxygen threshold (mg/L) */
export const DO_CRIT = 2.0;

/** Risk classification thresholds */
export const RISK_THRESHOLDS = {
  SAFE: 0.3,
  WARNING: 0.6,
} as const;

export type RiskLevel = 'safe' | 'warning' | 'high';

/** 4D Grid Point */
export interface GridPoint4D {
  lat: number;
  lon: number;
  depth: StandardDepth;
  time: Date;
}

/** Coordinate pair */
export interface Coordinate {
  lat: number;
  lon: number;
}

// ============================================
// Section 5: Core Data Products
// ============================================

/** 5.1 & 5.2: Biogeochemical Profile at a single depth */
export interface BioGeoChemicalProfile {
  /** Dissolved Oxygen (mg/L) */
  DO: number;
  /** Nitrate (μmol/L) */
  NO3: number;
  /** Phosphate (μmol/L) */
  PO4: number;
  /** Chlorophyll-a (μg/L) */
  Chl: number;
  /** Turbidity (NTU) */
  Turbidity: number;
  /** Colored Dissolved Organic Matter (m⁻¹) */
  CDOM: number;
}

/** 5.3: Physical Context */
export interface PhysicalContext {
  /** Sea Surface Temperature (°C) */
  SST: number;
  /** Mixed Layer Depth (m) */
  MLD: number;
  /** Stratification index (kg/m³) - density difference */
  S_strat: number;
  /** Bathymetry - total water depth (m) */
  bathymetry: number;
  /** Distance to coast (km) */
  distanceToCoast: number;
}

/** Vertical DO Profile - array of DO values at each standard depth */
export interface VerticalDOProfile {
  depths: StandardDepth[];
  DO_values: number[];
}

// ============================================
// Section 7: Hypoxia Indicators
// ============================================

export interface HypoxiaIndicators {
  /** Binary hypoxia indicator at each depth: H(z) = 1 if DO ≤ DO_crit */
  H: boolean[];
  /** Hypoxic Fraction: f_hyp = (1/Nz) * Σ H(z_k) */
  f_hyp: number;
  /** Depth Penetration: D_depth = (z_max - z_top) / (z_max - z_min) */
  D_depth: number;
  /** Top of hypoxic layer (m), null if no hypoxia */
  z_top: number | null;
  /** Persistence indicator (simplified) */
  P: number;
}

// ============================================
// Section 8-10: Derived Indices
// ============================================

export interface DerivedIndices {
  /** Dead Zone Risk Index (0-1) - Section 8 */
  DZRI: number;
  /** Pollution-Eutrophication Index (0-1) - Section 9 */
  PEI: number;
  /** Oxygen Resilience Score (0-1) - Section 10 */
  ORS: number;
  /** Risk classification */
  riskLevel: RiskLevel;
}

/** PEI Component values (normalized 0-1) */
export interface PEIComponents {
  NO3_norm: number;
  PO4_norm: number;
  Turbidity_norm: number;
  CDOM_norm: number;
  Chl_norm: number;
}

// ============================================
// Complete Location Analysis
// ============================================

export interface LocationAnalysis {
  /** Location identifier */
  id: string;
  /** Grid point */
  location: Coordinate;
  /** Timestamp */
  time: Date;
  /** Vertical DO profile */
  doProfile: VerticalDOProfile;
  /** Surface biogeochemical data */
  surfaceBGC: BioGeoChemicalProfile;
  /** Physical context */
  physical: PhysicalContext;
  /** Hypoxia indicators */
  hypoxia: HypoxiaIndicators;
  /** Derived risk indices */
  indices: DerivedIndices;
  /** PEI components for radar chart */
  peiComponents: PEIComponents;
  /** Recovery time estimate (days) */
  T_rec: number;
}

// ============================================
// Grid Data for Map Visualization
// ============================================

export interface GridCell {
  lat: number;
  lon: number;
  DZRI: number;
  PEI: number;
  ORS: number;
  riskLevel: RiskLevel;
  /** DO value at selected depth */
  DO_atDepth: number;
}

export interface SimulationGrid {
  cells: GridCell[];
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  timestamp: Date;
  selectedDepth: StandardDepth;
}

// ============================================
// DZRI/PEI Model Weights (Section 8-9)
// ============================================

export const DZRI_WEIGHTS = {
  w1: 2, // f_hyp weight
  w2: 1, // D_depth weight
  w3: 1, // P (persistence) weight
  w4: 1, // S_strat weight
  b: -2, // bias
} as const;

export const PEI_WEIGHTS = {
  alpha1: 0.25, // NO3
  alpha2: 0.20, // PO4
  alpha3: 0.20, // Turbidity
  alpha4: 0.15, // CDOM
  alpha5: 0.20, // Chl
  c: -0.5,      // bias
} as const;

/** ORS tau parameter (days) */
export const ORS_TAU = 10;

// ============================================
// Normalization Ranges (for PEI calculation)
// ============================================

export const NORMALIZATION_RANGES = {
  NO3: { min: 0, max: 50 },      // μmol/L
  PO4: { min: 0, max: 3 },       // μmol/L
  Turbidity: { min: 0, max: 20 }, // NTU
  CDOM: { min: 0, max: 2 },      // m⁻¹
  Chl: { min: 0, max: 30 },      // μg/L
} as const;

// ============================================
// Active Layer Types
// ============================================

export type ActiveLayer = 'DZRI' | 'PEI' | 'ORS';

export type LayerColorScale = {
  [key in ActiveLayer]: {
    colors: string[];
    domain: [number, number];
  };
};

export const LAYER_COLOR_SCALES: LayerColorScale = {
  DZRI: {
    colors: ['#22c55e', '#eab308', '#ef4444'], // green -> yellow -> red
    domain: [0, 1],
  },
  PEI: {
    colors: ['#3b82f6', '#8b5cf6', '#ec4899'], // blue -> violet -> pink
    domain: [0, 1],
  },
  ORS: {
    colors: ['#ef4444', '#eab308', '#22c55e'], // red -> yellow -> green (inverted)
    domain: [0, 1],
  },
};
