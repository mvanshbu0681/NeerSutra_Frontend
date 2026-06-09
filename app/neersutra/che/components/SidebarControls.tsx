/**
 * CHE Sidebar Controls — Left Panel
 * Depth Selector · Layer Selection · Display Toggles
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  FlaskConical,
  Wind,
  Droplets,
  Layers,
  ChevronsDown,
  Eye,
  Lightbulb,
} from 'lucide-react';
import { useCHEStore, getDepthLabel, type CHELayerType } from '../../../../src/store/useCHEStore';
import { STANDARD_DEPTHS } from '../../../../src/lib/che/types';

// CHE section accent
const ACCENT = '#10b981'; // emerald

const LAYER_CONFIG: Record<CHELayerType, {
  label: string;
  color: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}> = {
  dzri: { label: 'DZRI', color: '#ef4444', Icon: AlertTriangle, description: 'Dead Zone Risk Index' },
  pei:  { label: 'PEI',  color: '#a855f7', Icon: FlaskConical,  description: 'Pollution-Eutrophication' },
  ors:  { label: 'ORS',  color: '#34d399', Icon: Wind,          description: 'Oxygen Resilience Score' },
  do:   { label: 'DO',   color: '#22d3ee', Icon: Droplets,      description: 'Dissolved Oxygen' },
  none: { label: 'None', color: '#6b7280', Icon: Layers,        description: 'No overlay' },
};

export default function SidebarControls() {
  const {
    selectedDepth,
    setSelectedDepth,
    activeLayer,
    setActiveLayer,
    layerOpacity,
    setLayerOpacity,
    showContours,
    toggleContours,
    showHypoxiaZones,
    toggleHypoxiaZones,
  } = useCHEStore();

  return (
    <div className="flex flex-col gap-3">
      {/* ── Depth Control ─────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ChevronsDown className="w-4 h-4" style={{ color: ACCENT }} />
            <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">
              Depth
            </h3>
          </div>
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color: ACCENT }}>
            {getDepthLabel(selectedDepth)}
          </span>
        </div>

        <div className="space-y-1">
          {STANDARD_DEPTHS.map((depth, index) => {
            const isSelected = depth === selectedDepth;
            return (
              <motion.button
                key={depth}
                onClick={() => setSelectedDepth(depth)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'border'
                    : 'bg-white/[0.04] border border-transparent hover:bg-white/[0.08]'
                }`}
                style={isSelected ? {
                  backgroundColor: `${ACCENT}14`,
                  borderColor: `${ACCENT}35`,
                } : {}}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: `linear-gradient(180deg, rgba(16,185,129,${0.25 - index * 0.03}) 0%, rgba(2,12,40,${0.3 + index * 0.05}) 100%)`,
                    color: isSelected ? ACCENT : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {index + 1}
                </div>
                <span className={`flex-1 text-left text-sm ${isSelected ? 'text-white font-medium' : 'text-white/55'}`}>
                  {getDepthLabel(depth)}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="depthDot"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ACCENT, boxShadow: `0 0 6px ${ACCENT}` }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Data Layer ────────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" style={{ color: ACCENT }} />
          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">
            Data Layer
          </h3>
        </div>

        <div className="space-y-1.5">
          {(Object.keys(LAYER_CONFIG) as CHELayerType[])
            .filter((l) => l !== 'none')
            .map((layer) => {
              const { label, color, Icon, description } = LAYER_CONFIG[layer];
              const isActive = layer === activeLayer;

              return (
                <motion.button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive ? 'border' : 'bg-white/[0.04] border border-transparent hover:bg-white/[0.08]'
                  }`}
                  style={isActive ? {
                    backgroundColor: `${color}12`,
                    borderColor: `${color}35`,
                  } : {}}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isActive ? `${color}20` : 'rgba(255,255,255,0.06)' }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? color : 'rgba(255,255,255,0.35)' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <span
                      className="text-sm font-medium block"
                      style={{ color: isActive ? color : 'rgba(255,255,255,0.65)' }}
                    >
                      {label}
                    </span>
                    <span className="text-[10px] text-white/35">{description}</span>
                  </div>
                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                    />
                  )}
                </motion.button>
              );
            })}
        </div>

        {/* Opacity Slider */}
        {activeLayer !== 'none' && (
          <div className="mt-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Opacity</span>
              <span className="text-[10px] font-mono text-white/60 tabular-nums">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0} max={1} step={0.05}
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* ── Display Options ───────────────────────────── */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-4 h-4" style={{ color: ACCENT }} />
          <h3 className="text-xs font-semibold text-white/80 uppercase tracking-widest">
            Display
          </h3>
        </div>
        <div className="space-y-2">
          <Toggle
            label="Contour Lines"
            description="Iso-concentration lines"
            isEnabled={showContours}
            onToggle={toggleContours}
            accent={ACCENT}
          />
          <Toggle
            label="Hypoxia Zones"
            description="Highlight DO < 2.0 mg/L"
            isEnabled={showHypoxiaZones}
            onToggle={toggleHypoxiaZones}
            accent="#ef4444"
          />
        </div>
      </div>

      {/* ── Tip ───────────────────────────────────────── */}
      <div className="glass-panel rounded-2xl p-3 flex items-start gap-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${ACCENT}18`, border: `1px solid ${ACCENT}30` }}
        >
          <Lightbulb className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        </div>
        <p className="text-[11px] text-white/45 leading-relaxed">
          Click anywhere on the map to analyse coastal health at that location.
        </p>
      </div>
    </div>
  );
}

function Toggle({
  label, description, isEnabled, onToggle, accent,
}: {
  label: string; description: string; isEnabled: boolean; onToggle: () => void; accent: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
    >
      <div className="text-left">
        <span className="text-sm text-white/75 block">{label}</span>
        <span className="text-[10px] text-white/35">{description}</span>
      </div>
      <div
        className="relative w-9 h-5 rounded-full transition-colors flex-shrink-0"
        style={{ backgroundColor: isEnabled ? `${accent}40` : 'rgba(255,255,255,0.10)' }}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full"
          animate={{ left: isEnabled ? 'calc(100% - 18px)' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            backgroundColor: isEnabled ? accent : 'rgba(255,255,255,0.55)',
            boxShadow: isEnabled ? `0 0 6px ${accent}` : 'none',
          }}
        />
      </div>
    </button>
  );
}
