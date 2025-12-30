'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, Clock } from 'lucide-react';
import { useTimeStore } from '../../store';
import { cn } from '../../types/utils';

/**
 * TimeSlider - The 4D Time Scrubber
 * Controls the global time state for weather interpolation and ship positions
 */
export function TimeSlider() {
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

  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

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
      const delta = (now - lastTickRef.current) / 1000; // seconds since last tick
      lastTickRef.current = now;

      // Advance time by delta * playbackSpeed seconds
      const newTime = new Date(currentTime.getTime() + delta * playbackSpeed * 1000);
      
      if (newTime >= timeRange.end) {
        setCurrentTime(timeRange.end);
        togglePlayback(); // Stop at end
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

  // Calculate slider position (0-100)
  const progress = ((currentTime.getTime() - timeRange.start.getTime()) /
    (timeRange.end.getTime() - timeRange.start.getTime())) * 100;

  // Handle slider change
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

  // Format time display
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Speed presets
  const speedPresets = [
    { label: '1x', value: 1 },
    { label: '1m/s', value: 60 },
    { label: '1h/s', value: 3600 },
  ];

  return (
    <div className="glass-panel rounded-xl p-4">
      {/* Current Time Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm text-gray-400">SIMULATION TIME</span>
        </div>
        <span className="font-mono text-lg text-white font-bold">
          {formatDateTime(currentTime)}
        </span>
      </div>

      {/* Time Slider */}
      <div className="relative mb-4">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-cyan-400
                     [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-125"
        />
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg pointer-events-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Time Range Labels */}
      <div className="flex justify-between text-xs font-mono text-gray-500 mb-4">
        <span>{formatDateTime(timeRange.start)}</span>
        <span>{formatDateTime(timeRange.end)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => stepBackward(60)}
            className="hud-button p-2"
            title="Step back 1 hour"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlayback}
            className={cn(
              'hud-button p-3 rounded-full',
              isPlaying && 'bg-cyan-500/30 border-cyan-400'
            )}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => stepForward(60)}
            className="hud-button p-2"
            title="Step forward 1 hour"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={resetToNow}
            className="hud-button p-2 ml-2"
            title="Reset to now"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">SPEED:</span>
          {speedPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setPlaybackSpeed(preset.value)}
              className={cn(
                'px-2 py-1 text-xs font-mono rounded transition-all',
                playbackSpeed === preset.value
                  ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TimeSlider;
