/**
 * ============================================
 * Coastal Health Engine (CHE) - Physics Simulation Engine
 * Implements equations from SYSTEM_CONTEXT.md Sections 6-12
 * ============================================
 */

import {
  STANDARD_DEPTHS,
  StandardDepth,
  DO_CRIT,
  RISK_THRESHOLDS,
  DZRI_WEIGHTS,
  PEI_WEIGHTS,
  ORS_TAU,
  NORMALIZATION_RANGES,
  type Coordinate,
  type BioGeoChemicalProfile,
  type PhysicalContext,
  type VerticalDOProfile,
  type HypoxiaIndicators,
  type DerivedIndices,
  type PEIComponents,
  type LocationAnalysis,
  type GridCell,
  type SimulationGrid,
  type RiskLevel,
} from './types';

// ============================================
// Utility Functions
// ============================================

/** Sigmoid activation function */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Clamp value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Normalize value to [0, 1] range */
function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1);
}

/** Seeded pseudo-random number generator for deterministic simulation */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/** Generate seed from lat/lon/time for deterministic output */
function generateSeed(lat: number, lon: number, time: Date): number {
  const timeComponent = time.getTime() / (1000 * 60 * 60); // hourly granularity
  return Math.floor((lat * 1000 + lon * 100 + timeComponent) * 1000) % 2147483647;
}

/** Classify risk level based on index value */
function classifyRisk(value: number): RiskLevel {
  if (value < RISK_THRESHOLDS.SAFE) return 'safe';
  if (value < RISK_THRESHOLDS.WARNING) return 'warning';
  return 'high';
}

// ============================================
// Section 6: DO Profile Generation (Physics-Guided)
// ============================================

/**
 * Generate a realistic vertical DO profile
 * DO typically decreases with depth, with minimum at oxygen minimum zone
 */
function generateDOProfile(
  lat: number,
  lon: number,
  time: Date,
  physical: PhysicalContext
): VerticalDOProfile {
  const rand = seededRandom(generateSeed(lat, lon, time));
  
  // Base surface DO (depends on SST - colder = more oxygen)
  const surfaceDO = 8.5 - (physical.SST - 20) * 0.15 + (rand() - 0.5) * 0.5;
  
  // Coastal proximity effect (more nutrients = more algae = potential hypoxia)
  const coastalFactor = Math.exp(-physical.distanceToCoast / 50);
  
  // Seasonal variation (simplified - summer has more stratification)
  const month = time.getMonth();
  const seasonalFactor = Math.sin((month - 3) * Math.PI / 6) * 0.3; // peak in summer
  
  // Generate DO at each depth
  const DO_values = STANDARD_DEPTHS.map((depth) => {
    // DO decreases with depth, minimum around 50-100m
    const depthFactor = Math.exp(-depth / 30) + 0.3 * Math.exp(-Math.pow((depth - 60) / 40, 2));
    
    // Apply stratification effect (stronger stratification = lower deep DO)
    const stratEffect = depth > physical.MLD ? physical.S_strat * 0.5 : 0;
    
    // Hypoxia risk increases near coast in summer
    const hypoxiaRisk = coastalFactor * (0.5 + seasonalFactor) * 3;
    
    // Calculate DO with all factors
    let DO = surfaceDO * depthFactor - stratEffect - hypoxiaRisk * (depth / 100);
    
    // Add some noise
    DO += (rand() - 0.5) * 0.3;
    
    // Ensure physical constraints: DO >= 0
    return Math.max(0, DO);
  });
  
  return {
    depths: [...STANDARD_DEPTHS],
    DO_values,
  };
}

// ============================================
// Section 7: Hypoxia Indicators
// ============================================

/**
 * Calculate hypoxia indicators from DO profile
 * Implements equations from Section 7
 */
function calculateHypoxiaIndicators(
  doProfile: VerticalDOProfile,
  stratification: number
): HypoxiaIndicators {
  const { depths, DO_values } = doProfile;
  const Nz = depths.length;
  
  // 7.1: Binary Hypoxia Indicator H(z) = 1 if DO(z) ≤ DO_crit
  const H = DO_values.map(DO => DO <= DO_CRIT);
  
  // 7.2: Hypoxic Fraction f_hyp = (1/Nz) * Σ H(z_k)
  const hypoxicCount = H.filter(Boolean).length;
  const f_hyp = hypoxicCount / Nz;
  
  // 7.3: Depth Penetration
  // z_top = min{z_k : H(z_k) = 1}
  // D_depth = (z_max - z_top) / (z_max - z_min)
  const z_min = depths[0];
  const z_max = depths[depths.length - 1];
  
  let z_top: number | null = null;
  for (let i = 0; i < depths.length; i++) {
    if (H[i]) {
      z_top = depths[i];
      break;
    }
  }
  
  const D_depth = z_top !== null 
    ? (z_max - z_top) / (z_max - z_min)
    : 0;
  
  // 7.4: Persistence (simplified - would need time series in real implementation)
  // For now, use a proxy based on severity
  const P = f_hyp > 0.3 ? 1 : f_hyp > 0 ? 0.5 : 0;
  
  return {
    H,
    f_hyp,
    D_depth,
    z_top,
    P,
  };
}

// ============================================
// Section 8: Dead Zone Risk Index (DZRI)
// ============================================

/**
 * Calculate DZRI using the composite logistic index formula:
 * DZRI = σ(w1*f_hyp + w2*D_depth + w3*P + w4*S_strat + b)
 */
function calculateDZRI(
  hypoxia: HypoxiaIndicators,
  S_strat_normalized: number
): number {
  const { w1, w2, w3, w4, b } = DZRI_WEIGHTS;
  const { f_hyp, D_depth, P } = hypoxia;
  
  // Linear combination
  const z = w1 * f_hyp + w2 * D_depth + w3 * P + w4 * S_strat_normalized + b;
  
  // Apply sigmoid
  return sigmoid(z);
}

// ============================================
// Section 9: Pollution-Eutrophication Index (PEI)
// ============================================

/**
 * Normalize biogeochemical values to [0, 1]
 */
function normalizeBGC(bgc: BioGeoChemicalProfile): PEIComponents {
  const { NO3, PO4, Turbidity, CDOM, Chl } = bgc;
  const ranges = NORMALIZATION_RANGES;
  
  return {
    NO3_norm: normalize(NO3, ranges.NO3.min, ranges.NO3.max),
    PO4_norm: normalize(PO4, ranges.PO4.min, ranges.PO4.max),
    Turbidity_norm: normalize(Turbidity, ranges.Turbidity.min, ranges.Turbidity.max),
    CDOM_norm: normalize(CDOM, ranges.CDOM.min, ranges.CDOM.max),
    Chl_norm: normalize(Chl, ranges.Chl.min, ranges.Chl.max),
  };
}

/**
 * Calculate PEI using the composite formula:
 * PEI = σ(α1*NO3* + α2*PO4* + α3*Turb* + α4*CDOM* + α5*Chl* + c)
 */
function calculatePEI(peiComponents: PEIComponents): number {
  const { alpha1, alpha2, alpha3, alpha4, alpha5, c } = PEI_WEIGHTS;
  const { NO3_norm, PO4_norm, Turbidity_norm, CDOM_norm, Chl_norm } = peiComponents;
  
  // Linear combination (scale up for better sigmoid response)
  const z = (
    alpha1 * NO3_norm +
    alpha2 * PO4_norm +
    alpha3 * Turbidity_norm +
    alpha4 * CDOM_norm +
    alpha5 * Chl_norm
  ) * 4 + c; // Scale factor for better sigmoid spread
  
  return sigmoid(z);
}

// ============================================
// Section 10: Oxygen Resilience Score (ORS)
// ============================================

/**
 * Estimate recovery time based on current conditions
 */
function estimateRecoveryTime(
  dzri: number,
  physical: PhysicalContext
): number {
  // Base recovery time proportional to risk
  let T_rec = dzri * 20; // 0-20 days base
  
  // Stratification slows recovery
  T_rec += physical.S_strat * 5;
  
  // Coastal areas may recover faster (more mixing)
  T_rec *= (1 + physical.distanceToCoast / 200);
  
  return Math.max(0, T_rec);
}

/**
 * Calculate ORS: ORS = exp(-T_rec / τ0)
 */
function calculateORS(T_rec: number): number {
  return Math.exp(-T_rec / ORS_TAU);
}

// ============================================
// Biogeochemical Profile Generation
// ============================================

/**
 * Generate realistic surface biogeochemical data
 */
function generateSurfaceBGC(
  lat: number,
  lon: number,
  time: Date,
  physical: PhysicalContext
): BioGeoChemicalProfile {
  const rand = seededRandom(generateSeed(lat + 0.01, lon + 0.01, time));
  
  // Coastal proximity increases nutrients
  const coastalFactor = Math.exp(-physical.distanceToCoast / 30);
  
  // Generate correlated values (eutrophication tends to affect all together)
  const eutrophicationLevel = coastalFactor * (0.3 + rand() * 0.7);
  
  return {
    DO: 6 + rand() * 2 - eutrophicationLevel * 2,
    NO3: 5 + eutrophicationLevel * 40 + rand() * 5,
    PO4: 0.3 + eutrophicationLevel * 2.5 + rand() * 0.3,
    Chl: 2 + eutrophicationLevel * 25 + rand() * 3,
    Turbidity: 1 + eutrophicationLevel * 15 + rand() * 2,
    CDOM: 0.2 + eutrophicationLevel * 1.5 + rand() * 0.2,
  };
}

/**
 * Generate physical context for a location
 */
function generatePhysicalContext(
  lat: number,
  lon: number,
  time: Date
): PhysicalContext {
  const rand = seededRandom(generateSeed(lat - 0.01, lon - 0.01, time));
  
  // SST varies with latitude and season
  const month = time.getMonth();
  const latitudeFactor = Math.abs(lat) / 90;
  const seasonalSST = Math.sin((month - 1) * Math.PI / 6) * 5;
  const SST = 28 - latitudeFactor * 20 + seasonalSST + (rand() - 0.5) * 2;
  
  // Distance to coast (simplified - would use real bathymetry)
  const distanceToCoast = 10 + rand() * 100;
  
  // Bathymetry
  const bathymetry = 50 + distanceToCoast * 2 + rand() * 100;
  
  // Mixed Layer Depth
  const MLD = 10 + (SST / 30) * 30 + rand() * 10;
  
  // Stratification (higher in summer, warmer waters)
  const S_strat = (SST / 30) * 0.8 + seasonalSST / 10 * 0.2 + rand() * 0.2;
  
  return {
    SST: clamp(SST, 0, 35),
    MLD: clamp(MLD, 5, 100),
    S_strat: clamp(S_strat, 0, 1),
    bathymetry: clamp(bathymetry, 10, 500),
    distanceToCoast: clamp(distanceToCoast, 0, 500),
  };
}

// ============================================
// Main Engine Functions
// ============================================

/**
 * Generate complete location analysis
 */
export function generateLocationAnalysis(
  lat: number,
  lon: number,
  time: Date = new Date()
): LocationAnalysis {
  const id = `loc_${lat.toFixed(4)}_${lon.toFixed(4)}_${time.getTime()}`;
  const location: Coordinate = { lat, lon };
  
  // Generate physical context
  const physical = generatePhysicalContext(lat, lon, time);
  
  // Generate DO profile
  const doProfile = generateDOProfile(lat, lon, time, physical);
  
  // Generate surface BGC
  const surfaceBGC = generateSurfaceBGC(lat, lon, time, physical);
  
  // Calculate hypoxia indicators
  const hypoxia = calculateHypoxiaIndicators(doProfile, physical.S_strat);
  
  // Normalize PEI components
  const peiComponents = normalizeBGC(surfaceBGC);
  
  // Calculate indices
  const DZRI = calculateDZRI(hypoxia, physical.S_strat);
  const PEI = calculatePEI(peiComponents);
  const T_rec = estimateRecoveryTime(DZRI, physical);
  const ORS = calculateORS(T_rec);
  
  const indices: DerivedIndices = {
    DZRI,
    PEI,
    ORS,
    riskLevel: classifyRisk(DZRI),
  };
  
  return {
    id,
    location,
    time,
    doProfile,
    surfaceBGC,
    physical,
    hypoxia,
    indices,
    peiComponents,
    T_rec,
  };
}

/**
 * Generate simulation grid for map visualization
 */
export function generateSimulationGrid(
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  resolution: number = 0.5,
  selectedDepth: StandardDepth = 0,
  time: Date = new Date()
): SimulationGrid {
  const cells: GridCell[] = [];
  
  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += resolution) {
    for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += resolution) {
      const analysis = generateLocationAnalysis(lat, lon, time);
      
      // Get DO at selected depth
      const depthIndex = STANDARD_DEPTHS.indexOf(selectedDepth);
      const DO_atDepth = depthIndex >= 0 
        ? analysis.doProfile.DO_values[depthIndex] 
        : analysis.doProfile.DO_values[0];
      
      cells.push({
        lat,
        lon,
        DZRI: analysis.indices.DZRI,
        PEI: analysis.indices.PEI,
        ORS: analysis.indices.ORS,
        riskLevel: analysis.indices.riskLevel,
        DO_atDepth,
      });
    }
  }
  
  return {
    cells,
    bounds,
    timestamp: time,
    selectedDepth,
  };
}

/**
 * Get DO value at specific depth from profile
 */
export function getDOAtDepth(
  doProfile: VerticalDOProfile,
  targetDepth: number
): number {
  const { depths, DO_values } = doProfile;
  
  // Find surrounding depths for interpolation
  let lowerIdx = 0;
  for (let i = 0; i < depths.length - 1; i++) {
    if (depths[i] <= targetDepth && depths[i + 1] >= targetDepth) {
      lowerIdx = i;
      break;
    }
    if (depths[i] > targetDepth) break;
  }
  
  const upperIdx = Math.min(lowerIdx + 1, depths.length - 1);
  
  if (lowerIdx === upperIdx) return DO_values[lowerIdx];
  
  // Linear interpolation
  const t = (targetDepth - depths[lowerIdx]) / (depths[upperIdx] - depths[lowerIdx]);
  return DO_values[lowerIdx] + t * (DO_values[upperIdx] - DO_values[lowerIdx]);
}

// Export utility functions for testing
export { sigmoid, normalize, classifyRisk };
