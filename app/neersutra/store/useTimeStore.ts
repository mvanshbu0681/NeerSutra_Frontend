'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Time Store - Controls the global 4D time state
 * The "4th Dimension" of NeerSutra's visualization
 */

interface TimeState {
  // Current time being visualized
  currentTime: Date;
  
  // Playback controls
  playbackSpeed: number; // 1 = real-time, 60 = 1 min/sec, 3600 = 1 hr/sec
  isPlaying: boolean;
  
  // Time window for forecasts (typically 7 days ahead)
  timeRange: {
    start: Date;
    end: Date;
  };
  
  // Actions
  setCurrentTime: (time: Date) => void;
  setPlaybackSpeed: (speed: number) => void;
  togglePlayback: () => void;
  play: () => void;
  pause: () => void;
  stepForward: (minutes: number) => void;
  stepBackward: (minutes: number) => void;
  setTimeRange: (start: Date, end: Date) => void;
  resetToNow: () => void;
}

const now = new Date();
const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

export const useTimeStore = create<TimeState>()(
  devtools(
    (set, get) => ({
      currentTime: now,
      playbackSpeed: 60, // Default: 1 minute per second
      isPlaying: false,
      timeRange: {
        start: now,
        end: sevenDaysLater,
      },

      setCurrentTime: (time) => {
        const { timeRange } = get();
        // Clamp to time range
        const clampedTime = new Date(
          Math.max(
            timeRange.start.getTime(),
            Math.min(timeRange.end.getTime(), time.getTime())
          )
        );
        set({ currentTime: clampedTime });
      },

      setPlaybackSpeed: (speed) => {
        set({ playbackSpeed: Math.max(1, Math.min(7200, speed)) });
      },

      togglePlayback: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      play: () => set({ isPlaying: true }),
      
      pause: () => set({ isPlaying: false }),

      stepForward: (minutes) => {
        const { currentTime, timeRange } = get();
        const newTime = new Date(currentTime.getTime() + minutes * 60 * 1000);
        if (newTime <= timeRange.end) {
          set({ currentTime: newTime });
        }
      },

      stepBackward: (minutes) => {
        const { currentTime, timeRange } = get();
        const newTime = new Date(currentTime.getTime() - minutes * 60 * 1000);
        if (newTime >= timeRange.start) {
          set({ currentTime: newTime });
        }
      },

      setTimeRange: (start, end) => {
        set({ timeRange: { start, end } });
      },

      resetToNow: () => {
        const now = new Date();
        set({
          currentTime: now,
          timeRange: {
            start: now,
            end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      },
    }),
    { name: 'neersutra-time-store' }
  )
);
