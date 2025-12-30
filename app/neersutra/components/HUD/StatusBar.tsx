'use client';

import { Compass, Satellite, Radio } from 'lucide-react';
import { useTimeStore, useMapStore } from '../../store';
import { formatCoordinate } from '../../types/utils';

/**
 * StatusBar - Top HUD bar with system status
 */
export function StatusBar() {
  const { currentTime, isPlaying, playbackSpeed } = useTimeStore();
  const { viewState } = useMapStore();

  return (
    <div className="glass-panel rounded-xl px-4 py-2 flex items-center justify-between">
      {/* Left: System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">ONLINE</span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2 text-gray-400">
          <Satellite className="w-4 h-4" />
          <span className="text-xs font-mono">AIS FEED ACTIVE</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <Radio className="w-4 h-4" />
          <span className="text-xs font-mono">WEATHER SYNC</span>
        </div>
      </div>

      {/* Center: Title */}
      <div className="flex items-center gap-3">
        <Compass className="w-5 h-5 text-cyan-400" />
        <span className="font-bold text-white tracking-wider">NEERSUTRA</span>
        <span className="text-xs text-gray-500 font-mono">v1.0</span>
      </div>

      {/* Right: View Info */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">VIEW:</span>
          <span className="text-white">
            {formatCoordinate(viewState.latitude, 'lat')}, {formatCoordinate(viewState.longitude, 'lon')}
          </span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <span className="text-gray-500">ZOOM:</span>
          <span className="text-white">{viewState.zoom.toFixed(1)}</span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <span className="text-gray-500">TIME:</span>
          <span className={isPlaying ? 'text-cyan-400' : 'text-white'}>
            {isPlaying ? `▶ ${playbackSpeed}x` : '⏸'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
