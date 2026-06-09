'use client';

import { motion } from 'framer-motion';
import { X, Ship, Compass, Gauge, Anchor, ExternalLink, MapPin } from 'lucide-react';
import { useMapStore } from '../../store';
import { cn } from '../../types/utils';
import { formatCoordinate } from '../../types/utils';
import type { AISData } from '../../types';

const SHIP_TYPE_ACCENT: Record<string, string> = {
  Cargo:     '#34d399',
  Tanker:    '#fbbf24',
  Container: '#60a5fa',
  Passenger: '#a78bfa',
  Fishing:   '#22d3ee',
  Other:     '#94a3b8',
};

/**
 * ShipCalloutCard — no self-positioning; parent layout controls placement via
 * AnimatePresence + motion.div in NeerSutraLayoutV2.
 */
export function ShipCalloutCard() {
  const { selectedShip, setSelectedShip } = useMapStore();

  if (!selectedShip) return null;

  const accent = SHIP_TYPE_ACCENT[selectedShip.shipType] ?? SHIP_TYPE_ACCENT.Other;

  return (
    <div className="w-72 glass-panel rounded-2xl overflow-hidden">
      {/* Thin accent line at top */}
      <div className="h-[2px] w-full" style={{ background: accent }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accent}20`, border: `1px solid ${accent}40` }}
          >
            <Ship className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: accent }}
            >
              {selectedShip.shipType}
            </p>
            <p className="font-mono text-sm font-bold text-white leading-tight">
              {selectedShip.MMSI}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSelectedShip(null)}
          className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/50" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Position */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">Position</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Latitude"  value={formatCoordinate(selectedShip.latitude, 'lat')} />
            <Metric label="Longitude" value={formatCoordinate(selectedShip.longitude, 'lon')} />
          </div>
        </div>

        {/* Movement */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Compass className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">Movement</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Speed"   value={`${selectedShip.SOG.toFixed(1)} kn`} />
            <Metric label="Course"  value={`${selectedShip.COG.toFixed(0)}°`} />
            <Metric label="Heading" value={`${selectedShip.heading.toFixed(0)}°`} />
          </div>
        </div>

        {/* Vessel */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Anchor className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">Vessel</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Length" value={`${selectedShip.length.toFixed(0)} m`} />
            <Metric label="Beam"   value={`${selectedShip.beam.toFixed(0)} m`} />
            <Metric label="Draft"  value={`${selectedShip.draft.toFixed(1)} m`} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: `${accent}22`,
            border: `1px solid ${accent}40`,
            color: accent,
          }}
        >
          Track Vessel
        </button>
        <button className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/[0.08]">
          <ExternalLink className="w-4 h-4 text-white/50" />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.05]">
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/35 block mb-0.5">
        {label}
      </span>
      <span className="font-mono text-xs font-semibold text-white/90">{value}</span>
    </div>
  );
}

export default ShipCalloutCard;
