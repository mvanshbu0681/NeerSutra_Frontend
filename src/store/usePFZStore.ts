/**
 * ============================================
 * PFZ Zustand Store
 * State management for PFZ Forecasting System
 * ============================================
 */

import { create } from 'zustand';
import type { SpeciesId, PFZForecast, PFZPolygon, HSIResult } from '../lib/pfz/types';
import { SPECIES_PROFILES } from '../lib/pfz/types';

export interface PFZState {
  // Selected species
  selectedSpecies: SpeciesId;
  setSelectedSpecies: (species: SpeciesId) => void;
  
  // Forecast data
  currentForecast: PFZForecast | null;
  setCurrentForecast: (forecast: PFZForecast | null) => void;
  
  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Selected zone for details
  selectedZone: PFZPolygon | null;
  setSelectedZone: (zone: PFZPolygon | null) => void;
  
  // Location analysis
  locationAnalysis: (HSIResult & { recommendation: string }) | null;
  setLocationAnalysis: (analysis: (HSIResult & { recommendation: string }) | null) => void;
  
  // UI state
  showConfidenceOverlay: boolean;
  toggleConfidenceOverlay: () => void;
  
  showGrid: boolean;
  toggleGrid: () => void;
  
  showContours: boolean;
  toggleContours: () => void;
  
  // Map layer opacity
  layerOpacity: number;
  setLayerOpacity: (opacity: number) => void;
  
  // HSI threshold for visualization
  hsiThreshold: number;
  setHSIThreshold: (threshold: number) => void;
  
  // Forecast date
  forecastDate: Date;
  setForecastDate: (date: Date) => void;
  
  // Multi-species comparison
  comparisonSpecies: SpeciesId[];
  toggleComparisonSpecies: (species: SpeciesId) => void;
  clearComparisonSpecies: () => void;
  
  // View mode
  viewMode: 'heatmap' | 'contour' | 'zones';
  setViewMode: (mode: 'heatmap' | 'contour' | 'zones') => void;
  
  // Reset all state
  reset: () => void;
}

const initialState = {
  selectedSpecies: 'indian_mackerel' as SpeciesId,
  currentForecast: null,
  isLoading: false,
  selectedZone: null,
  locationAnalysis: null,
  showConfidenceOverlay: false,
  showGrid: false,
  showContours: true,
  layerOpacity: 0.7,
  hsiThreshold: 0.6,
  forecastDate: new Date(),
  comparisonSpecies: [],
  viewMode: 'zones' as const,
};

export const usePFZStore = create<PFZState>((set, get) => ({
  ...initialState,
  
  setSelectedSpecies: (species) => set({ 
    selectedSpecies: species,
    selectedZone: null,
    locationAnalysis: null,
  }),
  
  setCurrentForecast: (forecast) => set({ currentForecast: forecast }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setSelectedZone: (zone) => set({ selectedZone: zone }),
  
  setLocationAnalysis: (analysis) => set({ locationAnalysis: analysis }),
  
  toggleConfidenceOverlay: () => set((state) => ({ 
    showConfidenceOverlay: !state.showConfidenceOverlay 
  })),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  toggleContours: () => set((state) => ({ showContours: !state.showContours })),
  
  setLayerOpacity: (opacity) => set({ layerOpacity: opacity }),
  
  setHSIThreshold: (threshold) => set({ hsiThreshold: threshold }),
  
  setForecastDate: (date) => set({ forecastDate: date }),
  
  toggleComparisonSpecies: (species) => set((state) => {
    const current = state.comparisonSpecies;
    if (current.includes(species)) {
      return { comparisonSpecies: current.filter(s => s !== species) };
    } else if (current.length < 3) {
      return { comparisonSpecies: [...current, species] };
    }
    return state;
  }),
  
  clearComparisonSpecies: () => set({ comparisonSpecies: [] }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  reset: () => set(initialState),
}));

// Selector hooks for common patterns
export const useSelectedSpeciesProfile = () => {
  const species = usePFZStore(state => state.selectedSpecies);
  return SPECIES_PROFILES[species];
};

export const usePFZPolygons = () => {
  const forecast = usePFZStore(state => state.currentForecast);
  return forecast?.polygons ?? [];
};

export const useHighPotentialZones = () => {
  const polygons = usePFZPolygons();
  return polygons.filter(p => p.potential === 'high');
};
