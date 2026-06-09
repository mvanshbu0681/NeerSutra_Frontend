'use client';

import { motion } from 'framer-motion';
import { Layers, Ship, Wind, Waves, Navigation, AlertCircle, Map, Eye, EyeOff } from 'lucide-react';
import { useMapStore } from '../../store';
import { cn } from '../../types/utils';
import type { LayerVisibility } from '../../types';

interface LayerPanelProps { className?: string }

const LAYERS: {
  key: keyof LayerVisibility;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}[] = [
  { key: 'aisTraffic',      label: 'AIS Traffic', icon: <Ship className="w-3.5 h-3.5" />,       accentColor: '#34d399' },
  { key: 'weatherWind',     label: 'Wind Field',  icon: <Wind className="w-3.5 h-3.5" />,        accentColor: '#22d3ee' },
  { key: 'weatherWaves',    label: 'Wave Height', icon: <Waves className="w-3.5 h-3.5" />,       accentColor: '#60a5fa' },
  { key: 'weatherCurrents', label: 'Currents',    icon: <Navigation className="w-3.5 h-3.5" />, accentColor: '#a78bfa' },
  { key: 'routes',          label: 'Routes',      icon: <Map className="w-3.5 h-3.5" />,         accentColor: '#fbbf24' },
  { key: 'congestion',      label: 'Congestion',  icon: <AlertCircle className="w-3.5 h-3.5" />, accentColor: '#f87171' },
];

export function LayerPanel({ className }: LayerPanelProps) {
  const { layerVisibility, toggleLayer } = useMapStore();

  return (
    <motion.div
      className={cn('glass-panel p-3 rounded-2xl w-44', className)}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
        <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-white/50" />
        </div>
        <span className="text-xs font-semibold text-white/80 tracking-tight">Layers</span>
      </div>

      {/* Rows */}
      <div className="space-y-0.5">
        {LAYERS.map((layer) => {
          const isActive = layerVisibility[layer.key];
          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all text-left',
                isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
              )}
            >
              {/* Icon */}
              <span
                className="transition-colors"
                style={{ color: isActive ? layer.accentColor : 'rgba(255,255,255,0.3)' }}
              >
                {layer.icon}
              </span>

              {/* Label */}
              <span
                className={cn(
                  'flex-1 text-[11px] font-medium transition-colors',
                  isActive ? 'text-white/90' : 'text-white/40'
                )}
              >
                {layer.label}
              </span>

              {/* Toggle dot */}
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  isActive ? 'opacity-100' : 'opacity-20'
                )}
                style={{ backgroundColor: isActive ? layer.accentColor : '#64748b' }}
              />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default LayerPanel;
