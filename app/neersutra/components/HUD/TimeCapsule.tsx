'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { useTimeStore } from '../../store';
import { cn } from '../../types/utils';

interface TimeCapsuleProps {
  className?: string;
}

/**
 * TimeCapsule - Floating pill-shaped time slider
 * The 4D controller with a sleek, minimal design
 */
export function TimeCapsule({ className }: TimeCapsuleProps) {
  const {
    currentTime,
    timeRange,
    playbackSpeed,
    isPlaying,
    setCurrentTime,
    setPlaybackSpeed,
    togglePlayback,
    stepForward,
    stepBackward,
    resetToNow,
  } = useTimeStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Fix hydration mismatch - only render time on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const newTime = new Date(currentTime.getTime() + delta * playbackSpeed * 1000);
      
      if (newTime >= timeRange.end) {
        setCurrentTime(timeRange.end);
        togglePlayback();
      } else {
        setCurrentTime(newTime);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTickRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, currentTime, timeRange, setCurrentTime, togglePlayback]);

  const progress = ((currentTime.getTime() - timeRange.start.getTime()) /
    (timeRange.end.getTime() - timeRange.start.getTime())) * 100;

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const percent = parseFloat(e.target.value);
      const time = new Date(
        timeRange.start.getTime() +
          (percent / 100) * (timeRange.end.getTime() - timeRange.start.getTime())
      );
      setCurrentTime(time);
    },
    [timeRange, setCurrentTime]
  );

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const speedOptions = [
    { label: '1×', value: 1 },
    { label: '60×', value: 60 },
    { label: '1h', value: 3600 },
  ];

  return (
    <motion.div
      className={cn('glass-panel rounded-3xl overflow-hidden', className)}
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
        {/* Time Display */}
        <div className="flex flex-col min-w-[140px]">
          <span className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
            Simulation
          </span>
          <span className="font-mono text-lg font-semibold text-white tabular-nums">
            {isMounted ? formatTime(currentTime) : '-- --, --:--'}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => stepBackward(60)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>

          <motion.button
            onClick={togglePlayback}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-all',
              isPlaying 
                ? 'bg-[#22d3ee] text-black shadow-lg shadow-cyan-500/40' 
                : 'bg-white/10 text-white hover:bg-white/15'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>

          <motion.button
            onClick={() => stepForward(60)}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-4">
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
            {/* Progress fill with glow */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#22d3ee] to-[#2997ff] rounded-full shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              style={{ width: `${progress}%` }}
              layoutId="progress"
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
              onClick={() => setPlaybackSpeed(option.value)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-all',
                playbackSpeed === option.value
                  ? 'bg-[#22d3ee] text-black'
                  : 'text-[#64748b] hover:text-white'
              )}
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
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[#64748b]">Start: </span>
              <span className="font-mono text-[#94a3b8]">
                {formatTime(timeRange.start)}
              </span>
            </div>
            <div>
              <span className="text-[#64748b]">End: </span>
              <span className="font-mono text-[#94a3b8]">
                {formatTime(timeRange.end)}
              </span>
            </div>
          </div>
          <div className="text-[#64748b]">
            Forecast Window: 7 Days
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TimeCapsule;
