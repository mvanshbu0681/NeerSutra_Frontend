/**
 * ============================================
 * Severity Filter - Filter map events by severity level
 * IOHD-EWS: Extreme, Severe, Moderate, Minor
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { useEWSStore, useFilteredEvents } from '../../../../src/store/useEWSStore';
import { SEVERITY_CONFIG, type AlertSeverity } from '../../../../src/lib/ews/types';
import { AlertTriangle, Filter } from 'lucide-react';

const SEVERITY_ORDER: (AlertSeverity | 'all')[] = ['all', 'extreme', 'severe', 'moderate', 'minor'];

export default function SeverityFilter() {
  const { severityFilter, setSeverityFilter } = useEWSStore();
  const events = useFilteredEvents();

  // Count events by severity
  const severityCounts = events.reduce((acc, event) => {
    acc[event.severity] = (acc[event.severity] || 0) + 1;
    return acc;
  }, {} as Record<AlertSeverity, number>);

  return (
    <div className="glass-panel rounded-xl p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-3.5 h-3.5 text-white/50" />
        <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
          Severity Filter
        </span>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        {SEVERITY_ORDER.map((severity) => {
          const isActive = severityFilter === severity;
          const count = severity === 'all' 
            ? events.length 
            : severityCounts[severity] || 0;
          
          const config = severity !== 'all' ? SEVERITY_CONFIG[severity] : null;
          const color = config?.color || '#94a3b8';
          const label = config?.label || 'All';

          return (
            <motion.button
              key={severity}
              onClick={() => setSeverityFilter(severity)}
              className={`
                relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                text-[11px] font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-white/15 border border-white/20' 
                  : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Severity Indicator Dot */}
              <div 
                className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                style={{ 
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                }}
              />
              
              {/* Label */}
              <span 
                className={isActive ? 'text-white' : 'text-white/60'}
                style={isActive ? { color } : {}}
              >
                {label}
              </span>

              {/* Count Badge */}
              {count > 0 && (
                <span 
                  className={`
                    ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-white/10 text-white/50'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active Filter Indicator */}
      {severityFilter !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 pt-2 border-t border-white/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle 
                className="w-3 h-3" 
                style={{ color: SEVERITY_CONFIG[severityFilter].color }}
              />
              <span className="text-[10px] text-white/40">
                Showing only <span className="text-white/70 font-medium">{SEVERITY_CONFIG[severityFilter].label}</span> events
              </span>
            </div>
            <button
              onClick={() => setSeverityFilter('all')}
              className="text-[10px] text-white/40 hover:text-white/60 underline transition-colors"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
