/**
 * ============================================
 * Hazard Selector - Multi-hazard mode switcher
 * IOHD-EWS: Oil, HAB, Cyclone, MHW, Rip Current
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { useEWSStore } from '../../../../src/store/useEWSStore';
import { HAZARD_CONFIG, type HazardType } from '../../../../src/lib/ews/types';
import { 
  Droplet, 
  FlaskConical, 
  CloudLightning, 
  Thermometer, 
  Waves,
  AlertCircle,
} from 'lucide-react';

const HAZARD_ICONS: Record<HazardType, React.ComponentType<{ className?: string }>> = {
  oil_spill: Droplet,
  hab: FlaskConical,
  cyclone: CloudLightning,
  mhw: Thermometer,
  rip_current: Waves,
};

export default function HazardSelector() {
  const { activeHazard, setActiveHazard, events, alerts } = useEWSStore();

  const hazardTypes: HazardType[] = ['oil_spill', 'hab', 'cyclone', 'mhw', 'rip_current'];

  return (
    <div className="glass-panel rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-white/90 tracking-wide">
            Hazard Type
          </h2>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-white/40">
          IOHD-EWS
        </div>
      </div>

      {/* Hazard Grid */}
      <div className="grid grid-cols-5 gap-2">
        {hazardTypes.map((hazardId) => {
          const config = HAZARD_CONFIG[hazardId];
          const Icon = HAZARD_ICONS[hazardId];
          const isActive = activeHazard === hazardId;
          const eventCount = events.filter(e => e.hazardType === hazardId).length;
          const alertCount = alerts.filter(a => a.event.hazardType === hazardId).length;

          return (
            <motion.button
              key={hazardId}
              onClick={() => setActiveHazard(hazardId)}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <div 
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-br shadow-lg` 
                    : 'bg-white/10'
                  }
                `}
                style={isActive ? {
                  backgroundImage: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})`,
                  boxShadow: `0 0 20px ${config.accentColor}50`,
                } : {}}
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white/60'}`} 
                />
              </div>

              {/* Label */}
              <span 
                className={`
                  text-[10px] font-medium uppercase tracking-wider
                  ${isActive ? 'text-white' : 'text-white/50'}
                `}
              >
                {config.shortName}
              </span>

              {/* Event Count Badge */}
              {eventCount > 0 && (
                <div 
                  className={`
                    absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                    rounded-full text-[10px] font-bold
                    flex items-center justify-center
                    ${alertCount > 0 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-white/20 text-white/80'
                    }
                  `}
                >
                  {eventCount}
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="hazard-indicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active Hazard Description */}
      <motion.div 
        key={activeHazard}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5"
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${HAZARD_CONFIG[activeHazard].gradientFrom}, ${HAZARD_CONFIG[activeHazard].gradientTo})`,
            }}
          >
            {(() => {
              const Icon = HAZARD_ICONS[activeHazard];
              return <Icon className="w-4 h-4 text-white" />;
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm font-semibold mb-0.5"
              style={{ color: HAZARD_CONFIG[activeHazard].accentColor }}
            >
              {HAZARD_CONFIG[activeHazard].name}
            </h3>
            <p className="text-[11px] text-white/50 leading-relaxed">
              {HAZARD_CONFIG[activeHazard].description}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Forecast</span>
            <span className="text-xs font-medium text-white/70">
              {HAZARD_CONFIG[activeHazard].forecastHorizon}h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Update</span>
            <span className="text-xs font-medium text-white/70">
              {HAZARD_CONFIG[activeHazard].updateInterval}h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Events</span>
            <span 
              className="text-xs font-medium"
              style={{ color: HAZARD_CONFIG[activeHazard].accentColor }}
            >
              {events.length}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
