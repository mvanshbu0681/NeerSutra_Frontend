/**
 * ============================================
 * CHE State Management - Zustand Store
 * Manages 4D slice state, layer selection, and cached data
 * ============================================
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { 
  StandardDepth, 
  LocationAnalysis, 
  SimulationGrid,
  RiskLevel,
  VerticalDOProfile 
} from '../lib/che/types';
import { STANDARD_DEPTHS } from '../lib/che/types';

// ============================================
// Types
// ============================================

export type CHELayerType = 'dzri' | 'pei' | 'ors' | 'do' | 'none';

export type TimeMode = 'realtime' | 'historical' | 'forecast';

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

interface SelectedLocation {
  lat: number;
  lon: number;
  analysis: LocationAnalysis | null;
}

interface CHEState {
  // 4D Slice Controls
  selectedDepth: StandardDepth;
  selectedTime: Date;
  timeMode: TimeMode;
  
  // Layer Controls
  activeLayer: CHELayerType;
  layerOpacity: number;
  showContours: boolean;
  showHypoxiaZones: boolean;
  
  // Grid Data
  simulationGrid: SimulationGrid | null;
  isLoading: boolean;
  lastUpdateTime: Date | null;
  
  // Selected Location
  selectedLocation: SelectedLocation | null;
  hoveredCell: { lat: number; lon: number } | null;
  
  // Map State
  mapBounds: MapBounds | null;
  gridResolution: number;
  
  // UI State
  isDetailsPanelOpen: boolean;
  isDepthSliderExpanded: boolean;
  animationSpeed: number;
  isAnimating: boolean;
}

interface CHEActions {
  // Depth Control
  setSelectedDepth: (depth: StandardDepth) => void;
  incrementDepth: () => void;
  decrementDepth: () => void;
  
  // Time Control
  setSelectedTime: (time: Date) => void;
  setTimeMode: (mode: TimeMode) => void;
  advanceTime: (hours: number) => void;
  
  // Layer Control
  setActiveLayer: (layer: CHELayerType) => void;
  setLayerOpacity: (opacity: number) => void;
  toggleContours: () => void;
  toggleHypoxiaZones: () => void;
  
  // Data Management
  setSimulationGrid: (grid: SimulationGrid) => void;
  setLoading: (loading: boolean) => void;
  refreshGrid: () => void;
  
  // Location Selection
  selectLocation: (lat: number, lon: number, analysis?: LocationAnalysis) => void;
  clearSelection: () => void;
  setHoveredCell: (cell: { lat: number; lon: number } | null) => void;
  
  // Map State
  setMapBounds: (bounds: MapBounds) => void;
  setGridResolution: (resolution: number) => void;
  
  // UI Actions
  toggleDetailsPanel: () => void;
  toggleDepthSlider: () => void;
  setAnimationSpeed: (speed: number) => void;
  toggleAnimation: () => void;
  
  // Reset
  reset: () => void;
}

type CHEStore = CHEState & CHEActions;

// ============================================
// Initial State
// ============================================

const initialState: CHEState = {
  // 4D Slice Controls
  selectedDepth: 0,
  selectedTime: new Date(),
  timeMode: 'realtime',
  
  // Layer Controls
  activeLayer: 'dzri',
  layerOpacity: 0.7,
  showContours: true,
  showHypoxiaZones: true,
  
  // Grid Data
  simulationGrid: null,
  isLoading: false,
  lastUpdateTime: null,
  
  // Selected Location
  selectedLocation: null,
  hoveredCell: null,
  
  // Map State
  mapBounds: null,
  gridResolution: 0.5,
  
  // UI State
  isDetailsPanelOpen: false,
  isDepthSliderExpanded: false,
  animationSpeed: 1,
  isAnimating: false,
};

// ============================================
// Store
// ============================================

export const useCHEStore = create<CHEStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Depth Control
      setSelectedDepth: (depth) => set({ selectedDepth: depth }),
      
      incrementDepth: () => {
        const currentIndex = STANDARD_DEPTHS.indexOf(get().selectedDepth);
        const nextIndex = Math.min(currentIndex + 1, STANDARD_DEPTHS.length - 1);
        set({ selectedDepth: STANDARD_DEPTHS[nextIndex] });
      },
      
      decrementDepth: () => {
        const currentIndex = STANDARD_DEPTHS.indexOf(get().selectedDepth);
        const prevIndex = Math.max(currentIndex - 1, 0);
        set({ selectedDepth: STANDARD_DEPTHS[prevIndex] });
      },

      // Time Control
      setSelectedTime: (time) => set({ selectedTime: time }),
      
      setTimeMode: (mode) => set({ timeMode: mode }),
      
      advanceTime: (hours) => {
        const current = get().selectedTime;
        const newTime = new Date(current.getTime() + hours * 60 * 60 * 1000);
        set({ selectedTime: newTime });
      },

      // Layer Control
      setActiveLayer: (layer) => set({ activeLayer: layer }),
      
      setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
      
      toggleContours: () => set((state) => ({ showContours: !state.showContours })),
      
      toggleHypoxiaZones: () => set((state) => ({ showHypoxiaZones: !state.showHypoxiaZones })),

      // Data Management
      setSimulationGrid: (grid) => set({ 
        simulationGrid: grid, 
        lastUpdateTime: new Date(),
        isLoading: false,
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      refreshGrid: () => {
        // This will trigger a re-fetch in the component
        set({ lastUpdateTime: new Date() });
      },

      // Location Selection
      selectLocation: (lat, lon, analysis) => {
        set({ 
          selectedLocation: { lat, lon, analysis: analysis ?? null },
          isDetailsPanelOpen: true,
        });
      },
      
      clearSelection: () => set({ 
        selectedLocation: null,
        isDetailsPanelOpen: false,
      }),
      
      setHoveredCell: (cell) => set({ hoveredCell: cell }),

      // Map State
      setMapBounds: (bounds) => set({ mapBounds: bounds }),
      
      setGridResolution: (resolution) => set({ gridResolution: resolution }),

      // UI Actions
      toggleDetailsPanel: () => set((state) => ({ 
        isDetailsPanelOpen: !state.isDetailsPanelOpen 
      })),
      
      toggleDepthSlider: () => set((state) => ({ 
        isDepthSliderExpanded: !state.isDepthSliderExpanded 
      })),
      
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      
      toggleAnimation: () => set((state) => ({ isAnimating: !state.isAnimating })),

      // Reset
      reset: () => set(initialState),
    })),
    { name: 'che-store' }
  )
);

// ============================================
// Selectors (for optimized re-renders)
// ============================================

export const selectDepth = (state: CHEStore) => state.selectedDepth;
export const selectTime = (state: CHEStore) => state.selectedTime;
export const selectActiveLayer = (state: CHEStore) => state.activeLayer;
export const selectSimulationGrid = (state: CHEStore) => state.simulationGrid;
export const selectSelectedLocation = (state: CHEStore) => state.selectedLocation;
export const selectIsLoading = (state: CHEStore) => state.isLoading;

// ============================================
// Utility Hooks
// ============================================

/**
 * Hook to get risk color based on value
 */
export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'safe':
      return '#34d399'; // emerald-400
    case 'warning':
      return '#fbbf24'; // amber-400
    case 'high':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Hook to get layer color scale
 */
export function getLayerColorScale(layer: CHELayerType): [number, number, number][] {
  switch (layer) {
    case 'dzri':
      return [
        [52, 211, 153],  // emerald (safe)
        [251, 191, 36], // amber (warning)
        [239, 68, 68],  // red (high)
      ];
    case 'pei':
      return [
        [59, 130, 246],  // blue (low pollution)
        [168, 85, 247],  // purple (medium)
        [236, 72, 153],  // pink (high)
      ];
    case 'ors':
      return [
        [239, 68, 68],   // red (low resilience)
        [251, 191, 36],  // amber (medium)
        [52, 211, 153],  // emerald (high resilience)
      ];
    case 'do':
      return [
        [239, 68, 68],   // red (hypoxic)
        [251, 191, 36],  // amber (low)
        [34, 211, 238],  // cyan (healthy)
      ];
    default:
      return [
        [107, 114, 128], // gray
        [107, 114, 128],
        [107, 114, 128],
      ];
  }
}

/**
 * Get depth label with units
 */
export function getDepthLabel(depth: StandardDepth): string {
  return depth === 0 ? 'Surface' : `${depth}m`;
}
