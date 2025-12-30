/**
 * ============================================
 * Species Selector - PFZ Fish Species Panel
 * Glass-morphic species picker with preview
 * ============================================
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePFZStore, useSelectedSpeciesProfile } from '../../../../src/store/usePFZStore';
import { SPECIES_PROFILES } from '../../../../src/lib/pfz/types';
import type { SpeciesId } from '../../../../src/lib/pfz/types';
import type { ReactNode } from 'react';

// Fish icons for each species
const speciesIcons: Record<SpeciesId, ReactNode> = {
  indian_mackerel: (
    <svg className="w-full h-full" viewBox="0 0 64 32" fill="currentColor">
      <ellipse cx="28" cy="16" rx="22" ry="10" opacity="0.8"/>
      <path d="M50 16 L62 6 L62 26 Z" opacity="0.6"/>
      <circle cx="14" cy="14" r="2" fill="#050505"/>
      <path d="M28 8 Q38 4 42 8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
      <path d="M28 24 Q38 28 42 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  ),
  oil_sardine: (
    <svg className="w-full h-full" viewBox="0 0 64 32" fill="currentColor">
      <ellipse cx="30" cy="16" rx="20" ry="8" opacity="0.8"/>
      <path d="M50 16 L60 8 L60 24 Z" opacity="0.6"/>
      <circle cx="16" cy="14" r="1.5" fill="#050505"/>
      <line x1="24" y1="12" x2="44" y2="12" stroke="#050505" strokeWidth="0.5" opacity="0.3"/>
      <line x1="24" y1="16" x2="44" y2="16" stroke="#050505" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),
  yellowfin_tuna: (
    <svg className="w-full h-full" viewBox="0 0 64 32" fill="currentColor">
      <ellipse cx="28" cy="16" rx="24" ry="11" opacity="0.8"/>
      <path d="M52 16 L64 4 L64 28 Z" opacity="0.6"/>
      <path d="M28 2 L34 10 L22 10 Z" opacity="0.7"/>
      <path d="M28 30 L34 22 L22 22 Z" opacity="0.7"/>
      <circle cx="10" cy="14" r="2.5" fill="#050505"/>
    </svg>
  ),
  skipjack_tuna: (
    <svg className="w-full h-full" viewBox="0 0 64 32" fill="currentColor">
      <ellipse cx="28" cy="16" rx="22" ry="10" opacity="0.8"/>
      <path d="M50 16 L62 6 L62 26 Z" opacity="0.6"/>
      <circle cx="12" cy="14" r="2" fill="#050505"/>
      <line x1="20" y1="12" x2="45" y2="10" stroke="#050505" strokeWidth="1" opacity="0.4"/>
      <line x1="20" y1="16" x2="45" y2="16" stroke="#050505" strokeWidth="1" opacity="0.4"/>
      <line x1="20" y1="20" x2="45" y2="22" stroke="#050505" strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  threadfin_bream: (
    <svg className="w-full h-full" viewBox="0 0 64 32" fill="currentColor">
      <ellipse cx="30" cy="16" rx="18" ry="12" opacity="0.8"/>
      <path d="M48 16 L58 10 L58 22 Z" opacity="0.6"/>
      <path d="M30 2 L36 10 L24 10 Z" opacity="0.7"/>
      <circle cx="18" cy="14" r="2" fill="#050505"/>
      <path d="M30 8 L48 6" fill="none" stroke="#050505" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  ),
};

// Color schemes for each species
const speciesColors: Record<SpeciesId, { primary: string; glow: string; bg: string }> = {
  indian_mackerel: { primary: '#22d3ee', glow: 'rgba(34,211,238,0.3)', bg: 'rgba(34,211,238,0.1)' },
  oil_sardine: { primary: '#a3e635', glow: 'rgba(163,230,53,0.3)', bg: 'rgba(163,230,53,0.1)' },
  yellowfin_tuna: { primary: '#fbbf24', glow: 'rgba(251,191,36,0.3)', bg: 'rgba(251,191,36,0.1)' },
  skipjack_tuna: { primary: '#f97316', glow: 'rgba(249,115,22,0.3)', bg: 'rgba(249,115,22,0.1)' },
  threadfin_bream: { primary: '#ec4899', glow: 'rgba(236,72,153,0.3)', bg: 'rgba(236,72,153,0.1)' },
};

export default function SpeciesSelector() {
  const { selectedSpecies, setSelectedSpecies, comparisonSpecies, toggleComparisonSpecies } = usePFZStore();
  const profile = useSelectedSpeciesProfile();
  
  const speciesList = Object.keys(SPECIES_PROFILES) as SpeciesId[];

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="text-sm font-semibold tracking-tight">Target Species</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-white/40">
          {speciesList.length} Available
        </span>
      </div>

      {/* Species Grid */}
      <div className="grid grid-cols-1 gap-2">
        {speciesList.map((species) => {
          const sp = SPECIES_PROFILES[species];
          const colors = speciesColors[species];
          const isSelected = selectedSpecies === species;
          const isComparing = comparisonSpecies.includes(species);
          
          return (
            <motion.div
              key={species}
              onClick={() => setSelectedSpecies(species)}
              className={`relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/[0.02] border border-transparent hover:bg-white/5 hover:border-white/10'
              }`}
              style={isSelected ? { 
                boxShadow: `0 0 20px ${colors.glow}`,
                borderColor: `${colors.primary}50`,
              } : {}}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Fish Icon */}
              <div 
                className="w-12 h-6 flex-shrink-0"
                style={{ color: isSelected ? colors.primary : 'rgba(255,255,255,0.4)' }}
              >
                {speciesIcons[species]}
              </div>
              
              {/* Info */}
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                  {sp.name}
                </p>
                <p className="text-[10px] text-white/40 italic">
                  {sp.scientificName}
                </p>
              </div>
              
              {/* Selected Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </AnimatePresence>
              
              {/* Compare Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComparisonSpecies(species);
                }}
                className={`p-1 rounded transition-all ${
                  isComparing 
                    ? 'bg-white/20 text-white' 
                    : 'opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/60'
                }`}
                title="Add to comparison"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Species Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSpecies}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-3 rounded-xl border border-white/10"
          style={{ backgroundColor: speciesColors[selectedSpecies].bg }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-white/50">Optimal Conditions</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-white/60">SST:</span>
              <span className="font-medium" style={{ color: speciesColors[selectedSpecies].primary }}>
                {profile.preferences.sst.optimal}°C
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-white/60">Chl:</span>
              <span className="font-medium" style={{ color: speciesColors[selectedSpecies].primary }}>
                {profile.preferences.chlorophyll.optimal} mg/m³
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-white/60">Depth:</span>
              <span className="font-medium" style={{ color: speciesColors[selectedSpecies].primary }}>
                {profile.preferences.depth.optimal}m
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-white/60">DO:</span>
              <span className="font-medium" style={{ color: speciesColors[selectedSpecies].primary }}>
                &gt;{profile.preferences.dissolvedOxygen.min} mg/L
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
