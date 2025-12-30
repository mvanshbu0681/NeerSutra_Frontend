/**
 * ============================================
 * IOHD-EWS Type Definitions
 * Integrated Ocean Hazard Detection & Early Warning System
 * ============================================
 */

// ─────────────────────────────────────────────────────────────
// Hazard Types
// ─────────────────────────────────────────────────────────────

export type HazardType = 'oil_spill' | 'hab' | 'cyclone' | 'mhw' | 'rip_current';

export const HAZARD_CONFIG: Record<HazardType, HazardConfig> = {
  oil_spill: {
    id: 'oil_spill',
    name: 'Oil Spill',
    shortName: 'Oil',
    icon: 'droplet',
    color: '#1a1a1a',
    accentColor: '#6b21a8', // Purple
    gradientFrom: '#581c87',
    gradientTo: '#7c3aed',
    description: 'SAR-anchored Lagrangian particle tracking for oil spill trajectory forecasting',
    forecastHorizon: 168, // hours (7 days)
    updateInterval: 3, // hours
  },
  hab: {
    id: 'hab',
    name: 'Harmful Algal Bloom',
    shortName: 'HAB',
    icon: 'flask',
    color: '#166534',
    accentColor: '#22c55e', // Green
    gradientFrom: '#14532d',
    gradientTo: '#4ade80',
    description: 'XGBoost-driven HAB detection with SHAP interpretability',
    forecastHorizon: 72,
    updateInterval: 6,
  },
  cyclone: {
    id: 'cyclone',
    name: 'Tropical Cyclone',
    shortName: 'Cyclone',
    icon: 'hurricane',
    color: '#991b1b',
    accentColor: '#ef4444', // Red
    gradientFrom: '#7f1d1d',
    gradientTo: '#f87171',
    description: 'Potential intensity & storm surge prediction',
    forecastHorizon: 120,
    updateInterval: 6,
  },
  mhw: {
    id: 'mhw',
    name: 'Marine Heatwave',
    shortName: 'MHW',
    icon: 'thermometer',
    color: '#c2410c',
    accentColor: '#f97316', // Orange
    gradientFrom: '#9a3412',
    gradientTo: '#fb923c',
    description: 'SST anomaly detection (Hobday criteria: >90th percentile for ≥5 days)',
    forecastHorizon: 168,
    updateInterval: 24,
  },
  rip_current: {
    id: 'rip_current',
    name: 'Rip Current',
    shortName: 'Rip',
    icon: 'waves',
    color: '#0369a1',
    accentColor: '#0ea5e9', // Sky blue
    gradientFrom: '#075985',
    gradientTo: '#38bdf8',
    description: 'Iribarren number & shore-break energy analysis',
    forecastHorizon: 48,
    updateInterval: 1,
  },
};

export interface HazardConfig {
  id: HazardType;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  forecastHorizon: number; // hours
  updateInterval: number; // hours
}

// ─────────────────────────────────────────────────────────────
// Severity & Alert Levels (CAP-compatible)
// ─────────────────────────────────────────────────────────────

export type AlertSeverity = 'extreme' | 'severe' | 'moderate' | 'minor' | 'unknown';
export type AlertCertainty = 'observed' | 'likely' | 'possible' | 'unlikely' | 'unknown';
export type AlertUrgency = 'immediate' | 'expected' | 'future' | 'past' | 'unknown';

export const SEVERITY_CONFIG: Record<AlertSeverity, SeverityConfig> = {
  extreme: {
    level: 4,
    label: 'Extreme',
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.2)',
    borderColor: 'rgba(220, 38, 38, 0.5)',
    pulseAnimation: true,
  },
  severe: {
    level: 3,
    label: 'Severe',
    color: '#ea580c',
    bgColor: 'rgba(234, 88, 12, 0.2)',
    borderColor: 'rgba(234, 88, 12, 0.5)',
    pulseAnimation: true,
  },
  moderate: {
    level: 2,
    label: 'Moderate',
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.2)',
    borderColor: 'rgba(234, 179, 8, 0.5)',
    pulseAnimation: false,
  },
  minor: {
    level: 1,
    label: 'Minor',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
    pulseAnimation: false,
  },
  unknown: {
    level: 0,
    label: 'Unknown',
    color: '#64748b',
    bgColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: 'rgba(100, 116, 139, 0.5)',
    pulseAnimation: false,
  },
};

export interface SeverityConfig {
  level: number;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  pulseAnimation: boolean;
}

// ─────────────────────────────────────────────────────────────
// Provenance & Confidence (Core IOHD-EWS requirement)
// ─────────────────────────────────────────────────────────────

export interface Provenance {
  models: Record<string, string>; // model_name -> commit_hash
  dataTiles: string[]; // Source tile IDs
  processingSteps: string[]; // Ordered list of processing steps
  configHash: string;
  runId: string; // Prefect/DAG run ID
  timestamp: string; // ISO timestamp
}

export interface ConfidenceComponents {
  detectionCertainty: number; // 0-1, e.g., SAR detection confidence
  ensembleSpread: number; // 0-1, normalized spread
  dataCoverage: number; // 0-1, spatial/temporal coverage
  modelSkill: number; // 0-1, regional skill score
}

export interface ConfidenceScore {
  overall: number; // 0-1, weighted aggregate
  components: ConfidenceComponents;
  weights: Record<keyof ConfidenceComponents, number>;
}

// ─────────────────────────────────────────────────────────────
// Validation Metrics (Brier Score is mandatory per spec)
// ─────────────────────────────────────────────────────────────

export interface ValidationMetrics {
  brierScore?: number; // Mandatory for probabilistic outputs
  iou?: number; // For polygon-based events (oil spill)
  rocAuc?: number; // For classification (HAB)
  pod?: number; // Probability of Detection
  far?: number; // False Alarm Rate
  hk?: number; // Hanssen-Kuipers (HK) skill score
  rmse?: number; // For continuous variables
}

// ─────────────────────────────────────────────────────────────
// Event Schema (matches API spec from context)
// ─────────────────────────────────────────────────────────────

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lon, lat]
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // Array of [lon, lat]
}

export interface TimedPolygon {
  time: string; // ISO timestamp
  geometry: GeoJSONPolygon;
  probability: number; // 0-1
}

export interface HazardEvent {
  eventId: string; // e.g., "iohd-20251209-oil-0001"
  hazardType: HazardType;
  detectionTime: string; // ISO timestamp
  source: string; // e.g., "sentinel1_20251209_ABC"
  seedPolygon?: GeoJSONPolygon; // Initial detection polygon
  probabilityTiles: string[]; // S3 URLs to GeoTIFF probability tiles
  polygons: TimedPolygon[]; // Forecast polygons with timestamps
  confidenceScore: ConfidenceScore;
  provenance: Provenance;
  validationMetrics?: ValidationMetrics;
  severity: AlertSeverity;
  certainty: AlertCertainty;
  urgency: AlertUrgency;
  headline: string;
  description: string;
  areaDescription: string;
  affectedRegions: string[];
  expiresAt: string; // ISO timestamp
}

// ─────────────────────────────────────────────────────────────
// CAP Alert Schema
// ─────────────────────────────────────────────────────────────

export interface CAPAlert {
  identifier: string;
  sender: string;
  sent: string; // ISO timestamp
  status: 'Actual' | 'Exercise' | 'System' | 'Test' | 'Draft';
  msgType: 'Alert' | 'Update' | 'Cancel' | 'Ack' | 'Error';
  scope: 'Public' | 'Restricted' | 'Private';
  event: HazardEvent;
  expires: string;
  senderName: string;
  headline: string;
  description: string;
  instruction?: string;
  web?: string;
  contact?: string;
  polygon?: GeoJSONPolygon;
}

// ─────────────────────────────────────────────────────────────
// Lagrangian Particle (for Oil Spill visualization)
// ─────────────────────────────────────────────────────────────

export interface Particle {
  id: string;
  lon: number;
  lat: number;
  time: number; // hours from t0
  age: number; // hours since release
  probability: number; // 0-1
  ensembleMember: number;
}

export interface ParticleEnsemble {
  eventId: string;
  particles: Particle[];
  timestep: number; // Current forecast hour
  totalTimesteps: number;
  metadata: {
    n_atmospheric: number;
    n_ocean: number;
    n_stochastic: number;
    windage: number;
    diffusivity: number;
  };
}

// ─────────────────────────────────────────────────────────────
// Cyclone Track
// ─────────────────────────────────────────────────────────────

export interface CycloneTrackPoint {
  time: string;
  lon: number;
  lat: number;
  intensity: number; // m/s max sustained wind
  category: number; // Saffir-Simpson or equivalent
  centralPressure: number; // hPa
  rMax: number; // km, radius of max wind
  uncertainty: {
    positionErrorKm: number;
    intensityErrorMs: number;
  };
}

export interface CycloneTrack {
  eventId: string;
  name: string;
  designation: string; // e.g., "BOB 02"
  basin: string;
  trackPoints: CycloneTrackPoint[];
  uncertaintyCone: GeoJSONPolygon;
  surgeForecast?: {
    maxSurgeM: number;
    coastalImpactPolygon: GeoJSONPolygon;
  };
  potentialIntensity: number; // Theoretical max m/s
}

// ─────────────────────────────────────────────────────────────
// HAB Probability Grid
// ─────────────────────────────────────────────────────────────

export interface HABGridCell {
  lon: number;
  lat: number;
  probability: number; // 0-1
  shapValues: Record<string, number>; // Feature -> SHAP contribution
  dominantFactor: string; // Top contributing feature
}

export interface HABForecast {
  eventId: string;
  timestamp: string;
  grid: HABGridCell[];
  resolution: number; // degrees
  bounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
  };
  shapSummary: {
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
  }[];
}

// ─────────────────────────────────────────────────────────────
// Marine Heatwave
// ─────────────────────────────────────────────────────────────

export interface MHWEvent {
  eventId: string;
  startDate: string;
  currentDay: number; // Days since onset
  maxAnomaly: number; // °C above climatology
  meanAnomaly: number;
  category: 1 | 2 | 3 | 4; // I=Moderate, II=Strong, III=Severe, IV=Extreme
  polygon: GeoJSONPolygon;
  trend: 'intensifying' | 'stable' | 'weakening';
}

// ─────────────────────────────────────────────────────────────
// Rip Current
// ─────────────────────────────────────────────────────────────

export interface RipCurrentZone {
  id: string;
  coastName: string;
  polygon: GeoJSONPolygon;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  iribarrenNumber: number;
  shoreBreakEnergy: number; // kJ/m
  beachSlope: number; // degrees
  validUntil: string;
}

// ─────────────────────────────────────────────────────────────
// Store State
// ─────────────────────────────────────────────────────────────

export interface EWSState {
  // Active hazard mode
  activeHazard: HazardType;
  
  // Forecast time control
  currentForecastHour: number; // 0 to forecastHorizon
  isPlaying: boolean;
  playbackSpeed: number; // 1x, 2x, 4x
  
  // Events
  events: HazardEvent[];
  selectedEventId: string | null;
  
  // Alerts
  alerts: CAPAlert[];
  alertFilter: AlertSeverity | 'all';
  
  // Severity filter for map events
  severityFilter: AlertSeverity | 'all';
  
  // Confidence threshold
  minConfidenceThreshold: number; // 0-1, filter events below this
  
  // UI state
  showProbabilityLayer: boolean;
  showParticles: boolean;
  showUncertaintyCone: boolean;
  showProvenance: boolean;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
  
  // Map view
  mapCenter: [number, number];
  mapZoom: number;
}

export interface EWSActions {
  // Hazard selection
  setActiveHazard: (hazard: HazardType) => void;
  
  // Time control
  setForecastHour: (hour: number) => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  
  // Event management
  setEvents: (events: HazardEvent[]) => void;
  addEvent: (event: HazardEvent) => void;
  selectEvent: (eventId: string | null) => void;
  
  // Alerts
  setAlerts: (alerts: CAPAlert[]) => void;
  setAlertFilter: (filter: AlertSeverity | 'all') => void;
  dismissAlert: (alertId: string) => void;
  
  // Severity filter for map
  setSeverityFilter: (filter: AlertSeverity | 'all') => void;
  
  // Filters
  setMinConfidenceThreshold: (threshold: number) => void;
  
  // UI toggles
  toggleProbabilityLayer: () => void;
  toggleParticles: () => void;
  toggleUncertaintyCone: () => void;
  toggleProvenance: () => void;
  
  // Loading
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Map
  setMapView: (center: [number, number], zoom: number) => void;
  
  // Refresh
  refreshData: () => Promise<void>;
}
