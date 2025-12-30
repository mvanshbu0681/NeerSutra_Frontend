/**
 * ============================================
 * PFZ Engine - Habitat Suitability Index
 * Scientific calculations for fishing zone prediction
 * ============================================
 */

import {
  SpeciesId,
  SpeciesProfile,
  OceanDataPoint,
  OceanDataGrid,
  HSIResult,
  HSIGrid,
  HSIFactorScore,
  PFZPolygon,
  PFZForecast,
  SPECIES_PROFILES,
  HSI_THRESHOLDS,
  MIN_PFZ_AREA_KM2,
} from './types';

// ─────────────────────────────────────────────────────────────
// Suitability Functions (Ecological Models)
// ─────────────────────────────────────────────────────────────

/**
 * Gaussian suitability function
 * Returns 1.0 at optimal value, decreasing towards min/max
 */
function gaussianSuitability(
  value: number,
  min: number,
  max: number,
  optimal: number
): number {
  if (value < min || value > max) return 0;
  
  // Calculate sigma based on range
  const sigma = (max - min) / 4; // 95% within range
  const exponent = -Math.pow(value - optimal, 2) / (2 * Math.pow(sigma, 2));
  return Math.exp(exponent);
}

/**
 * Trapezoidal suitability function
 * Returns 1.0 within optimal range, tapers at edges
 */
function trapezoidalSuitability(
  value: number,
  min: number,
  max: number,
  optimal: number
): number {
  if (value < min || value > max) return 0;
  
  const optimalRange = (max - min) * 0.3; // 30% of range is optimal
  const optimalMin = optimal - optimalRange / 2;
  const optimalMax = optimal + optimalRange / 2;
  
  if (value >= optimalMin && value <= optimalMax) return 1.0;
  
  if (value < optimalMin) {
    return (value - min) / (optimalMin - min);
  } else {
    return (max - value) / (max - optimalMax);
  }
}

/**
 * Hard threshold suitability (binary)
 * For critical factors like dissolved oxygen
 */
function thresholdSuitability(value: number, min: number): number {
  if (value < min) return 0;
  if (value < min * 1.5) return 0.5; // marginal
  return 1.0;
}

// ─────────────────────────────────────────────────────────────
// HSI Calculation
// ─────────────────────────────────────────────────────────────

/**
 * Calculate suitability score for a single factor
 */
function calculateFactorSuitability(
  factor: keyof SpeciesProfile['weights'],
  value: number,
  profile: SpeciesProfile
): number {
  const pref = profile.preferences[factor];
  if (!pref) return 0.5; // default if not defined
  
  // Use different functions based on factor
  switch (factor) {
    case 'sst':
      return gaussianSuitability(value, pref.min, pref.max, pref.optimal);
    case 'chlorophyll':
      return trapezoidalSuitability(value, pref.min, pref.max, pref.optimal);
    case 'depth':
      return trapezoidalSuitability(value, pref.min, pref.max, pref.optimal);
    case 'dissolvedOxygen':
      return thresholdSuitability(value, pref.min);
    case 'salinity':
      return gaussianSuitability(value, pref.min, pref.max, pref.optimal);
    default:
      return 0.5;
  }
}

/**
 * Calculate complete HSI for a species at a data point
 */
export function calculateHSI(
  species: SpeciesId,
  dataPoint: OceanDataPoint
): HSIResult {
  const profile = SPECIES_PROFILES[species];
  const factors: HSIFactorScore[] = [];
  let totalHSI = 0;
  
  // Calculate each factor's contribution
  const factorKeys: (keyof SpeciesProfile['weights'])[] = [
    'sst', 'chlorophyll', 'depth', 'dissolvedOxygen'
  ];
  
  for (const factor of factorKeys) {
    const weight = profile.weights[factor] || 0;
    if (weight === 0) continue;
    
    let value: number;
    switch (factor) {
      case 'sst': value = dataPoint.sst; break;
      case 'chlorophyll': value = dataPoint.chlorophyll; break;
      case 'depth': value = dataPoint.depth; break;
      case 'dissolvedOxygen': value = dataPoint.dissolvedOxygen; break;
      default: value = 0;
    }
    
    const suitability = calculateFactorSuitability(factor, value, profile);
    const contribution = weight * suitability;
    
    factors.push({
      factor,
      value,
      suitability,
      weight,
      contribution,
    });
    
    totalHSI += contribution;
  }
  
  // Calculate confidence based on data quality
  const confidence = calculateConfidence(dataPoint);
  
  return {
    lat: dataPoint.lat,
    lon: dataPoint.lon,
    species,
    totalHSI: Math.min(1, Math.max(0, totalHSI)),
    factors,
    confidence,
    timestamp: dataPoint.timestamp,
  };
}

/**
 * Calculate data confidence score
 */
function calculateConfidence(dataPoint: OceanDataPoint): number {
  let confidence = 1.0;
  
  // Reduce confidence for extreme values (likely data errors)
  if (dataPoint.sst < 15 || dataPoint.sst > 35) confidence *= 0.7;
  if (dataPoint.chlorophyll < 0 || dataPoint.chlorophyll > 50) confidence *= 0.7;
  if (dataPoint.dissolvedOxygen < 0 || dataPoint.dissolvedOxygen > 15) confidence *= 0.7;
  
  // Reduce for very shallow or very deep (less satellite coverage)
  if (dataPoint.depth < 10 || dataPoint.depth > 500) confidence *= 0.9;
  
  return Math.max(0.3, confidence);
}

// ─────────────────────────────────────────────────────────────
// Mock Data Generation (Realistic Simulation)
// ─────────────────────────────────────────────────────────────

/**
 * Generate a seeded random number for deterministic results
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Synthetic Hotspots - Guaranteed visible fishing zones
 * These create bright, obvious blobs on the map
 */
const SYNTHETIC_HOTSPOTS = [
  // Off Kerala Coast - Prime mackerel zone
  { lat: 9.5, lon: 75.5, radius: 1.8, intensity: 0.98, name: 'Kerala Coast' },
  // Off Mumbai - Sardine hotspot
  { lat: 18.5, lon: 71.5, radius: 1.5, intensity: 0.95, name: 'Mumbai Offshore' },
  // Off Goa - Mixed fishery
  { lat: 15.2, lon: 72.8, radius: 1.2, intensity: 0.92, name: 'Goa Waters' },
  // Near Sri Lanka - Tuna grounds
  { lat: 8.0, lon: 79.5, radius: 2.0, intensity: 0.96, name: 'Sri Lanka Basin' },
  // Lakshadweep region
  { lat: 11.5, lon: 72.0, radius: 1.4, intensity: 0.88, name: 'Lakshadweep' },
  // Off Visakhapatnam - East coast
  { lat: 17.5, lon: 84.0, radius: 1.6, intensity: 0.90, name: 'Vizag Offshore' },
];

/**
 * Calculate Gaussian blob contribution at a point
 */
function gaussianBlob(
  lat: number,
  lon: number,
  hotspot: typeof SYNTHETIC_HOTSPOTS[0]
): number {
  const dx = lon - hotspot.lon;
  const dy = lat - hotspot.lat;
  const distSq = dx * dx + dy * dy;
  const sigma = hotspot.radius / 2;
  const sigmaSq = sigma * sigma;
  
  // Gaussian falloff
  const gaussian = Math.exp(-distSq / (2 * sigmaSq));
  return gaussian * hotspot.intensity;
}

/**
 * Generate realistic ocean data for a grid cell
 * Now includes synthetic hotspots for guaranteed visibility
 */
function generateMockOceanData(
  lat: number,
  lon: number,
  seed: number
): OceanDataPoint {
  // Base values with spatial variation
  const latFactor = (lat - 8) / 20; // 0-1 from south to north India
  const noise = seededRandom(seed);
  
  // Check if near any hotspot and boost values accordingly
  let hotspotBoost = 0;
  for (const hotspot of SYNTHETIC_HOTSPOTS) {
    hotspotBoost = Math.max(hotspotBoost, gaussianBlob(lat, lon, hotspot));
  }
  
  // SST: warmer in south, cooler in north - hotspots have optimal temps
  const baseSST = 29 - latFactor * 4 + noise * 2;
  // Hotspots push SST towards optimal (26-28°C)
  const optimalSST = 27;
  const sst = baseSST + (optimalSST - baseSST) * hotspotBoost * 0.8;
  
  // Chlorophyll: higher near coast and in hotspots (upwelling/productivity)
  const distToCoast = Math.min(lon - 68, 88 - lon, lat - 6, 24 - lat);
  const baseChlorophyll = 1.5 / (1 + distToCoast * 0.3) + noise * 0.3;
  // Hotspots have high chlorophyll (productive waters)
  const chlorophyll = baseChlorophyll + hotspotBoost * 4;
  
  // Depth: increases offshore, but hotspots are at good fishing depths
  const baseDepth = 30 + distToCoast * 25 + noise * 15;
  // Hotspots are at optimal depths (50-100m)
  const optimalDepth = 75;
  const depth = baseDepth + (optimalDepth - baseDepth) * hotspotBoost * 0.5;
  
  // Dissolved oxygen: higher in hotspots (healthy waters)
  const baseDO = 4.5 + noise * 0.5;
  const dissolvedOxygen = baseDO + hotspotBoost * 2.5;
  
  return {
    lat,
    lon,
    sst: Math.max(20, Math.min(32, sst)),
    chlorophyll: Math.max(0.1, Math.min(12, chlorophyll)),
    depth: Math.max(10, Math.min(400, depth)),
    dissolvedOxygen: Math.max(3, Math.min(9, dissolvedOxygen)),
    salinity: 34 + noise * 2,
    currentU: (noise - 0.5) * 0.5,
    currentV: (seededRandom(seed + 1) - 0.5) * 0.5,
    timestamp: new Date(),
  };
}

/**
 * Generate HSI grid for a species with enhanced resolution
 */
export function generateHSIGrid(
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
  resolution: number,
  species: SpeciesId
): HSIGrid {
  const cells: HSIResult[] = [];
  let seed = 42; // deterministic seed
  
  // Use finer resolution for smoother visualization
  const actualResolution = Math.min(resolution, 0.3);
  
  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += actualResolution) {
    for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += actualResolution) {
      seed++;
      const oceanData = generateMockOceanData(lat, lon, seed);
      const hsiResult = calculateHSI(species, oceanData);
      
      // Apply additional hotspot boost directly to HSI for guaranteed visibility
      let hotspotBoost = 0;
      for (const hotspot of SYNTHETIC_HOTSPOTS) {
        hotspotBoost = Math.max(hotspotBoost, gaussianBlob(lat, lon, hotspot));
      }
      
      // Blend calculated HSI with hotspot boost (hotspots guarantee high scores)
      const boostedHSI = hsiResult.totalHSI * 0.3 + hotspotBoost * 0.7;
      hsiResult.totalHSI = Math.min(1, Math.max(hsiResult.totalHSI, boostedHSI));
      
      cells.push(hsiResult);
    }
  }
  
  return {
    species,
    bounds,
    resolution: actualResolution,
    cells,
    generatedAt: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────
// PFZ Extraction (Grid → Polygons)
// ─────────────────────────────────────────────────────────────

/**
 * Extract PFZ polygons from HSI grid
 * Lowered threshold for better polygon detection
 */
export function extractPFZPolygons(
  grid: HSIGrid,
  threshold: number = 0.65 // Lowered from HSI_THRESHOLDS.high for better detection
): PFZPolygon[] {
  // Filter high-potential cells
  const highCells = grid.cells.filter(c => c.totalHSI >= threshold);
  if (highCells.length === 0) return [];
  
  // Simple clustering: group adjacent cells with larger distance tolerance
  const clusters = clusterCells(highCells, grid.resolution * 2.5);
  
  // Convert clusters to polygons
  const polygons: PFZPolygon[] = clusters.map((cluster, idx) => {
    const lats = cluster.map(c => c.lat);
    const lons = cluster.map(c => c.lon);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Create smoother polygon with padding
    const padding = grid.resolution * 0.5;
    const coordinates: [number, number][][] = [[
      [minLon - padding, minLat - padding],
      [maxLon + padding, minLat - padding],
      [maxLon + padding, maxLat + padding],
      [minLon - padding, maxLat + padding],
      [minLon - padding, minLat - padding],
    ]];
    
    const meanHSI = cluster.reduce((sum, c) => sum + c.totalHSI, 0) / cluster.length;
    const maxHSI = Math.max(...cluster.map(c => c.totalHSI));
    const meanConfidence = cluster.reduce((sum, c) => sum + c.confidence, 0) / cluster.length;
    
    // Calculate area (rough approximation)
    const latDiff = maxLat - minLat;
    const lonDiff = maxLon - minLon;
    const areaKm2 = latDiff * 111 * lonDiff * 111 * Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
    
    return {
      id: `PFZ-${grid.species}-${Date.now()}-${idx}`,
      species: [grid.species],
      dominantSpecies: grid.species,
      geometry: { type: 'Polygon', coordinates },
      centroid: { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 },
      areaKm2,
      meanDepth: 50, // placeholder
      meanHSI,
      maxHSI,
      potential: meanHSI >= 0.8 ? 'high' : meanHSI >= 0.6 ? 'medium' : 'low',
      confidence: meanConfidence,
      distanceToShoreKm: estimateDistanceToShore(minLon),
      nearestPort: getNearestPort((minLat + maxLat) / 2, (minLon + maxLon) / 2),
      environmental: {
        meanSST: 27,
        meanChlorophyll: 2.5,
        meanDO: 5.5,
      },
      timestamp: new Date(),
    };
  });
  
  // Filter by minimum area
  return polygons.filter(p => p.areaKm2 >= MIN_PFZ_AREA_KM2);
}

/**
 * Simple clustering algorithm for adjacent cells
 */
function clusterCells(cells: HSIResult[], maxDistance: number): HSIResult[][] {
  if (cells.length === 0) return [];
  
  const visited = new Set<number>();
  const clusters: HSIResult[][] = [];
  
  function distance(a: HSIResult, b: HSIResult): number {
    return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lon - b.lon, 2));
  }
  
  function expandCluster(cellIdx: number, cluster: HSIResult[]) {
    if (visited.has(cellIdx)) return;
    visited.add(cellIdx);
    cluster.push(cells[cellIdx]);
    
    for (let i = 0; i < cells.length; i++) {
      if (!visited.has(i) && distance(cells[cellIdx], cells[i]) <= maxDistance) {
        expandCluster(i, cluster);
      }
    }
  }
  
  for (let i = 0; i < cells.length; i++) {
    if (!visited.has(i)) {
      const cluster: HSIResult[] = [];
      expandCluster(i, cluster);
      if (cluster.length > 0) clusters.push(cluster);
    }
  }
  
  return clusters;
}

/**
 * Estimate distance to shore (simplified)
 */
function estimateDistanceToShore(lon: number): number {
  // Rough approximation for Indian west coast
  const coastLon = 73; // approximate western coastline
  return Math.abs(lon - coastLon) * 111; // km
}

/**
 * Get nearest port (mock data)
 */
function getNearestPort(lat: number, lon: number): string {
  const ports = [
    { name: 'Mumbai', lat: 18.94, lon: 72.84 },
    { name: 'Kochi', lat: 9.97, lon: 76.27 },
    { name: 'Chennai', lat: 13.08, lon: 80.27 },
    { name: 'Visakhapatnam', lat: 17.69, lon: 83.22 },
    { name: 'Goa', lat: 15.49, lon: 73.83 },
  ];
  
  let nearest = ports[0];
  let minDist = Infinity;
  
  for (const port of ports) {
    const dist = Math.sqrt(Math.pow(lat - port.lat, 2) + Math.pow(lon - port.lon, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = port;
    }
  }
  
  return nearest.name;
}

// ─────────────────────────────────────────────────────────────
// Forecast Generation
// ─────────────────────────────────────────────────────────────

/**
 * Generate a complete PFZ forecast for a species
 */
export function generatePFZForecast(
  species: SpeciesId,
  date: Date = new Date()
): PFZForecast {
  // Default bounds for Indian Ocean (west coast focus)
  const bounds = {
    minLat: 8,
    maxLat: 22,
    minLon: 68,
    maxLon: 88,
  };
  
  const grid = generateHSIGrid(bounds, 0.5, species);
  const polygons = extractPFZPolygons(grid);
  
  const highCells = grid.cells.filter(c => c.totalHSI >= HSI_THRESHOLDS.high);
  
  // Generate advisory text
  const profile = SPECIES_PROFILES[species];
  const advisory = generateAdvisory(species, polygons, profile);
  
  return {
    date,
    species,
    polygons,
    gridSummary: {
      totalCells: grid.cells.length,
      highPotentialCells: highCells.length,
      coverage: (highCells.length / grid.cells.length) * 100,
    },
    advisory,
    confidence: polygons.length > 0 
      ? polygons.reduce((sum, p) => sum + p.confidence, 0) / polygons.length 
      : 0.5,
  };
}

/**
 * Generate human-readable advisory
 */
function generateAdvisory(
  species: SpeciesId,
  polygons: PFZPolygon[],
  profile: SpeciesProfile
): string {
  if (polygons.length === 0) {
    return `No high-potential ${profile.name} zones detected today. Conditions may improve in the coming days.`;
  }
  
  const topZone = polygons.reduce((best, p) => p.meanHSI > best.meanHSI ? p : best);
  const totalArea = polygons.reduce((sum, p) => sum + p.areaKm2, 0);
  
  return `${polygons.length} potential ${profile.name} zone(s) identified, covering approximately ${Math.round(totalArea)} km². Best prospects near ${topZone.nearestPort} (HSI: ${(topZone.meanHSI * 100).toFixed(0)}%). Optimal conditions: SST ${profile.preferences.sst.optimal}°C, Depth ${profile.preferences.depth.optimal}m. Recommended gear: ${profile.targetFishery.join(', ')}.`;
}

/**
 * Get location analysis for a specific point
 */
export function analyzeLocation(
  lat: number,
  lon: number,
  species: SpeciesId
): HSIResult & { recommendation: string } {
  const seed = Math.floor(lat * 1000 + lon * 100);
  const oceanData = generateMockOceanData(lat, lon, seed);
  const hsi = calculateHSI(species, oceanData);
  
  let recommendation: string;
  if (hsi.totalHSI >= 0.8) {
    recommendation = 'Excellent fishing conditions. Strong catch potential.';
  } else if (hsi.totalHSI >= 0.6) {
    recommendation = 'Good conditions. Moderate catch expected.';
  } else if (hsi.totalHSI >= 0.4) {
    recommendation = 'Fair conditions. Consider alternative locations.';
  } else {
    recommendation = 'Poor conditions. Not recommended for fishing.';
  }
  
  return { ...hsi, recommendation };
}
