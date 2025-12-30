'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Route, VesselSpec, AISData, MapViewState, LayerVisibility } from '../types';

/**
 * Route Store - Manages route computation and selection
 * Aligned with SYSTEM_CONTEXT.md Section 6.7 Edge Cost Function:
 * J = αFuel + βCO₂ + γTime + δRisk + εCongestion
 */

interface OptimizationWeights {
  alpha: number;  // Fuel weight
  beta: number;   // CO₂ weight
  gamma: number;  // Time weight
  delta: number;  // Risk weight
  epsilon: number; // Congestion weight
}

interface RouteState {
  // Selected vessel
  selectedVessel: VesselSpec | null;
  
  // Route data
  selectedRoute: Route | null;
  alternativeRoutes: Route[];
  
  // Computation state
  isComputing: boolean;
  computeError: string | null;
  
  // Optimization weights (Pareto front selection)
  optimizationWeights: OptimizationWeights;
  
  // Origin & Destination
  origin: { lat: number; lon: number } | null;
  destination: { lat: number; lon: number } | null;
  
  // Actions
  setSelectedVessel: (vessel: VesselSpec | null) => void;
  setSelectedRoute: (route: Route | null) => void;
  setAlternativeRoutes: (routes: Route[]) => void;
  setOrigin: (point: { lat: number; lon: number } | null) => void;
  setDestination: (point: { lat: number; lon: number } | null) => void;
  setOptimizationWeights: (weights: Partial<OptimizationWeights>) => void;
  setPreset: (preset: 'fastest' | 'greenest' | 'safest' | 'balanced') => void;
  startComputing: () => void;
  finishComputing: (error?: string) => void;
  clearRoute: () => void;
}

const DEFAULT_WEIGHTS: OptimizationWeights = {
  alpha: 0.3,   // Fuel
  beta: 0.2,    // CO₂
  gamma: 0.2,   // Time
  delta: 0.2,   // Risk
  epsilon: 0.1, // Congestion
};

export const useRouteStore = create<RouteState>()(
  devtools(
    (set) => ({
      selectedVessel: null,
      selectedRoute: null,
      alternativeRoutes: [],
      isComputing: false,
      computeError: null,
      optimizationWeights: DEFAULT_WEIGHTS,
      origin: null,
      destination: null,

      setSelectedVessel: (vessel) => set({ selectedVessel: vessel }),
      
      setSelectedRoute: (route) => set({ selectedRoute: route }),
      
      setAlternativeRoutes: (routes) => set({ alternativeRoutes: routes }),
      
      setOrigin: (point) => set({ origin: point }),
      
      setDestination: (point) => set({ destination: point }),

      setOptimizationWeights: (weights) =>
        set((state) => ({
          optimizationWeights: { ...state.optimizationWeights, ...weights },
        })),

      setPreset: (preset) => {
        const presets: Record<string, OptimizationWeights> = {
          fastest: { alpha: 0.1, beta: 0.05, gamma: 0.7, delta: 0.1, epsilon: 0.05 },
          greenest: { alpha: 0.3, beta: 0.5, gamma: 0.05, delta: 0.1, epsilon: 0.05 },
          safest: { alpha: 0.1, beta: 0.1, gamma: 0.1, delta: 0.6, epsilon: 0.1 },
          balanced: DEFAULT_WEIGHTS,
        };
        set({ optimizationWeights: presets[preset] });
      },

      startComputing: () => set({ isComputing: true, computeError: null }),
      
      finishComputing: (error) =>
        set({ isComputing: false, computeError: error || null }),

      clearRoute: () =>
        set({
          selectedRoute: null,
          alternativeRoutes: [],
          origin: null,
          destination: null,
          computeError: null,
        }),
    }),
    { name: 'neersutra-route-store' }
  )
);

/**
 * Map Store - Controls map view state and layer visibility
 */

interface MapState {
  viewState: MapViewState;
  layerVisibility: LayerVisibility;
  selectedShip: AISData | null;
  
  // Actions
  setViewState: (viewState: Partial<MapViewState>) => void;
  setLayerVisibility: (visibility: Partial<LayerVisibility>) => void;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  setSelectedShip: (ship: AISData | null) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
}

// Default view: Indian Ocean
const DEFAULT_VIEW: MapViewState = {
  longitude: 75.0,
  latitude: 15.0,
  zoom: 5,
  pitch: 45,
  bearing: 0,
};

const DEFAULT_LAYER_VISIBILITY: LayerVisibility = {
  aisTraffic: true,
  weatherWind: true,
  weatherWaves: false,
  weatherCurrents: true,
  routes: true,
  congestion: true,
  bathymetry: false,
};

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      viewState: DEFAULT_VIEW,
      layerVisibility: DEFAULT_LAYER_VISIBILITY,
      selectedShip: null,

      setViewState: (viewState) =>
        set((state) => ({
          viewState: { ...state.viewState, ...viewState },
        })),

      setLayerVisibility: (visibility) =>
        set((state) => ({
          layerVisibility: { ...state.layerVisibility, ...visibility },
        })),

      toggleLayer: (layer) =>
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            [layer]: !state.layerVisibility[layer],
          },
        })),

      setSelectedShip: (ship) => set({ selectedShip: ship }),

      flyTo: (lat, lon, zoom = 10) =>
        set({
          viewState: {
            ...DEFAULT_VIEW,
            latitude: lat,
            longitude: lon,
            zoom,
          },
        }),
    }),
    { name: 'neersutra-map-store' }
  )
);
