/**
 * ============================================
 * IOHD-EWS Mock Data Engine
 * Generates realistic synthetic hazard events for development
 * ============================================
 */

import type {
  HazardType,
  HazardEvent,
  CAPAlert,
  AlertSeverity,
  AlertCertainty,
  AlertUrgency,
  Particle,
  ParticleEnsemble,
  CycloneTrack,
  CycloneTrackPoint,
  HABForecast,
  HABGridCell,
  MHWEvent,
  RipCurrentZone,
  GeoJSONPolygon,
  TimedPolygon,
  Provenance,
  ConfidenceScore,
  ValidationMetrics,
} from './types';
import { HAZARD_CONFIG, SEVERITY_CONFIG } from './types';

// ─────────────────────────────────────────────────────────────
// Random Utilities
// ─────────────────────────────────────────────────────────────

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Bay of Bengal / Indian Ocean bounds
const BOUNDS = {
  minLon: 70,
  maxLon: 100,
  minLat: 0,
  maxLat: 25,
};

// ─────────────────────────────────────────────────────────────
// Provenance Generator
// ─────────────────────────────────────────────────────────────

function generateProvenance(hazardType: HazardType): Provenance {
  const models: Record<string, string> = {
    u10_biascorr_v1: 'a3f2c1d',
    stokes_drift_v2: 'b4e5f6a',
  };

  if (hazardType === 'oil_spill') {
    models.unet_sar_seg_v3 = 'c7d8e9f';
    models.lagrangian_advect_v2 = 'd1e2f3a';
  } else if (hazardType === 'hab') {
    models.xgb_hab_classifier_v4 = 'e4f5a6b';
    models.shap_explainer_v1 = 'f7a8b9c';
  } else if (hazardType === 'cyclone') {
    models.pi_calculator_v2 = 'a1b2c3d';
    models.surge_model_v1 = 'b4c5d6e';
  }

  return {
    models,
    dataTiles: [
      'cmems_phy_2025120912',
      'cmems_bgc_20251209',
      'ecmwf_ens_2025120900',
      'sentinel1_20251209_iw_grd',
    ],
    processingSteps: [
      'ingest_raw',
      'bias_correction',
      'feature_extraction',
      hazardType === 'oil_spill' ? 'sar_segmentation' : 'classification',
      'ensemble_generation',
      'probability_aggregation',
      'validation',
    ],
    configHash: 'sha256:' + Math.random().toString(36).substring(2, 10),
    runId: `prefect-run-${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Confidence Score Generator
// ─────────────────────────────────────────────────────────────

function generateConfidenceScore(): ConfidenceScore {
  const components = {
    detectionCertainty: random(0.6, 0.95),
    ensembleSpread: random(0.5, 0.9),
    dataCoverage: random(0.7, 1.0),
    modelSkill: random(0.65, 0.92),
  };

  const weights = {
    detectionCertainty: 0.3,
    ensembleSpread: 0.25,
    dataCoverage: 0.2,
    modelSkill: 0.25,
  };

  const overall =
    components.detectionCertainty * weights.detectionCertainty +
    components.ensembleSpread * weights.ensembleSpread +
    components.dataCoverage * weights.dataCoverage +
    components.modelSkill * weights.modelSkill;

  return { overall, components, weights };
}

// ─────────────────────────────────────────────────────────────
// Validation Metrics Generator
// ─────────────────────────────────────────────────────────────

function generateValidationMetrics(hazardType: HazardType): ValidationMetrics {
  const base: ValidationMetrics = {
    brierScore: random(0.05, 0.15), // Lower is better
    pod: random(0.7, 0.95),
    far: random(0.05, 0.25),
    hk: random(0.5, 0.85),
  };

  if (hazardType === 'oil_spill') {
    base.iou = random(0.55, 0.75);
  } else if (hazardType === 'hab') {
    base.rocAuc = random(0.85, 0.95);
  } else if (hazardType === 'cyclone') {
    base.rmse = random(20, 60); // km position error
  }

  return base;
}

// ─────────────────────────────────────────────────────────────
// Polygon Generators
// ─────────────────────────────────────────────────────────────

function generateIrregularPolygon(
  centerLon: number,
  centerLat: number,
  radiusDeg: number,
  numPoints: number = 12
): GeoJSONPolygon {
  const coords: number[][] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const r = radiusDeg * (0.6 + Math.random() * 0.8);
    const lon = centerLon + r * Math.cos(angle);
    const lat = centerLat + r * Math.sin(angle) * 0.7; // Latitude scaling
    coords.push([lon, lat]);
  }
  
  // Close the polygon
  coords.push([...coords[0]]);
  
  return {
    type: 'Polygon',
    coordinates: [coords],
  };
}

function advectPolygon(
  polygon: GeoJSONPolygon,
  hours: number,
  uVelocity: number = 0.02,
  vVelocity: number = 0.01
): GeoJSONPolygon {
  const spreadFactor = 1 + hours * 0.01;
  const dLon = uVelocity * hours;
  const dLat = vVelocity * hours;
  
  const newCoords = polygon.coordinates[0].map((coord) => {
    const [lon, lat] = coord;
    const centerLon = polygon.coordinates[0].reduce((s, c) => s + c[0], 0) / polygon.coordinates[0].length;
    const centerLat = polygon.coordinates[0].reduce((s, c) => s + c[1], 0) / polygon.coordinates[0].length;
    
    return [
      centerLon + dLon + (lon - centerLon) * spreadFactor + random(-0.05, 0.05),
      centerLat + dLat + (lat - centerLat) * spreadFactor + random(-0.03, 0.03),
    ];
  });
  
  return {
    type: 'Polygon',
    coordinates: [newCoords],
  };
}

// ─────────────────────────────────────────────────────────────
// Oil Spill Event Generator
// ─────────────────────────────────────────────────────────────

function generateOilSpillEvent(index: number): HazardEvent {
  const centerLon = random(BOUNDS.minLon + 5, BOUNDS.maxLon - 5);
  const centerLat = random(BOUNDS.minLat + 3, BOUNDS.maxLat - 3);
  const seedPolygon = generateIrregularPolygon(centerLon, centerLat, random(0.3, 0.8), 10);
  
  // Generate forecast polygons at 3-hourly intervals
  const polygons: TimedPolygon[] = [];
  const now = new Date();
  
  for (let hour = 0; hour <= 72; hour += 3) {
    const forecastTime = new Date(now.getTime() + hour * 3600000);
    const advectedPolygon = advectPolygon(seedPolygon, hour);
    
    polygons.push({
      time: forecastTime.toISOString(),
      geometry: advectedPolygon,
      probability: Math.max(0.1, 0.95 - hour * 0.01 + random(-0.05, 0.05)),
    });
  }

  const severities: AlertSeverity[] = ['extreme', 'severe', 'moderate', 'minor'];
  const severity = randomChoice(severities);

  return {
    eventId: `iohd-${now.toISOString().slice(0, 10).replace(/-/g, '')}-oil-${String(index).padStart(4, '0')}`,
    hazardType: 'oil_spill',
    detectionTime: now.toISOString(),
    source: `sentinel1_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${randomChoice(['asc', 'desc'])}_${randomInt(1, 99)}`,
    seedPolygon,
    probabilityTiles: [
      `s3://iohd-tiles/oil/${now.toISOString().slice(0, 10)}/prob_t0.tif`,
      `s3://iohd-tiles/oil/${now.toISOString().slice(0, 10)}/prob_t24.tif`,
      `s3://iohd-tiles/oil/${now.toISOString().slice(0, 10)}/prob_t48.tif`,
    ],
    polygons,
    confidenceScore: generateConfidenceScore(),
    provenance: generateProvenance('oil_spill'),
    validationMetrics: generateValidationMetrics('oil_spill'),
    severity,
    certainty: 'likely',
    urgency: severity === 'extreme' ? 'immediate' : 'expected',
    headline: `Oil Spill Detected - ${centerLat.toFixed(1)}°N, ${centerLon.toFixed(1)}°E`,
    description: `Satellite-detected oil slick approximately ${randomInt(5, 50)} km² in area. Lagrangian ensemble forecast indicates ${polygons.length} hour trajectory.`,
    areaDescription: `Bay of Bengal, approximately ${randomInt(50, 200)} km offshore`,
    affectedRegions: randomChoice([
      ['Odisha Coast', 'Andhra Pradesh'],
      ['Tamil Nadu', 'Puducherry'],
      ['West Bengal', 'Bangladesh'],
      ['Sri Lanka Northern Coast'],
    ]),
    expiresAt: new Date(now.getTime() + 72 * 3600000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// HAB Event Generator
// ─────────────────────────────────────────────────────────────

function generateHABEvent(index: number): HazardEvent {
  const centerLon = random(BOUNDS.minLon + 3, BOUNDS.maxLon - 3);
  const centerLat = random(BOUNDS.minLat + 2, BOUNDS.maxLat - 2);
  const polygon = generateIrregularPolygon(centerLon, centerLat, random(0.5, 1.5), 8);
  
  const now = new Date();
  const polygons: TimedPolygon[] = [];
  
  for (let hour = 0; hour <= 48; hour += 6) {
    const forecastTime = new Date(now.getTime() + hour * 3600000);
    polygons.push({
      time: forecastTime.toISOString(),
      geometry: advectPolygon(polygon, hour, 0.005, 0.003),
      probability: random(0.6, 0.95),
    });
  }

  const severities: AlertSeverity[] = ['severe', 'moderate', 'minor'];
  const severity = randomChoice(severities);

  return {
    eventId: `iohd-${now.toISOString().slice(0, 10).replace(/-/g, '')}-hab-${String(index).padStart(4, '0')}`,
    hazardType: 'hab',
    detectionTime: now.toISOString(),
    source: 'cmems_bgc_daily_chl_anomaly',
    seedPolygon: polygon,
    probabilityTiles: [`s3://iohd-tiles/hab/${now.toISOString().slice(0, 10)}/prob.tif`],
    polygons,
    confidenceScore: generateConfidenceScore(),
    provenance: generateProvenance('hab'),
    validationMetrics: generateValidationMetrics('hab'),
    severity,
    certainty: 'possible',
    urgency: 'expected',
    headline: `Harmful Algal Bloom Detected`,
    description: `Elevated chlorophyll-a concentrations detected via satellite. XGBoost model indicates ${(random(0.7, 0.95) * 100).toFixed(0)}% HAB probability.`,
    areaDescription: `Coastal waters near ${centerLat.toFixed(1)}°N, ${centerLon.toFixed(1)}°E`,
    affectedRegions: randomChoice([
      ['Kerala Coast'],
      ['Karnataka Coast'],
      ['Goa'],
      ['Maharashtra Coast'],
    ]),
    expiresAt: new Date(now.getTime() + 48 * 3600000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Cyclone Event Generator
// ─────────────────────────────────────────────────────────────

function generateCycloneEvent(index: number): HazardEvent {
  const startLon = random(85, 95);
  const startLat = random(8, 14);
  
  const now = new Date();
  const polygons: TimedPolygon[] = [];
  
  // Generate track as expanding uncertainty cone
  for (let hour = 0; hour <= 120; hour += 6) {
    const forecastTime = new Date(now.getTime() + hour * 3600000);
    const trackLon = startLon + hour * 0.02 * (Math.random() > 0.5 ? -1 : 1);
    const trackLat = startLat + hour * 0.03;
    const coneRadius = 0.3 + hour * 0.02;
    
    polygons.push({
      time: forecastTime.toISOString(),
      geometry: generateIrregularPolygon(trackLon, trackLat, coneRadius, 16),
      probability: Math.max(0.3, 0.95 - hour * 0.005),
    });
  }

  const category = randomInt(1, 5);
  const severity: AlertSeverity = category >= 4 ? 'extreme' : category >= 3 ? 'severe' : 'moderate';
  const cycloneName = randomChoice(['DANA', 'REMAL', 'MICHAUNG', 'BIPARJOY', 'MOCHA']);

  return {
    eventId: `iohd-${now.toISOString().slice(0, 10).replace(/-/g, '')}-cyc-${String(index).padStart(4, '0')}`,
    hazardType: 'cyclone',
    detectionTime: now.toISOString(),
    source: 'imd_jtwc_combined',
    seedPolygon: polygons[0].geometry,
    probabilityTiles: [`s3://iohd-tiles/cyclone/${cycloneName.toLowerCase()}/track.tif`],
    polygons,
    confidenceScore: generateConfidenceScore(),
    provenance: generateProvenance('cyclone'),
    validationMetrics: generateValidationMetrics('cyclone'),
    severity,
    certainty: 'likely',
    urgency: 'immediate',
    headline: `Tropical Cyclone ${cycloneName} - Category ${category}`,
    description: `${cycloneName} currently at ${startLat.toFixed(1)}°N, ${startLon.toFixed(1)}°E with max sustained winds of ${80 + category * 20} km/h. Expected to intensify.`,
    areaDescription: `Bay of Bengal, tracking ${Math.random() > 0.5 ? 'northwest' : 'northeast'}`,
    affectedRegions: ['Odisha', 'West Bengal', 'Andhra Pradesh', 'Bangladesh'],
    expiresAt: new Date(now.getTime() + 120 * 3600000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// MHW Event Generator
// ─────────────────────────────────────────────────────────────

function generateMHWEvent(index: number): HazardEvent {
  const centerLon = random(BOUNDS.minLon + 5, BOUNDS.maxLon - 5);
  const centerLat = random(BOUNDS.minLat + 5, BOUNDS.maxLat - 5);
  const polygon = generateIrregularPolygon(centerLon, centerLat, random(2, 5), 12);
  
  const now = new Date();
  const daysActive = randomInt(5, 30);
  const maxAnomaly = random(2, 5);
  const category = maxAnomaly > 4 ? 4 : maxAnomaly > 3 ? 3 : maxAnomaly > 2 ? 2 : 1;
  const severity: AlertSeverity = category >= 3 ? 'severe' : category >= 2 ? 'moderate' : 'minor';

  return {
    eventId: `iohd-${now.toISOString().slice(0, 10).replace(/-/g, '')}-mhw-${String(index).padStart(4, '0')}`,
    hazardType: 'mhw',
    detectionTime: new Date(now.getTime() - daysActive * 86400000).toISOString(),
    source: 'ostia_sst_daily',
    seedPolygon: polygon,
    probabilityTiles: [`s3://iohd-tiles/mhw/${now.toISOString().slice(0, 10)}/anomaly.tif`],
    polygons: [{ time: now.toISOString(), geometry: polygon, probability: 1.0 }],
    confidenceScore: generateConfidenceScore(),
    provenance: generateProvenance('mhw'),
    validationMetrics: generateValidationMetrics('mhw'),
    severity,
    certainty: 'observed',
    urgency: 'expected',
    headline: `Marine Heatwave Category ${category} - Day ${daysActive}`,
    description: `SST anomaly of +${maxAnomaly.toFixed(1)}°C above 90th percentile climatology. Active for ${daysActive} days.`,
    areaDescription: `Open ocean region centered at ${centerLat.toFixed(1)}°N, ${centerLon.toFixed(1)}°E`,
    affectedRegions: ['Central Bay of Bengal', 'Arabian Sea'],
    expiresAt: new Date(now.getTime() + 168 * 3600000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Rip Current Event Generator
// ─────────────────────────────────────────────────────────────

function generateRipCurrentEvent(index: number): HazardEvent {
  const beaches = [
    { name: 'Marina Beach', lon: 80.28, lat: 13.05 },
    { name: 'Puri Beach', lon: 85.83, lat: 19.80 },
    { name: 'Kovalam Beach', lon: 77.00, lat: 8.40 },
    { name: 'Digha Beach', lon: 87.55, lat: 21.63 },
  ];
  
  const beach = randomChoice(beaches);
  const polygon = generateIrregularPolygon(beach.lon, beach.lat, 0.05, 6);
  
  const now = new Date();
  const riskLevels: AlertSeverity[] = ['extreme', 'severe', 'moderate', 'minor'];
  const severity = randomChoice(riskLevels);

  return {
    eventId: `iohd-${now.toISOString().slice(0, 10).replace(/-/g, '')}-rip-${String(index).padStart(4, '0')}`,
    hazardType: 'rip_current',
    detectionTime: now.toISOString(),
    source: 'wave_model_iribarren',
    seedPolygon: polygon,
    probabilityTiles: [],
    polygons: [{ time: now.toISOString(), geometry: polygon, probability: random(0.6, 0.95) }],
    confidenceScore: generateConfidenceScore(),
    provenance: generateProvenance('rip_current'),
    validationMetrics: generateValidationMetrics('rip_current'),
    severity,
    certainty: 'likely',
    urgency: severity === 'extreme' ? 'immediate' : 'expected',
    headline: `Rip Current Warning - ${beach.name}`,
    description: `High rip current risk due to elevated shore-break energy. Iribarren number: ${random(0.3, 0.8).toFixed(2)}`,
    areaDescription: beach.name,
    affectedRegions: [beach.name],
    expiresAt: new Date(now.getTime() + 24 * 3600000).toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Main Event Generator
// ─────────────────────────────────────────────────────────────

export function generateMockEvents(hazardType: HazardType, count: number = 5): HazardEvent[] {
  const generators: Record<HazardType, (index: number) => HazardEvent> = {
    oil_spill: generateOilSpillEvent,
    hab: generateHABEvent,
    cyclone: generateCycloneEvent,
    mhw: generateMHWEvent,
    rip_current: generateRipCurrentEvent,
  };

  const generator = generators[hazardType];
  return Array.from({ length: count }, (_, i) => generator(i + 1));
}

// ─────────────────────────────────────────────────────────────
// CAP Alert Generator
// ─────────────────────────────────────────────────────────────

export function generateMockAlerts(events: HazardEvent[]): CAPAlert[] {
  return events
    .filter((e) => e.severity !== 'minor')
    .map((event) => ({
      identifier: `CAP-${event.eventId}`,
      sender: 'iohd-ews@incois.gov.in',
      sent: event.detectionTime,
      status: 'Actual' as const,
      msgType: 'Alert' as const,
      scope: 'Public' as const,
      event,
      expires: event.expiresAt,
      senderName: 'INCOIS IOHD-EWS',
      headline: event.headline,
      description: event.description,
      instruction: getInstructionForHazard(event.hazardType, event.severity),
      web: `https://incois.gov.in/iohd/event/${event.eventId}`,
      contact: 'iohd-ops@incois.gov.in',
      polygon: event.seedPolygon,
    }));
}

function getInstructionForHazard(hazardType: HazardType, severity: AlertSeverity): string {
  const instructions: Record<HazardType, Record<AlertSeverity, string>> = {
    oil_spill: {
      extreme: 'Immediate evacuation of fishing vessels from affected zone. Contact Coast Guard.',
      severe: 'Avoid affected waters. Report sightings to authorities.',
      moderate: 'Exercise caution in nearby waters. Monitor updates.',
      minor: 'Be aware of potential impacts.',
      unknown: 'Monitor situation.',
    },
    hab: {
      extreme: 'Do not consume seafood from affected region. Health advisory in effect.',
      severe: 'Avoid swimming in affected coastal waters.',
      moderate: 'Shellfish harvesting suspended in affected area.',
      minor: 'Monitor water quality reports.',
      unknown: 'Monitor situation.',
    },
    cyclone: {
      extreme: 'EVACUATE coastal areas immediately. Seek sturdy shelter inland.',
      severe: 'Complete preparations. Move to safe shelter before landfall.',
      moderate: 'Secure property. Prepare emergency supplies.',
      minor: 'Stay informed and monitor updates.',
      unknown: 'Monitor situation.',
    },
    mhw: {
      extreme: 'Expect severe coral bleaching. Avoid strenuous diving activities.',
      severe: 'Marine ecosystem stress likely. Monitor fish behavior.',
      moderate: 'Elevated water temperatures detected.',
      minor: 'Warmer than normal conditions.',
      unknown: 'Monitor situation.',
    },
    rip_current: {
      extreme: 'DO NOT enter the water. Swimming prohibited.',
      severe: 'Experienced swimmers only. Swim near lifeguards.',
      moderate: 'Use caution. Know how to escape rip currents.',
      minor: 'Be aware of changing conditions.',
      unknown: 'Monitor situation.',
    },
  };

  return instructions[hazardType][severity];
}

// ─────────────────────────────────────────────────────────────
// Particle Ensemble Generator (for Oil Spill visualization)
// ─────────────────────────────────────────────────────────────

export function generateParticleEnsemble(
  event: HazardEvent,
  timestep: number = 0
): ParticleEnsemble | null {
  if (event.hazardType !== 'oil_spill' || !event.seedPolygon) return null;

  const coords = event.seedPolygon.coordinates[0];
  const centerLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const centerLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;

  const N_PARTICLES = 500;
  const particles: Particle[] = [];

  for (let i = 0; i < N_PARTICLES; i++) {
    // Initial position along polygon boundary + diffusion
    const boundaryPoint = coords[i % coords.length];
    const spreadFactor = 1 + timestep * 0.01;
    
    particles.push({
      id: `p-${i}`,
      lon: boundaryPoint[0] + (timestep * 0.02) + random(-0.1, 0.1) * spreadFactor,
      lat: boundaryPoint[1] + (timestep * 0.01) + random(-0.05, 0.05) * spreadFactor,
      time: timestep,
      age: timestep,
      probability: Math.max(0.1, 1 - i / N_PARTICLES * 0.5),
      ensembleMember: i % 50, // 50 ensemble members
    });
  }

  return {
    eventId: event.eventId,
    particles,
    timestep,
    totalTimesteps: 168 / 3, // 168 hours / 3-hourly steps
    metadata: {
      n_atmospheric: 50,
      n_ocean: 4,
      n_stochastic: 10,
      windage: 0.03,
      diffusivity: 100, // m²/s
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Cyclone Track & Uncertainty Cone Generator
// ─────────────────────────────────────────────────────────────

export function generateCycloneTrack(
  event: HazardEvent,
  currentHour: number = 0
): CycloneTrack | null {
  if (event.hazardType !== 'cyclone' || !event.seedPolygon) return null;

  const coords = event.seedPolygon.coordinates[0];
  const startLon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const startLat = coords.reduce((s, c) => s + c[1], 0) / coords.length;

  // Generate track points at 6-hourly intervals up to 120h
  const trackPoints: CycloneTrackPoint[] = [];
  const conePoints: [number, number][] = [];
  
  // Track direction (slightly random but consistent)
  const directionAngle = random(-0.3, 0.3); // radians from north
  const speed = random(0.015, 0.025); // degrees per hour
  
  for (let hour = 0; hour <= 120; hour += 6) {
    // Calculate position with slight curve
    const curveOffset = Math.sin(hour / 30) * 0.3;
    const lon = startLon + (hour * speed * Math.sin(directionAngle + curveOffset));
    const lat = startLat + (hour * speed * Math.cos(directionAngle));
    
    // Intensity varies with time (peaks mid-track)
    const baseIntensity = 50 + random(0, 30);
    const intensityPeak = Math.sin((hour / 120) * Math.PI) * 20;
    const intensity = baseIntensity + intensityPeak;
    
    // Category based on intensity (Saffir-Simpson)
    let category = 0;
    if (intensity >= 64) category = 5;
    else if (intensity >= 50) category = 4;
    else if (intensity >= 43) category = 3;
    else if (intensity >= 33) category = 2;
    else if (intensity >= 26) category = 1;
    
    // Uncertainty grows with forecast hour
    const positionError = 30 + hour * 2; // km
    const intensityError = 3 + hour * 0.1; // m/s
    
    trackPoints.push({
      time: new Date(Date.now() + hour * 3600000).toISOString(),
      lon,
      lat,
      intensity,
      category,
      centralPressure: 1010 - intensity * 0.8,
      rMax: 30 + random(0, 20),
      uncertainty: {
        positionErrorKm: positionError,
        intensityErrorMs: intensityError,
      },
    });
    
    // Build uncertainty cone outline (left and right edges)
    const coneRadius = (positionError / 111) * 1.5; // Convert km to degrees, add buffer
    const perpAngle = directionAngle + Math.PI / 2;
    conePoints.push([lon + coneRadius * Math.cos(perpAngle), lat + coneRadius * Math.sin(perpAngle)]);
  }
  
  // Add right side of cone (reverse order)
  for (let i = trackPoints.length - 1; i >= 0; i--) {
    const point = trackPoints[i];
    const coneRadius = (point.uncertainty.positionErrorKm / 111) * 1.5;
    const perpAngle = directionAngle - Math.PI / 2;
    conePoints.push([point.lon + coneRadius * Math.cos(perpAngle), point.lat + coneRadius * Math.sin(perpAngle)]);
  }
  
  // Close the cone polygon
  conePoints.push(conePoints[0]);

  return {
    eventId: event.eventId,
    name: event.headline.includes('Cyclone') ? event.headline.split(' ')[2] : 'UNNAMED',
    designation: `BOB ${randomInt(1, 12).toString().padStart(2, '0')}`,
    basin: 'Bay of Bengal',
    trackPoints,
    uncertaintyCone: {
      type: 'Polygon',
      coordinates: [conePoints],
    },
    surgeForecast: random(0, 1) > 0.5 ? {
      maxSurgeM: random(2, 6),
      coastalImpactPolygon: generateIrregularPolygon(
        trackPoints[trackPoints.length - 1].lon,
        trackPoints[trackPoints.length - 1].lat,
        1.5,
        10
      ),
    } : undefined,
    potentialIntensity: 70 + random(0, 20),
  };
}

// ─────────────────────────────────────────────────────────────
// Animated Particle Generator (returns interpolated positions)
// ─────────────────────────────────────────────────────────────

export function generateAnimatedParticles(
  event: HazardEvent,
  timestep: number,
  animationPhase: number = 0 // 0-1 for smooth animation
): Particle[] {
  if (event.hazardType !== 'oil_spill' || !event.seedPolygon) return [];

  const coords = event.seedPolygon.coordinates[0];
  const N_PARTICLES = 300;
  const particles: Particle[] = [];

  for (let i = 0; i < N_PARTICLES; i++) {
    // Use deterministic seed for consistent particle positions
    const seed = i * 0.618033988749895; // Golden ratio for better distribution
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + timestep * 0.1) * 43758.5453;
      return x - Math.floor(x);
    };
    
    // Initial position from polygon
    const boundaryIdx = i % coords.length;
    const boundaryPoint = coords[boundaryIdx];
    const nextPoint = coords[(boundaryIdx + 1) % coords.length];
    
    // Interpolate along boundary
    const t = pseudoRandom(seed);
    const baseLon = boundaryPoint[0] + (nextPoint[0] - boundaryPoint[0]) * t;
    const baseLat = boundaryPoint[1] + (nextPoint[1] - boundaryPoint[1]) * t;
    
    // Advection based on timestep
    const u = 0.02 + pseudoRandom(seed + 1) * 0.01; // Eastward velocity
    const v = 0.01 + pseudoRandom(seed + 2) * 0.005; // Northward velocity
    
    // Diffusion (spreads over time)
    const diffusion = 0.02 * Math.sqrt(timestep / 3) * (pseudoRandom(seed + 3) - 0.5);
    
    // Animated oscillation
    const oscillation = Math.sin(animationPhase * Math.PI * 2 + seed * 10) * 0.005;
    
    const lon = baseLon + u * timestep + diffusion + oscillation;
    const lat = baseLat + v * timestep + diffusion * 0.7 + oscillation * 0.5;
    
    // Probability decreases with distance from source
    const distanceFromSource = Math.sqrt(
      Math.pow(lon - baseLon, 2) + Math.pow(lat - baseLat, 2)
    );
    const probability = Math.max(0.1, 1 - distanceFromSource * 2 - timestep * 0.003);

    particles.push({
      id: `anim-${event.eventId}-${i}`,
      lon,
      lat,
      time: timestep,
      age: timestep,
      probability,
      ensembleMember: i % 50,
    });
  }

  return particles;
}

// ─────────────────────────────────────────────────────────────
// Wind Field Generator for Cyclones
// ─────────────────────────────────────────────────────────────

export interface WindFieldPoint {
  lon: number;
  lat: number;
  u: number; // Eastward wind component m/s
  v: number; // Northward wind component m/s
  speed: number; // Wind speed m/s
  direction: number; // Direction in degrees (meteorological)
}

export function generateCycloneWindField(
  centerLon: number,
  centerLat: number,
  maxWind: number, // m/s
  rMax: number, // km, radius of max wind
  gridSize: number = 12
): WindFieldPoint[] {
  const points: WindFieldPoint[] = [];
  const gridSpacing = 0.5; // degrees
  
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const lon = centerLon + i * gridSpacing;
      const lat = centerLat + j * gridSpacing;
      
      // Distance from center in km (approximate)
      const dx = (lon - centerLon) * 111 * Math.cos(centerLat * Math.PI / 180);
      const dy = (lat - centerLat) * 111;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r < 1) continue; // Skip center
      
      // Modified Rankine vortex wind profile
      let windSpeed: number;
      if (r <= rMax) {
        windSpeed = maxWind * (r / rMax);
      } else {
        windSpeed = maxWind * Math.pow(rMax / r, 0.5);
      }
      
      // Decay at large distances
      windSpeed *= Math.exp(-r / (rMax * 8));
      
      // Cyclonic rotation (counterclockwise in Northern Hemisphere)
      const angle = Math.atan2(dy, dx);
      const tangentialAngle = angle + Math.PI / 2; // Perpendicular for rotation
      const inflowAngle = 0.35; // Inward spiral ~20 degrees
      
      const u = windSpeed * Math.cos(tangentialAngle - inflowAngle);
      const v = windSpeed * Math.sin(tangentialAngle - inflowAngle);
      
      // Meteorological direction (from which wind blows)
      const direction = (Math.atan2(-u, -v) * 180 / Math.PI + 360) % 360;
      
      points.push({ lon, lat, u, v, speed: windSpeed, direction });
    }
  }
  
  return points;
}

// ─────────────────────────────────────────────────────────────
// HAB Forecast Grid Generator
// ─────────────────────────────────────────────────────────────

export function generateHABGrid(event: HazardEvent): HABForecast | null {
  if (event.hazardType !== 'hab' || !event.seedPolygon) return null;

  const coords = event.seedPolygon.coordinates[0];
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  
  const bounds = {
    minLon: Math.min(...lons) - 0.5,
    maxLon: Math.max(...lons) + 0.5,
    minLat: Math.min(...lats) - 0.5,
    maxLat: Math.max(...lats) + 0.5,
  };

  const resolution = 0.1; // degrees
  const grid: HABGridCell[] = [];
  const features = ['chl_anomaly', 'sst_anomaly', 'nitrate', 'river_discharge', 'mld_shoaling'];

  for (let lon = bounds.minLon; lon <= bounds.maxLon; lon += resolution) {
    for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += resolution) {
      const shapValues: Record<string, number> = {};
      features.forEach((f) => {
        shapValues[f] = random(-0.3, 0.3);
      });

      const dominantFeature = features.reduce((a, b) =>
        Math.abs(shapValues[a]) > Math.abs(shapValues[b]) ? a : b
      );

      grid.push({
        lon,
        lat,
        probability: random(0.2, 0.9),
        shapValues,
        dominantFactor: dominantFeature,
      });
    }
  }

  return {
    eventId: event.eventId,
    timestamp: event.detectionTime,
    grid,
    resolution,
    bounds,
    shapSummary: features.map((f) => ({
      feature: f,
      importance: random(0.1, 0.4),
      direction: Math.random() > 0.5 ? 'positive' : 'negative',
    })),
  };
}
