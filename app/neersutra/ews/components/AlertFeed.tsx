/**
 * ============================================
 * Alert Feed - CAP Alert List with Severity
 * IOHD-EWS: Real-time hazard notifications
 * ============================================
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEWSStore, useFilteredAlerts } from '../../../../src/store/useEWSStore';
import { HAZARD_CONFIG, SEVERITY_CONFIG, type AlertSeverity } from '../../../../src/lib/ews/types';
import { 
  Bell, 
  Filter,
  X,
  Clock,
  MapPin,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';

const SEVERITY_ICONS: Record<AlertSeverity, React.ComponentType<{ className?: string }>> = {
  extreme: AlertTriangle,
  severe: AlertCircle,
  moderate: Info,
  minor: CheckCircle,
  unknown: Info,
};

export default function AlertFeed() {
  const { alertFilter, setAlertFilter, selectEvent, selectedEventId, dismissAlert } = useEWSStore();
  const alerts = useFilteredAlerts();
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const severityOptions: (AlertSeverity | 'all')[] = ['all', 'extreme', 'severe', 'moderate', 'minor'];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="glass-panel rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-white/70" />
            {alerts.length > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <h2 className="text-sm font-semibold text-white/90">
            Alert Feed
          </h2>
          <span className="text-xs text-white/40">
            ({alerts.length})
          </span>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-1">
          {severityOptions.map((severity) => (
            <button
              key={severity}
              onClick={() => setAlertFilter(severity)}
              className={`
                px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-medium
                transition-all duration-150
                ${alertFilter === severity 
                  ? severity === 'all'
                    ? 'bg-white/15 text-white'
                    : `text-white`
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }
              `}
              style={alertFilter === severity && severity !== 'all' ? {
                backgroundColor: `${SEVERITY_CONFIG[severity as AlertSeverity].color}25`,
                color: SEVERITY_CONFIG[severity as AlertSeverity].color,
              } : {}}
            >
              {severity === 'all' ? 'All' : severity.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-4"
            >
              <CheckCircle className="w-10 h-10 text-emerald-500/50 mb-3" />
              <p className="text-sm text-white/50">No active alerts</p>
              <p className="text-xs text-white/30 mt-1">
                {alertFilter !== 'all' ? 'Try changing the filter' : 'System is operating normally'}
              </p>
            </motion.div>
          ) : (
            alerts.map((alert, index) => {
              const severityConfig = SEVERITY_CONFIG[alert.event.severity];
              const hazardConfig = HAZARD_CONFIG[alert.event.hazardType];
              const SeverityIcon = SEVERITY_ICONS[alert.event.severity];
              const isExpanded = expandedAlert === alert.identifier;
              const isSelected = selectedEventId === alert.event.eventId;

              return (
                <motion.div
                  key={alert.identifier}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative mb-2 rounded-xl overflow-hidden
                    transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'ring-1 ring-white/30' 
                      : 'hover:bg-white/5'
                    }
                  `}
                  style={{
                    backgroundColor: `${severityConfig.bgColor}`,
                    borderLeft: `3px solid ${severityConfig.color}`,
                  }}
                  onClick={() => selectEvent(alert.event.eventId)}
                >
                  {/* Pulse animation for extreme/severe */}
                  {severityConfig.pulseAnimation && (
                    <div 
                      className="absolute inset-0 animate-pulse opacity-30 pointer-events-none"
                      style={{ backgroundColor: severityConfig.color }}
                    />
                  )}

                  <div className="relative p-3">
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${severityConfig.color}30` }}
                        >
                          <SeverityIcon 
                            className="w-3.5 h-3.5"
                          />
                        </div>
                        <div>
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: severityConfig.color }}
                          >
                            {alert.event.severity}
                          </span>
                          <span className="text-[10px] text-white/40 ml-2">
                            {hazardConfig.shortName}
                          </span>
                        </div>
                      </div>
                      
                      {/* Dismiss Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.identifier);
                        }}
                        className="p-1 rounded-md hover:bg-white/10 transition-colors"
                      >
                        <X className="w-3 h-3 text-white/40 hover:text-white/70" />
                      </button>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-medium text-white/90 mb-1 line-clamp-2">
                      {alert.headline}
                    </h3>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(alert.sent)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">
                          {alert.event.areaDescription}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <p className="text-xs text-white/60 mb-2">
                            {alert.description}
                          </p>
                          {alert.instruction && (
                            <div className="p-2 rounded-lg bg-white/5 text-xs text-white/70">
                              <strong className="text-white/90">Action: </strong>
                              {alert.instruction}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedAlert(isExpanded ? null : alert.identifier);
                      }}
                      className="mt-2 flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors"
                    >
                      <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                      <ChevronRight 
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
