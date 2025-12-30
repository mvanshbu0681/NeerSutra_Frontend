/**
 * ============================================
 * Event Detail Panel - Full event information
 * IOHD-EWS: Provenance, confidence, metrics
 * ============================================
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEWSStore } from '../../../../src/store/useEWSStore';
import { 
  HAZARD_CONFIG, 
  SEVERITY_CONFIG, 
  type HazardEvent,
} from '../../../../src/lib/ews/types';
import { 
  X,
  Clock,
  MapPin,
  Database,
  GitBranch,
  FileCode,
  BarChart3,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Activity,
} from 'lucide-react';

interface EventDetailPanelProps {
  event: HazardEvent;
}

export default function EventDetailPanel({ event }: EventDetailPanelProps) {
  const { selectEvent, showProvenance, toggleProvenance } = useEWSStore();
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'provenance' | 'metrics'>('overview');

  const hazardConfig = HAZARD_CONFIG[event.hazardType];
  const severityConfig = SEVERITY_CONFIG[event.severity];

  const handleCopyId = () => {
    navigator.clipboard.writeText(event.eventId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-panel rounded-2xl h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 border-b border-white/5"
        style={{ 
          background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}20, transparent)` 
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${hazardConfig.gradientFrom}, ${hazardConfig.gradientTo})`,
                boxShadow: `0 0 15px ${hazardConfig.accentColor}40`,
              }}
            >
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white/90">
                Event Details
              </h2>
              <span 
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: hazardConfig.accentColor }}
              >
                {hazardConfig.name}
              </span>
            </div>
          </div>
          <button
            onClick={() => selectEvent(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Event ID */}
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[11px] font-mono text-white/60 bg-black/30 px-2 py-1 rounded-md truncate">
            {event.eventId}
          </code>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            {copiedId ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white/50" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-white/5">
        {(['overview', 'provenance', 'metrics'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 px-3 py-1.5 rounded-lg text-[11px] font-medium uppercase tracking-wider
              transition-all duration-150
              ${activeTab === tab 
                ? 'bg-white/10 text-white' 
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Severity & Urgency */}
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: severityConfig.bgColor }}
                >
                  <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                    Severity
                  </span>
                  <span 
                    className="text-sm font-semibold uppercase"
                    style={{ color: severityConfig.color }}
                  >
                    {event.severity}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                    Urgency
                  </span>
                  <span className="text-sm font-semibold text-white/80 capitalize">
                    {event.urgency}
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <h3 className="text-sm font-medium text-white/90 mb-1">
                  {event.headline}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Time & Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/60">Detected:</span>
                  <span className="text-white/80">{formatDate(event.detectionTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-white/60">Area:</span>
                  <span className="text-white/80">{event.areaDescription}</span>
                </div>
              </div>

              {/* Affected Regions */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">
                  Affected Regions
                </span>
                <div className="flex flex-wrap gap-1">
                  {event.affectedRegions.map((region, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 rounded-md text-[11px] bg-white/10 text-white/70"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              {/* Forecast Polygons */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">
                  Forecast Timeline
                </span>
                <div className="space-y-1">
                  {event.polygons.slice(0, 5).map((poly, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-white/5"
                    >
                      <span className="text-white/60">
                        T+{i * 3}h
                      </span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden"
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${poly.probability * 100}%`,
                              backgroundColor: hazardConfig.accentColor,
                            }}
                          />
                        </div>
                        <span className="text-white/80 w-10 text-right">
                          {(poly.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'provenance' && (
            <motion.div
              key="provenance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Run ID */}
              <div className="p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="w-4 h-4 text-white/40" />
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Run ID
                  </span>
                </div>
                <code className="text-[11px] font-mono text-white/70">
                  {event.provenance.runId}
                </code>
              </div>

              {/* Models Used */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="w-4 h-4 text-white/40" />
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Models
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(event.provenance.models).map(([name, hash]) => (
                    <div 
                      key={name}
                      className="flex items-center justify-between text-xs py-1.5 px-2 rounded-md bg-white/5"
                    >
                      <span className="text-white/70">{name}</span>
                      <code className="text-[10px] font-mono text-white/40">
                        {hash}
                      </code>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-white/40" />
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    Data Tiles
                  </span>
                </div>
                <div className="space-y-1">
                  {event.provenance.dataTiles.map((tile, i) => (
                    <div 
                      key={i}
                      className="text-[11px] font-mono text-white/50 py-1 px-2 rounded-md bg-white/5 truncate"
                    >
                      {tile}
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Steps */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-2">
                  Processing Pipeline
                </span>
                <div className="flex flex-wrap gap-1">
                  {event.provenance.processingSteps.map((step, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 rounded-md text-[10px] font-mono bg-white/5 text-white/60"
                    >
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* Config Hash */}
              <div className="p-3 rounded-xl bg-white/5">
                <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                  Config Hash
                </span>
                <code className="text-[10px] font-mono text-white/50 break-all">
                  {event.provenance.configHash}
                </code>
              </div>
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-white/40" />
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Validation Metrics
                </span>
              </div>

              {event.validationMetrics ? (
                <div className="grid grid-cols-2 gap-2">
                  {/* Brier Score (Mandatory) */}
                  <div className="p-3 rounded-xl bg-white/5 col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Brier Score</span>
                      <span 
                        className="text-lg font-semibold"
                        style={{ 
                          color: (event.validationMetrics.brierScore ?? 0) < 0.1 
                            ? '#22c55e' 
                            : (event.validationMetrics.brierScore ?? 0) < 0.2 
                              ? '#eab308' 
                              : '#ef4444' 
                        }}
                      >
                        {event.validationMetrics.brierScore?.toFixed(3) ?? 'N/A'}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-1">
                      Lower is better. &lt;0.1 = Excellent
                    </p>
                  </div>

                  {/* Other Metrics */}
                  {event.validationMetrics.iou !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                        IoU
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {(event.validationMetrics.iou * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {event.validationMetrics.rocAuc !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                        ROC AUC
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {event.validationMetrics.rocAuc.toFixed(3)}
                      </span>
                    </div>
                  )}

                  {event.validationMetrics.pod !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                        POD
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {(event.validationMetrics.pod * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {event.validationMetrics.far !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                        FAR
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {(event.validationMetrics.far * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {event.validationMetrics.hk !== undefined && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                        HK Score
                      </span>
                      <span className="text-sm font-semibold text-white/80">
                        {event.validationMetrics.hk.toFixed(3)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">
                  No validation metrics available
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
