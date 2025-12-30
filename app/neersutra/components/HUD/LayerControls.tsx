'use client';

import {
  Layers,
  Ship,
  Wind,
  Waves,
  Navigation,
  AlertCircle,
  Map,
} from 'lucide-react';
import { useMapStore } from '../../store';
import { cn } from '../../types/utils';
import type { LayerVisibility } from '../../types';

/**
 * LayerControls - Toggle visibility of map layers
 */
export function LayerControls() {
  const { layerVisibility, toggleLayer } = useMapStore();

  const layers: {
    key: keyof LayerVisibility;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    { key: 'aisTraffic', label: 'AIS Traffic', icon: <Ship className="w-4 h-4" />, color: 'text-emerald-400' },
    { key: 'weatherWind', label: 'Wind', icon: <Wind className="w-4 h-4" />, color: 'text-cyan-400' },
    { key: 'weatherWaves', label: 'Waves', icon: <Waves className="w-4 h-4" />, color: 'text-blue-400' },
    { key: 'weatherCurrents', label: 'Currents', icon: <Navigation className="w-4 h-4" />, color: 'text-purple-400' },
    { key: 'routes', label: 'Routes', icon: <Map className="w-4 h-4" />, color: 'text-amber-400' },
    { key: 'congestion', label: 'Congestion', icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400' },
  ];

  return (
    <div className="glass-panel rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
        <Layers className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono text-gray-400">LAYERS</span>
      </div>

      <div className="space-y-1">
        {layers.map((layer) => (
          <button
            key={layer.key}
            onClick={() => toggleLayer(layer.key)}
            className={cn(
              'w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left',
              layerVisibility[layer.key]
                ? 'bg-white/10 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            )}
          >
            <div
              className={cn(
                'transition-colors',
                layerVisibility[layer.key] ? layer.color : 'text-gray-600'
              )}
            >
              {layer.icon}
            </div>
            <span className="text-xs">{layer.label}</span>
            <div
              className={cn(
                'ml-auto w-2 h-2 rounded-full transition-colors',
                layerVisibility[layer.key] ? 'bg-emerald-400' : 'bg-gray-600'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default LayerControls;
