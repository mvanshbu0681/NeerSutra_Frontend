/**
 * ============================================
 * useDashboardData Hook - REVAMPED
 * Actionable, contextual data for Mission Dashboard
 * ============================================
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useEWSStore, useFilteredEvents } from '../../src/store/useEWSStore';
import { useCHEStore } from '../../src/store/useCHEStore';
import { usePFZStore, useHighPotentialZones } from '../../src/store/usePFZStore';
import { 
  SEVERITY_CONFIG, 
  HAZARD_CONFIG, 
  type AlertSeverity, 
  type HazardType 
} from '../../src/lib/ews/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface DashboardFilters {
  search: string;
  timeRange: TimeRange;
  region: string | null;
  hazardType: HazardType | null;
  severity: AlertSeverity | null;
  isLiveMode: boolean;
  // New context filters
  selectedZone: string;
  selectedSpecies: string;
}

// EWS Types
export interface ImpactMatrixPoint {
  id: string;
  name: string;
  hoursToLandfall: number;
  severity: number; // 1-4
  severityLabel: string;
  hazardType: HazardType;
  population: number;
  fill: string;
}

export interface ForecastReliabilityPoint {
  hour: string;
  predicted: number;
  actual: number;
  deviation: number;
}

export interface PopulationAtRiskData {
  hazardName: string;
  hazardType: HazardType;
  population: number;
  fill: string;
  region: string;
}

// CHE Types
export interface PollutantData {
  zone: string;
  oil: number;
  algae: number;
  sewage: number;
  industrial: number;
  total: number;
}

export interface SafeWindowData {
  hour: string;
  doLevel: number;
  temperature: number;
  isSafe: boolean;
}

export interface SourceAttributionData {
  source: string;
  percentage: number;
  fill: string;
}

// PFZ Types
export interface CPUEForecastData {
  zone: string;
  cpue: number; // tons/hour
  distance: number; // km
  fill: string;
}

export interface FuelCatchROIData {
  zone: string;
  distance: number;
  predictedCatch: number;
  fuelCost: number;
  roi: number;
  fill: string;
}

export interface MarketPriceData {
  species: string;
  predictedCatch: number;
  marketPrice: number;
  revenue: number;
  fill: string;
}

// Fleet Types
export interface FleetUtilizationData {
  category: string;
  hours: number;
  percentage: number;
  fill: string;
}

export interface FuelEfficiencyData {
  vesselName: string;
  litersPerTon: number;
  fill: string;
  efficiency: 'good' | 'average' | 'poor';
}

export interface MaintenanceHealthData {
  system: string;
  vessel: string;
  health: number; // 0-100
  failureProbability: number; // 0-1
  fill: string;
}

export interface RouteOptimizationData {
  metric: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  fill: string;
}

// ─────────────────────────────────────────────────────────────
// Default Values
// ─────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: DashboardFilters = {
  search: '',
  timeRange: '24h',
  region: null,
  hazardType: null,
  severity: null,
  isLiveMode: false,
  selectedZone: 'Mumbai Coast',
  selectedSpecies: 'All Species',
};

const COASTAL_ZONES = [
  'Mumbai Coast',
  'Chennai Harbor',
  'Kochi Backwaters',
  'Visakhapatnam Bay',
  'Sundarbans Delta',
];

const FISH_SPECIES = [
  'All Species',
  'Tuna',
  'Mackerel',
  'Sardine',
  'Pomfret',
  'Hilsa',
];

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useDashboardData() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [liveUpdateCounter, setLiveUpdateCounter] = useState(0);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Store connections
  const ewsStore = useEWSStore();
  const cheStore = useCHEStore();
  const pfzStore = usePFZStore();
  const filteredEvents = useFilteredEvents();
  const highPotentialZones = useHighPotentialZones();

  // ─────────────────────────────────────────────────────────────
  // Filter Actions
  // ─────────────────────────────────────────────────────────────

  const updateFilters = useCallback((updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleLiveMode = useCallback(() => {
    setFilters(prev => ({ ...prev, isLiveMode: !prev.isLiveMode }));
  }, []);

  // Live mode effect
  useEffect(() => {
    if (filters.isLiveMode) {
      liveIntervalRef.current = setInterval(() => {
        setLiveUpdateCounter(c => c + 1);
      }, 5000);
    } else if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
    }
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [filters.isLiveMode]);

  // ─────────────────────────────────────────────────────────────
  // EWS DATA - Actionable Hazard Insights
  // ─────────────────────────────────────────────────────────────

  // Impact Severity Matrix: Severity vs Time to Landfall
  const ewsImpactMatrix = useMemo((): ImpactMatrixPoint[] => {
    const baseData: ImpactMatrixPoint[] = [
      { id: 'cyclone-dana', name: 'Cyclone Dana', hoursToLandfall: 12, severity: 4, severityLabel: 'Extreme', hazardType: 'cyclone', population: 2500000, fill: '#dc2626' },
      { id: 'cyclone-bay-02', name: 'BOB-02 Depression', hoursToLandfall: 48, severity: 2, severityLabel: 'Moderate', hazardType: 'cyclone', population: 500000, fill: '#eab308' },
      { id: 'oil-mumbai', name: 'Mumbai Oil Spill', hoursToLandfall: 6, severity: 3, severityLabel: 'Severe', hazardType: 'oil_spill', population: 150000, fill: '#ea580c' },
      { id: 'hab-chennai', name: 'Chennai HAB', hoursToLandfall: 24, severity: 2, severityLabel: 'Moderate', hazardType: 'hab', population: 80000, fill: '#eab308' },
      { id: 'mhw-andaman', name: 'Andaman MHW', hoursToLandfall: 72, severity: 1, severityLabel: 'Minor', hazardType: 'mhw', population: 25000, fill: '#22c55e' },
    ];

    // Apply filters
    let data = baseData;
    if (filters.hazardType) {
      data = data.filter(d => d.hazardType === filters.hazardType);
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(s));
    }

    // Add some variation for live mode
    if (filters.isLiveMode) {
      data = data.map(d => ({
        ...d,
        hoursToLandfall: Math.max(1, d.hoursToLandfall - (liveUpdateCounter * 0.5) % 12),
      }));
    }

    return data;
  }, [filters.hazardType, filters.search, filters.isLiveMode, liveUpdateCounter]);

  // Forecast Reliability: Predicted vs Actual path deviation
  const ewsForecastReliability = useMemo((): ForecastReliabilityPoint[] => {
    const hours = ['-72h', '-60h', '-48h', '-36h', '-24h', '-12h', 'Now'];
    return hours.map((hour, i) => {
      const baseDeviation = 30 - (i * 4);
      return {
        hour,
        predicted: 100,
        actual: 100 - baseDeviation,
        deviation: baseDeviation,
      };
    });
  }, [liveUpdateCounter]);

  // Population at Risk by active hazard
  const ewsPopulationAtRisk = useMemo((): PopulationAtRiskData[] => {
    return ewsImpactMatrix
      .sort((a, b) => b.population - a.population)
      .slice(0, 5)
      .map(event => ({
        hazardName: event.name,
        hazardType: event.hazardType,
        population: event.population,
        fill: getHazardColor(event.hazardType),
        region: event.name.split(' ')[0],
      }));
  }, [ewsImpactMatrix]);

  // Active threats summary for header
  const ewsActiveThreats = useMemo(() => {
    const immediate = ewsImpactMatrix.filter(e => e.hoursToLandfall <= 12 && e.severity >= 3);
    const critical = ewsImpactMatrix.filter(e => e.severity === 4);
    return {
      total: ewsImpactMatrix.length,
      immediate: immediate.length,
      critical: critical.length,
      totalPopulation: ewsImpactMatrix.reduce((sum, e) => sum + e.population, 0),
    };
  }, [ewsImpactMatrix]);

  // ─────────────────────────────────────────────────────────────
  // CHE DATA - Coastal Health with Context
  // ─────────────────────────────────────────────────────────────

  // Pollutant Breakdown by selected zone
  const chePollutantBreakdown = useMemo((): PollutantData[] => {
    const zoneData: Record<string, PollutantData> = {
      'Mumbai Coast': { zone: 'Mumbai Coast', oil: 35, algae: 15, sewage: 30, industrial: 20, total: 100 },
      'Chennai Harbor': { zone: 'Chennai Harbor', oil: 20, algae: 40, sewage: 25, industrial: 15, total: 100 },
      'Kochi Backwaters': { zone: 'Kochi Backwaters', oil: 10, algae: 25, sewage: 45, industrial: 20, total: 100 },
      'Visakhapatnam Bay': { zone: 'Visakhapatnam Bay', oil: 45, algae: 10, sewage: 20, industrial: 25, total: 100 },
      'Sundarbans Delta': { zone: 'Sundarbans Delta', oil: 5, algae: 60, sewage: 25, industrial: 10, total: 100 },
    };
    
    const selected = zoneData[filters.selectedZone] || zoneData['Mumbai Coast'];
    return [selected];
  }, [filters.selectedZone]);

  // Safe Window for swimming/fishing in selected zone
  const cheSafeWindow = useMemo((): SafeWindowData[] => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      const doLevel = 5 + Math.sin(i / 4) * 2;
      const temperature = 26 + Math.sin(i / 6) * 3;
      const isSafe = doLevel > 4.5 && temperature < 30 && temperature > 22;
      hours.push({ hour, doLevel: parseFloat(doLevel.toFixed(1)), temperature: parseFloat(temperature.toFixed(1)), isSafe });
    }
    return hours;
  }, [filters.selectedZone]);

  // Source Attribution - where pollution comes from
  const cheSourceAttribution = useMemo((): SourceAttributionData[] => {
    const sources: Record<string, SourceAttributionData[]> = {
      'Mumbai Coast': [
        { source: 'River Runoff', percentage: 45, fill: '#3b82f6' },
        { source: 'Industrial', percentage: 30, fill: '#ef4444' },
        { source: 'Shipping', percentage: 15, fill: '#f59e0b' },
        { source: 'Atmospheric', percentage: 10, fill: '#8b5cf6' },
      ],
      'Chennai Harbor': [
        { source: 'Industrial', percentage: 40, fill: '#ef4444' },
        { source: 'River Runoff', percentage: 35, fill: '#3b82f6' },
        { source: 'Sewage', percentage: 20, fill: '#84cc16' },
        { source: 'Shipping', percentage: 5, fill: '#f59e0b' },
      ],
      'Kochi Backwaters': [
        { source: 'Sewage', percentage: 50, fill: '#84cc16' },
        { source: 'River Runoff', percentage: 30, fill: '#3b82f6' },
        { source: 'Industrial', percentage: 15, fill: '#ef4444' },
        { source: 'Atmospheric', percentage: 5, fill: '#8b5cf6' },
      ],
      'Visakhapatnam Bay': [
        { source: 'Industrial', percentage: 45, fill: '#ef4444' },
        { source: 'Shipping', percentage: 25, fill: '#f59e0b' },
        { source: 'River Runoff', percentage: 20, fill: '#3b82f6' },
        { source: 'Atmospheric', percentage: 10, fill: '#8b5cf6' },
      ],
      'Sundarbans Delta': [
        { source: 'River Runoff', percentage: 55, fill: '#3b82f6' },
        { source: 'Sewage', percentage: 25, fill: '#84cc16' },
        { source: 'Industrial', percentage: 15, fill: '#ef4444' },
        { source: 'Atmospheric', percentage: 5, fill: '#8b5cf6' },
      ],
    };
    return sources[filters.selectedZone] || sources['Mumbai Coast'];
  }, [filters.selectedZone]);

  // DZRI Score for selected zone
  const cheZoneDZRI = useMemo(() => {
    const scores: Record<string, number> = {
      'Mumbai Coast': 62,
      'Chennai Harbor': 48,
      'Kochi Backwaters': 35,
      'Visakhapatnam Bay': 71,
      'Sundarbans Delta': 28,
    };
    return scores[filters.selectedZone] || 50;
  }, [filters.selectedZone]);

  // ─────────────────────────────────────────────────────────────
  // PFZ DATA - Actionable Fishing Insights
  // ─────────────────────────────────────────────────────────────

  // CPUE Forecast: Predicted catch per hour by zone
  const pfzCPUEForecast = useMemo((): CPUEForecastData[] => {
    const zones = [
      { zone: 'Zone A-12', cpue: 2.8, distance: 45, fill: '#22c55e' },
      { zone: 'Zone B-07', cpue: 2.1, distance: 80, fill: '#84cc16' },
      { zone: 'Zone C-15', cpue: 1.8, distance: 120, fill: '#eab308' },
      { zone: 'Zone D-03', cpue: 1.2, distance: 35, fill: '#f59e0b' },
      { zone: 'Zone E-09', cpue: 0.9, distance: 150, fill: '#ef4444' },
    ];
    return zones.sort((a, b) => b.cpue - a.cpue);
  }, [filters.selectedSpecies, liveUpdateCounter]);

  // Fuel vs Catch ROI: Scatter data for decision making
  const pfzFuelCatchROI = useMemo((): FuelCatchROIData[] => {
    return [
      { zone: 'Zone A-12', distance: 45, predictedCatch: 12.5, fuelCost: 4500, roi: 2.78, fill: '#22c55e' },
      { zone: 'Zone B-07', distance: 80, predictedCatch: 16.8, fuelCost: 8000, roi: 2.10, fill: '#84cc16' },
      { zone: 'Zone C-15', distance: 120, predictedCatch: 21.6, fuelCost: 12000, roi: 1.80, fill: '#eab308' },
      { zone: 'Zone D-03', distance: 35, predictedCatch: 4.2, fuelCost: 3500, roi: 1.20, fill: '#f59e0b' },
      { zone: 'Zone E-09', distance: 150, predictedCatch: 13.5, fuelCost: 15000, roi: 0.90, fill: '#ef4444' },
    ];
  }, [liveUpdateCounter]);

  // Market Price Correlation: What to catch today
  const pfzMarketPrice = useMemo((): MarketPriceData[] => {
    return [
      { species: 'Pomfret', predictedCatch: 2.5, marketPrice: 850, revenue: 2125, fill: '#22c55e' },
      { species: 'Tuna', predictedCatch: 5.2, marketPrice: 380, revenue: 1976, fill: '#3b82f6' },
      { species: 'Mackerel', predictedCatch: 8.1, marketPrice: 180, revenue: 1458, fill: '#8b5cf6' },
      { species: 'Sardine', predictedCatch: 15.3, marketPrice: 80, revenue: 1224, fill: '#f59e0b' },
      { species: 'Hilsa', predictedCatch: 1.2, marketPrice: 1200, revenue: 1440, fill: '#06b6d4' },
    ].sort((a, b) => b.revenue - a.revenue);
  }, [liveUpdateCounter]);

  // PFZ Summary
  const pfzBestZone = useMemo(() => {
    const best = pfzFuelCatchROI.reduce((a, b) => a.roi > b.roi ? a : b);
    return {
      zone: best.zone,
      roi: best.roi,
      predictedRevenue: pfzMarketPrice.reduce((sum, s) => sum + s.revenue, 0),
    };
  }, [pfzFuelCatchROI, pfzMarketPrice]);

  // ─────────────────────────────────────────────────────────────
  // FLEET DATA - Operational Efficiency
  // ─────────────────────────────────────────────────────────────

  // Fleet Utilization breakdown
  const fleetUtilization = useMemo((): FleetUtilizationData[] => {
    return [
      { category: 'Fishing', hours: 156, percentage: 65, fill: '#22c55e' },
      { category: 'Transit', hours: 48, percentage: 20, fill: '#3b82f6' },
      { category: 'Idle', hours: 24, percentage: 10, fill: '#f59e0b' },
      { category: 'Maintenance', hours: 12, percentage: 5, fill: '#ef4444' },
    ];
  }, [liveUpdateCounter]);

  // Fuel Efficiency Leaderboard
  const fleetFuelEfficiency = useMemo((): FuelEfficiencyData[] => {
    const data: FuelEfficiencyData[] = [
      { vesselName: 'MV Sagarmitra', litersPerTon: 45, fill: '#22c55e', efficiency: 'good' },
      { vesselName: 'FV Matsya-07', litersPerTon: 52, fill: '#22c55e', efficiency: 'good' },
      { vesselName: 'MV Ocean Star', litersPerTon: 68, fill: '#84cc16', efficiency: 'good' },
      { vesselName: 'FV Jaldhara', litersPerTon: 85, fill: '#eab308', efficiency: 'average' },
      { vesselName: 'MV Coastal King', litersPerTon: 95, fill: '#f59e0b', efficiency: 'average' },
      { vesselName: 'FV Bay Runner', litersPerTon: 120, fill: '#ef4444', efficiency: 'poor' },
    ];
    return data.sort((a, b) => a.litersPerTon - b.litersPerTon);
  }, [liveUpdateCounter]);

  // Maintenance Health Heatmap data
  const fleetMaintenanceHealth = useMemo((): MaintenanceHealthData[] => {
    const systems = ['Engine', 'Hull', 'Electronics', 'Refrigeration'];
    const vessels = ['Sagarmitra', 'Matsya-07', 'Ocean Star', 'Jaldhara'];
    const data: MaintenanceHealthData[] = [];
    
    // Deterministic health values for consistent display
    const healthValues: Record<string, Record<string, number>> = {
      'Sagarmitra': { 'Engine': 92, 'Hull': 88, 'Electronics': 95, 'Refrigeration': 78 },
      'Matsya-07': { 'Engine': 85, 'Hull': 91, 'Electronics': 72, 'Refrigeration': 88 },
      'Ocean Star': { 'Engine': 45, 'Hull': 82, 'Electronics': 88, 'Refrigeration': 65 },
      'Jaldhara': { 'Engine': 78, 'Hull': 55, 'Electronics': 42, 'Refrigeration': 91 },
    };
    
    vessels.forEach(vessel => {
      systems.forEach(system => {
        const health = healthValues[vessel][system];
        const failureProbability = health < 50 ? 0.7 : health < 70 ? 0.3 : 0.1;
        data.push({
          system,
          vessel,
          health,
          failureProbability,
          fill: health > 70 ? '#22c55e' : health > 50 ? '#eab308' : '#ef4444',
        });
      });
    });
    return data;
  }, [liveUpdateCounter]);

  // Route Optimization Savings
  const fleetOptimizationSavings = useMemo((): RouteOptimizationData[] => {
    return [
      { metric: 'Fuel Saved', value: 12500, unit: 'liters', trend: 'up', fill: '#22c55e' },
      { metric: 'Time Saved', value: 48, unit: 'hours', trend: 'up', fill: '#3b82f6' },
      { metric: 'Cost Reduction', value: 18, unit: '%', trend: 'up', fill: '#8b5cf6' },
      { metric: 'CO₂ Reduced', value: 32, unit: 'tons', trend: 'up', fill: '#06b6d4' },
    ];
  }, [liveUpdateCounter]);

  // Fleet Summary
  const fleetSummary = useMemo(() => {
    const avgUtilization = fleetUtilization.find(u => u.category === 'Fishing')?.percentage || 0;
    const poorEfficiency = fleetFuelEfficiency.filter(v => v.efficiency === 'poor').length;
    const criticalMaintenance = fleetMaintenanceHealth.filter(m => m.health < 50).length;
    return {
      totalVessels: 24,
      activeVessels: 18,
      utilizationRate: avgUtilization,
      inefficientVessels: poorEfficiency,
      criticalMaintenanceAlerts: criticalMaintenance,
    };
  }, [fleetUtilization, fleetFuelEfficiency, fleetMaintenanceHealth]);

  // ─────────────────────────────────────────────────────────────
  // Summary Stats
  // ─────────────────────────────────────────────────────────────

  const summaryStats = useMemo(() => ({
    ews: {
      totalEvents: ewsActiveThreats.total,
      criticalAlerts: ewsActiveThreats.critical,
      immediateThreats: ewsActiveThreats.immediate,
      populationAtRisk: ewsActiveThreats.totalPopulation,
    },
    che: {
      dzriScore: cheZoneDZRI,
      selectedZone: filters.selectedZone,
      safeHours: cheSafeWindow.filter(h => h.isSafe).length,
    },
    pfz: {
      highPotentialZones: pfzCPUEForecast.filter(z => z.cpue > 2).length,
      bestZone: pfzBestZone.zone,
      avgROI: pfzBestZone.roi,
    },
    fleet: {
      totalVessels: fleetSummary.totalVessels,
      activeVessels: fleetSummary.activeVessels,
      utilizationRate: fleetSummary.utilizationRate,
      criticalAlerts: fleetSummary.criticalMaintenanceAlerts,
    },
  }), [ewsActiveThreats, cheZoneDZRI, cheSafeWindow, pfzCPUEForecast, pfzBestZone, fleetSummary, filters.selectedZone]);

  // ─────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────

  return {
    // Filters
    filters,
    updateFilters,
    resetFilters,
    toggleLiveMode,
    
    // Static options
    coastalZones: COASTAL_ZONES,
    fishSpecies: FISH_SPECIES,

    // EWS Data (Revamped)
    ewsImpactMatrix,
    ewsForecastReliability,
    ewsPopulationAtRisk,
    ewsActiveThreats,

    // CHE Data (Revamped)
    chePollutantBreakdown,
    cheSafeWindow,
    cheSourceAttribution,
    cheZoneDZRI,

    // PFZ Data (Revamped)
    pfzCPUEForecast,
    pfzFuelCatchROI,
    pfzMarketPrice,
    pfzBestZone,

    // Fleet Data (Revamped)
    fleetUtilization,
    fleetFuelEfficiency,
    fleetMaintenanceHealth,
    fleetOptimizationSavings,
    fleetSummary,

    // Summary
    summaryStats,

    // Meta
    isLive: filters.isLiveMode,
    lastUpdate: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

function getHazardColor(hazard: HazardType): string {
  const colors: Record<HazardType, string> = {
    oil_spill: '#7c3aed',
    hab: '#22c55e',
    cyclone: '#ef4444',
    mhw: '#f97316',
    rip_current: '#0ea5e9',
  };
  return colors[hazard] || '#64748b';
}

export default useDashboardData;
