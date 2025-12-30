/**
 * ============================================
 * Layer Controls - Toggle Visualization Layers
 * IOHD-EWS: Map layer visibility controls
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { useEWSStore } from '../../../../src/store/useEWSStore';
import { HAZARD_CONFIG } from '../../../../src/lib/ews/types';

export default function LayerControls() {
  const {
    activeHazard,
    showProbabilityLayer,
    showParticles,
    showUncertaintyCone,
    toggleProbabilityLayer,
    toggleParticles,
    toggleUncertaintyCone,
  } = useEWSStore();

  const hazardConfig = HAZARD_CONFIG[activeHazard];

  const layers = [
    {
      id: 'probability',
      label: 'Probability',
      description: 'Hazard probability zones',
      enabled: showProbabilityLayer,
      toggle: toggleProbabilityLayer,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      alwaysShow: true,
    },
    {
      id: 'particles',
      label: 'Particles',
      description: 'Lagrangian particle trajectories',
      enabled: showParticles,
      toggle: toggleParticles,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      showFor: ['oil_spill'],
    },
    {
      id: 'uncertainty',
      label: 'Uncertainty',
      description: 'Forecast uncertainty cone',
      enabled: showUncertaintyCone,
      toggle: toggleUncertaintyCone,
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      showFor: ['cyclone'],
    },
  ];

  const visibleLayers = layers.filter(
    (layer) => layer.alwaysShow || layer.showFor?.includes(activeHazard)
  );

  return (
    <div className="glass-panel rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
          Layers
        </h4>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: hazardConfig.accentColor }}
        />
      </div>

      {visibleLayers.map((layer, idx) => (
        <motion.button
          key={layer.id}
          onClick={layer.toggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
            ${layer.enabled 
              ? 'bg-white/10 border border-white/20' 
              : 'bg-white/5 border border-transparent hover:bg-white/8'
            }
          `}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <div 
            className={`
              w-6 h-6 rounded-md flex items-center justify-center transition-all
              ${layer.enabled 
                ? 'text-white' 
                : 'text-white/40'
              }
            `}
            style={{
              background: layer.enabled 
                ? `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`
                : 'rgba(255,255,255,0.05)',
            }}
          >
            {layer.icon}
          </div>
          <div className="flex-1 text-left">
            <div 
              className={`text-xs font-medium transition-colors ${
                layer.enabled ? 'text-white' : 'text-white/50'
              }`}
            >
              {layer.label}
            </div>
            <div className="text-[10px] text-white/30">
              {layer.description}
            </div>
          </div>
          <div 
            className={`
              w-8 h-4 rounded-full transition-all p-0.5
              ${layer.enabled 
                ? 'bg-white/20' 
                : 'bg-white/5'
              }
            `}
          >
            <motion.div 
              className="w-3 h-3 rounded-full bg-white"
              animate={{ 
                x: layer.enabled ? 14 : 0,
                opacity: layer.enabled ? 1 : 0.3,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                boxShadow: layer.enabled ? `0 0 8px ${hazardConfig.accentColor}` : 'none',
              }}
            />
          </div>
        </motion.button>
      ))}
    </div>
  );
}
