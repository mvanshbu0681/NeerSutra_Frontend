/**
 * ============================================
 * Forecast Timeline - Time scrubber for forecasts
 * IOHD-EWS: +72h to +168h forecast control
 * ============================================
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEWSStore, useForecastProgress } from '../../../../src/store/useEWSStore';
import { HAZARD_CONFIG } from '../../../../src/lib/ews/types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Clock,
  Calendar,
  FastForward,
} from 'lucide-react';

export default function ForecastTimeline() {
  const { 
    activeHazard,
    currentForecastHour, 
    setForecastHour,
    isPlaying,
    togglePlayback,
    playbackSpeed,
    setPlaybackSpeed,
    stepForward,
    stepBackward,
    lastUpdated,
  } = useEWSStore();

  const hazardConfig = HAZARD_CONFIG[activeHazard];
  const { max: forecastHorizon } = useForecastProgress();
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [forecastTimeStr, setForecastTimeStr] = useState<string>('');

  const progress = forecastHorizon > 0 ? currentForecastHour / forecastHorizon : 0;

  // Calculate forecast time on client only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      now.setHours(now.getHours() + currentForecastHour);
      setForecastTimeStr(now.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentForecastHour]);

  // Handle slider interaction
  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const hour = Math.round((percent * forecastHorizon) / 3) * 3; // Snap to 3-hour intervals
    setForecastHour(hour);
  }, [forecastHorizon, setForecastHour]);

  // Speed options
  const speedOptions = [1, 2, 4];

  return (
    <motion.div 
      className="glass-panel rounded-2xl px-6 py-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-6">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={stepBackward}
            disabled={currentForecastHour <= 0}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipBack className="w-4 h-4 text-white/70" />
          </motion.button>

          <motion.button
            onClick={togglePlayback}
            className="p-3 rounded-xl transition-all"
            style={{
              background: isPlaying 
                ? `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`
                : 'rgba(255,255,255,0.1)',
              boxShadow: isPlaying ? `0 0 20px ${hazardConfig.accentColor}50` : 'none',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white/70" />
            )}
          </motion.button>

          <motion.button
            onClick={stepForward}
            disabled={currentForecastHour >= forecastHorizon}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipForward className="w-4 h-4 text-white/70" />
          </motion.button>
        </div>

        {/* Current Time Display */}
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-xl font-bold tabular-nums"
              style={{ color: hazardConfig.accentColor }}
            >
              T+{currentForecastHour}h
            </span>
          </div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            Forecast
          </span>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 px-4">
          <div 
            ref={sliderRef}
            className="relative h-8 cursor-pointer group"
            onClick={handleSliderClick}
          >
            {/* Track */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full bg-white/10">
              {/* Progress */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
                  boxShadow: `0 0 10px ${hazardConfig.accentColor}50`,
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Tick Marks */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0">
              {Array.from({ length: Math.floor(forecastHorizon / 24) + 1 }).map((_, i) => {
                const hour = i * 24;
                const tickProgress = hour / forecastHorizon;
                return (
                  <div 
                    key={i}
                    className="flex flex-col items-center"
                    style={{ 
                      position: 'absolute', 
                      left: `${tickProgress * 100}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className={`w-px h-2 ${hour <= currentForecastHour ? 'bg-white/40' : 'bg-white/20'}`} />
                    <span className="text-[9px] text-white/30 mt-1">
                      {hour}h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Thumb */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full cursor-grab active:cursor-grabbing"
              style={{
                left: `calc(${progress * 100}% - 8px)`,
                background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
                boxShadow: `0 0 15px ${hazardConfig.accentColor}80`,
                border: '2px solid white',
              }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          </div>
        </div>

        {/* Forecast Time */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Calendar className="w-4 h-4 text-white/40" />
          <span className="text-xs text-white/60">
            {forecastTimeStr || '—'}
          </span>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`
                px-2 py-1 rounded-md text-[10px] font-medium
                transition-all duration-150
                ${playbackSpeed === speed 
                  ? 'bg-white/15 text-white' 
                  : 'text-white/40 hover:text-white/60'
                }
              `}
            >
              {speed}×
            </button>
          ))}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[10px] text-white/30">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(lastUpdated).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
