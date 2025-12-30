/**
 * ============================================
 * PFZ Timeline - Forecast Date Navigation
 * Glass-morphic time capsule for forecast control
 * ============================================
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePFZStore, useSelectedSpeciesProfile } from '../../../../src/store/usePFZStore';

export default function PFZTimeline() {
  const { forecastDate, setForecastDate, currentForecast, selectedSpecies, isLoading } = usePFZStore();
  const profile = useSelectedSpeciesProfile();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Generate forecast dates (today + 4 days)
  const forecastDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);
  
  const selectedDateIndex = useMemo(() => {
    return forecastDates.findIndex(d => 
      d.toDateString() === forecastDate.toDateString()
    );
  }, [forecastDates, forecastDate]);

  // Format helpers
  const formatDay = (date: Date) => {
    if (!isMounted) return '--';
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short' });
  };
  
  const formatDate = (date: Date) => {
    if (!isMounted) return '-- ---';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Confidence color
  const confidenceColor = useMemo(() => {
    const conf = currentForecast?.confidence ?? 0.5;
    if (conf >= 0.8) return '#22c55e';
    if (conf >= 0.6) return '#f59e0b';
    return '#ef4444';
  }, [currentForecast?.confidence]);

  return (
    <motion.div 
      className="glass-panel rounded-2xl px-6 py-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-6">
        {/* Left - Title & Species */}
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {isLoading && (
              <div className="absolute -top-1 -right-1 w-3 h-3">
                <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
                <div className="absolute inset-0 rounded-full bg-amber-400" />
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-white/80">{profile.name}</p>
            <p className="text-[10px] text-white/40">5-Day Forecast</p>
          </div>
        </div>

        {/* Center - Date Selector */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {forecastDates.map((date, idx) => {
            const isSelected = selectedDateIndex === idx;
            const confidence = 0.9 - idx * 0.1; // Decreasing confidence for future days
            
            return (
              <motion.button
                key={idx}
                onClick={() => setForecastDate(date)}
                className={`relative px-4 py-2 rounded-xl transition-all ${
                  isSelected 
                    ? 'bg-amber-500/20 border border-amber-500/30' 
                    : 'bg-white/[0.03] border border-transparent hover:bg-white/5 hover:border-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <p className={`text-xs font-medium ${isSelected ? 'text-amber-400' : 'text-white/70'}`}>
                  {formatDay(date)}
                </p>
                <p className={`text-[10px] ${isSelected ? 'text-amber-400/70' : 'text-white/40'}`}>
                  {formatDate(date)}
                </p>
                
                {/* Confidence indicator */}
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${confidence * 100}%`,
                      backgroundColor: confidence >= 0.8 ? '#22c55e' : confidence >= 0.6 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                
                {isSelected && (
                  <motion.div
                    layoutId="selected-date"
                    className="absolute inset-0 rounded-xl border-2 border-amber-400/50"
                    style={{ boxShadow: '0 0 15px rgba(245,158,11,0.3)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right - Forecast Summary */}
        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
          {/* Confidence Gauge */}
          <div className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke={confidenceColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentForecast?.confidence ?? 0.5) * 100} 100`}
                  style={{ filter: `drop-shadow(0 0 4px ${confidenceColor}40)` }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: confidenceColor }}>
                {isMounted ? Math.round((currentForecast?.confidence ?? 0.5) * 100) : '--'}%
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Confidence</p>
              <p className="text-xs font-medium" style={{ color: confidenceColor }}>
                {(currentForecast?.confidence ?? 0.5) >= 0.8 ? 'High' : (currentForecast?.confidence ?? 0.5) >= 0.6 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>

          {/* Zone Count */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div>
              <p className="text-lg font-bold text-white">
                {currentForecast?.polygons.length ?? 0}
              </p>
              <p className="text-[10px] text-white/40">Zones</p>
            </div>
          </div>

          {/* Refresh Button */}
          <button 
            className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all group"
            onClick={() => setForecastDate(new Date())}
          >
            <svg 
              className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
