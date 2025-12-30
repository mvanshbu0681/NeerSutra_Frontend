/**
 * ============================================
 * IOHD-EWS Zustand Store
 * Integrated Ocean Hazard Detection & Early Warning System
 * ============================================
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  EWSState,
  EWSActions,
  HazardType,
  HazardEvent,
  CAPAlert,
  AlertSeverity,
} from '../lib/ews/types';
import { generateMockEvents, generateMockAlerts } from '../lib/ews/engine';

// ─────────────────────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────────────────────

const initialState: EWSState = {
  // Active hazard mode
  activeHazard: 'oil_spill',
  
  // Forecast time control
  currentForecastHour: 0,
  isPlaying: false,
  playbackSpeed: 1,
  
  // Events
  events: [],
  selectedEventId: null,
  
  // Alerts
  alerts: [],
  alertFilter: 'all',
  
  // Severity filter for map visualization
  severityFilter: 'all',
  
  // Confidence threshold
  minConfidenceThreshold: 0.3,
  
  // UI state
  showProbabilityLayer: true,
  showParticles: true,
  showUncertaintyCone: true,
  showProvenance: false,
  
  // Loading states
  isLoading: false,
  isRefreshing: false,
  lastUpdated: null,
  
  // Map view - centered on Bay of Bengal
  mapCenter: [85.0, 15.0],
  mapZoom: 5,
};

// ─────────────────────────────────────────────────────────────
// Store Definition
// ─────────────────────────────────────────────────────────────

export const useEWSStore = create<EWSState & EWSActions>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // ─────────────────────────────────────────────────────────
      // Hazard Selection
      // ─────────────────────────────────────────────────────────
      
      setActiveHazard: (hazard: HazardType) => {
        set({ 
          activeHazard: hazard,
          currentForecastHour: 0,
          selectedEventId: null,
          isPlaying: false,
        });
        // Trigger data refresh for new hazard
        get().refreshData();
      },

      // ─────────────────────────────────────────────────────────
      // Time Control
      // ─────────────────────────────────────────────────────────
      
      setForecastHour: (hour: number) => {
        set({ currentForecastHour: Math.max(0, hour) });
      },

      togglePlayback: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      setPlaybackSpeed: (speed: number) => {
        set({ playbackSpeed: speed });
      },

      stepForward: () => {
        set((state) => ({
          currentForecastHour: state.currentForecastHour + 3, // 3-hourly steps
        }));
      },

      stepBackward: () => {
        set((state) => ({
          currentForecastHour: Math.max(0, state.currentForecastHour - 3),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // Event Management
      // ─────────────────────────────────────────────────────────
      
      setEvents: (events: HazardEvent[]) => {
        set({ events });
      },

      addEvent: (event: HazardEvent) => {
        set((state) => ({ events: [...state.events, event] }));
      },

      selectEvent: (eventId: string | null) => {
        set({ selectedEventId: eventId });
      },

      // ─────────────────────────────────────────────────────────
      // Alerts
      // ─────────────────────────────────────────────────────────
      
      setAlerts: (alerts: CAPAlert[]) => {
        set({ alerts });
      },

      setAlertFilter: (filter: AlertSeverity | 'all') => {
        set({ alertFilter: filter });
      },

      setSeverityFilter: (filter: AlertSeverity | 'all') => {
        set({ severityFilter: filter });
      },

      dismissAlert: (alertId: string) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.identifier !== alertId),
        }));
      },

      // ─────────────────────────────────────────────────────────
      // Filters
      // ─────────────────────────────────────────────────────────
      
      setMinConfidenceThreshold: (threshold: number) => {
        set({ minConfidenceThreshold: threshold });
      },

      // ─────────────────────────────────────────────────────────
      // UI Toggles
      // ─────────────────────────────────────────────────────────
      
      toggleProbabilityLayer: () => {
        set((state) => ({ showProbabilityLayer: !state.showProbabilityLayer }));
      },

      toggleParticles: () => {
        set((state) => ({ showParticles: !state.showParticles }));
      },

      toggleUncertaintyCone: () => {
        set((state) => ({ showUncertaintyCone: !state.showUncertaintyCone }));
      },

      toggleProvenance: () => {
        set((state) => ({ showProvenance: !state.showProvenance }));
      },

      // ─────────────────────────────────────────────────────────
      // Loading
      // ─────────────────────────────────────────────────────────
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setRefreshing: (refreshing: boolean) => {
        set({ isRefreshing: refreshing });
      },

      // ─────────────────────────────────────────────────────────
      // Map
      // ─────────────────────────────────────────────────────────
      
      setMapView: (center: [number, number], zoom: number) => {
        set({ mapCenter: center, mapZoom: zoom });
      },

      // ─────────────────────────────────────────────────────────
      // Data Refresh
      // ─────────────────────────────────────────────────────────
      
      refreshData: async () => {
        const { activeHazard } = get();
        set({ isRefreshing: true });

        try {
          // Generate mock data for the active hazard
          const events = generateMockEvents(activeHazard, 5);
          const alerts = generateMockAlerts(events);

          set({
            events,
            alerts,
            lastUpdated: new Date().toISOString(),
            isRefreshing: false,
          });
        } catch (error) {
          console.error('Failed to refresh EWS data:', error);
          set({ isRefreshing: false });
        }
      },
    })),
    { name: 'ews-store' }
  )
);

// ─────────────────────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────────────────────

export const useActiveHazard = () => useEWSStore((state) => state.activeHazard);
export const useSelectedEvent = () => {
  const events = useEWSStore((state) => state.events);
  const selectedId = useEWSStore((state) => state.selectedEventId);
  return events.find((e) => e.eventId === selectedId) ?? null;
};

export const useFilteredEvents = () => {
  const events = useEWSStore((state) => state.events);
  const threshold = useEWSStore((state) => state.minConfidenceThreshold);
  return events.filter((e) => e.confidenceScore.overall >= threshold);
};

export const useFilteredAlerts = () => {
  const alerts = useEWSStore((state) => state.alerts);
  const filter = useEWSStore((state) => state.alertFilter);
  if (filter === 'all') return alerts;
  return alerts.filter((a) => a.event.severity === filter);
};

export const useForecastProgress = () => {
  const currentHour = useEWSStore((state) => state.currentForecastHour);
  const activeHazard = useEWSStore((state) => state.activeHazard);
  const { HAZARD_CONFIG } = require('../lib/ews/types');
  const config = HAZARD_CONFIG[activeHazard];
  return {
    current: currentHour,
    max: config.forecastHorizon,
    progress: currentHour / config.forecastHorizon,
  };
};
