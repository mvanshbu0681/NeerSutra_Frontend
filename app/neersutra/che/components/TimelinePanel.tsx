/**
 * ============================================
 * CHE Timeline Panel - Floating Time Capsule
 * Sleek pill-shaped time controller (matches main map)
 * ============================================
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { useCHEStore, type TimeMode } from '../../../../src/store/useCHEStore';

export default function TimelinePanel() {
  const { 
    selectedTime, 
    setSelectedTime, 
    timeMode, 
    setTimeMode,
    advanceTime,
    isAnimating,
    toggleAnimation,
    animationSpeed,
    setAnimationSpeed,
  } = useCHEStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define time range (24 hour window centered on selectedTime to avoid hydration issues)
  const timeRange = {
    start: new Date(selectedTime.getTime() - 12 * 60 * 60 * 1000),
    end: new Date(selectedTime.getTime() + 12 * 60 * 60 * 1000),
  };

  // Animation loop for playback
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Advance by delta * speed hours
      const hoursToAdvance = (delta * animationSpeed) / 3600;
      advanceTime(hoursToAdvance);

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTickRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, advanceTime]);

  // Calculate progress percentage
  const progress = Math.max(0, Math.min(100, 
    ((selectedTime.getTime() - timeRange.start.getTime()) /
    (timeRange.end.getTime() - timeRange.start.getTime())) * 100
  ));

  // Handle slider change
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const percent = parseFloat(e.target.value);
      const time = new Date(
        timeRange.start.getTime() +
          (percent / 100) * (timeRange.end.getTime() - timeRange.start.getTime())
      );
      setSelectedTime(time);
    },
    [timeRange, setSelectedTime]
  );

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Reset to current time
  const resetToNow = () => {
    setSelectedTime(new Date());
    setTimeMode('realtime');
  };

  const speedOptions = [
    { label: '1×', value: 1 },
    { label: '60×', value: 60 },
    { label: '1h', value: 3600 },
  ];

  const timeModeLabels: Record<TimeMode, { icon: string; label: string }> = {
    realtime: { icon: '⚡', label: 'Live' },
    historical: { icon: '📜', label: 'Past' },
    forecast: { icon: '🔮', label: 'Forecast' },
  };

  return (
    <motion.div
      className="glass-panel rounded-3xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        delay: 0.3 
      }}
      layout
    >
      {/* Main Controls */}
      <div className="flex items-center gap-4 px-6 py-4">
        
        {/* Time Mode Selector (Compact Pills) */}
        <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
          {(['realtime', 'historical', 'forecast'] as TimeMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeMode(mode)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5
                ${timeMode === mode
                  ? 'bg-cyan-500 text-black'
                  : 'text-[#64748b] hover:text-white'
                }
              `}
            >
              <span>{timeModeLabels[mode].icon}</span>
              <span>{timeModeLabels[mode].label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* Time Display */}
        <div className="flex flex-col min-w-[140px]">
          <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
            Analysis Time
          </span>
          <span className="font-mono text-lg font-semibold text-white tabular-nums">
            {formatTime(selectedTime)}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => advanceTime(-1)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Step back 1 hour"
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={toggleAnimation}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all
              ${isAnimating 
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40' 
                : 'bg-white/10 text-white hover:bg-white/15'
              }
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isAnimating ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            onClick={() => advanceTime(1)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Step forward 1 hour"
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
            {/* Progress fill with glow */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
              layoutId="che-progress"
            />
            
            {/* Slider input (invisible but functional) */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-black/20 rounded-full p-1">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setAnimationSpeed(option.value)}
              className={`
                px-3 py-1 text-xs font-medium rounded-full transition-all
                ${animationSpeed === option.value
                  ? 'bg-cyan-500 text-black'
                  : 'text-[#64748b] hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Reset */}
        <motion.button
          onClick={resetToNow}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Reset to now"
        >
          <RotateCcw className="w-4 h-4" />
        </motion.button>

        {/* Expand Toggle */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Expanded Details */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-white/5"
      >
        <div className="px-6 py-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[#64748b]">Range: </span>
              <span className="font-mono text-[#94a3b8]">
                {formatTime(timeRange.start)} → {formatTime(timeRange.end)}
              </span>
            </div>
            <div>
              <span className="text-[#64748b]">Mode: </span>
              <span className="font-mono text-cyan-400">
                {timeModeLabels[timeMode].label}
              </span>
            </div>
          </div>
          <div className="text-[#64748b]">
            CHE Forecast Window: ±12 Hours
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
