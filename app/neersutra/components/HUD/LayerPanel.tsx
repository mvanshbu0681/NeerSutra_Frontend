'use client';

import { motion } from 'framer-motion';
import {
  Layers,
  Ship,
  Wind,
  Waves,
  Navigation,
  AlertCircle,
  Map,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useMapStore } from '../../store';
import { cn } from '../../types/utils';
import type { LayerVisibility } from '../../types';

interface LayerPanelProps {
  className?: string;
}

/**
 * LayerPanel - Floating layer toggle panel
 * Minimal design with smooth animations
 */
export function LayerPanel({ className }: LayerPanelProps) {
  const { layerVisibility, toggleLayer } = useMapStore();

  const layers: {
    key: keyof LayerVisibility;
    label: string;
    icon: React.ReactNode;
    color: string;
    activeColor: string;
  }[] = [
    { key: 'aisTraffic', label: 'AIS Traffic', icon: <Ship className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#34d399]' },
    { key: 'weatherWind', label: 'Wind', icon: <Wind className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#22d3ee]' },
    { key: 'weatherWaves', label: 'Waves', icon: <Waves className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#2997ff]' },
    { key: 'weatherCurrents', label: 'Currents', icon: <Navigation className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#a78bfa]' },
    { key: 'routes', label: 'Routes', icon: <Map className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#fbbf24]' },
    { key: 'congestion', label: 'Congestion', icon: <AlertCircle className="w-4 h-4" />, color: 'text-[#64748b]', activeColor: 'text-[#f87171]' },
  ];

  return (
    <motion.div
      className={cn('glass-panel p-4 rounded-3xl w-48', className)}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
          <Layers className="w-4 h-4 text-[#22d3ee]" />
        </div>
        <span className="text-sm font-medium text-white">Layers</span>
      </div>

      {/* Layer List */}
      <div className="space-y-1">
        {layers.map((layer) => {
          const isActive = layerVisibility[layer.key];
          
          return (
            <motion.button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left',
                isActive
                  ? 'bg-white/5'
                  : 'hover:bg-white/[0.03]'
              )}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  'transition-colors',
                  isActive ? layer.activeColor : layer.color
                )}
              >
                {layer.icon}
              </div>
              <span
                className={cn(
                  'flex-1 text-sm transition-colors',
                  isActive ? 'text-white' : 'text-[#64748b]'
                )}
              >
                {layer.label}
              </span>
              <div className={cn(
                'transition-colors',
                isActive ? 'text-white' : 'text-[#475569]'
              )}>
                {isActive ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default LayerPanel;
