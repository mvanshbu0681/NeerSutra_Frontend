/**
 * ============================================
 * Mission Dashboard - REVAMPED
 * Actionable insights for NeerSutra
 * ============================================
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Waves,
  Fish,
  Ship,
  Activity,
  TrendingUp,
  Anchor,
  Thermometer,
  Droplet,
  Gauge,
  Target,
  Zap,
  Shield,
  Navigation,
  Users,
  Clock,
  DollarSign,
  Fuel,
  Wrench,
  MapPin,
  ChevronDown,
} from 'lucide-react';

// Hooks & Components
import { useDashboardData } from '../hooks/useDashboardData';
import DashboardControls from './DashboardControls';

// ─────────────────────────────────────────────────────────────
// Color Definitions
// ─────────────────────────────────────────────────────────────

const MISSION_COLORS = {
  ews: '#ef4444',
  che: '#10b981',
  pfz: '#f59e0b',
  fleet: '#3b82f6',
};

// ─────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
        <p className="font-semibold text-white text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || entry.fill }} className="text-xs">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────────
// EWS Charts Section - REVAMPED
// ─────────────────────────────────────────────────────────────

interface EWSChartProps {
  impactMatrix: any[];
  forecastReliability: any[];
  populationAtRisk: any[];
  activeThreats: {
    total: number;
    immediate: number;
    critical: number;
    totalPopulation: number;
  };
}

function EWSChartsSection({ impactMatrix, forecastReliability, populationAtRisk, activeThreats }: EWSChartProps) {
  return (
    <div className="space-y-8">
      {/* Header with actionable summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Hazard Watch</h2>
          <p className="text-white/50 text-sm">Active threats requiring attention</p>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-red-400">{activeThreats.critical}</span>
            <p className="text-white/40 text-xs">Critical</p>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-amber-400">{activeThreats.immediate}</span>
            <p className="text-white/40 text-xs">Immediate</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-cyan-400">{(activeThreats.totalPopulation / 1000000).toFixed(1)}M</span>
            <p className="text-white/40 text-xs">People at Risk</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impact Severity Matrix - Scatter Plot */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Impact Severity Matrix
          </h3>
          <p className="text-white/40 text-xs mb-4">Urgency vs Severity - Top-right = Immediate Action</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="hoursToLandfall" 
                  name="Hours to Impact" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  domain={[0, 80]}
                  reversed
                  label={{ value: 'Hours to Impact →', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="severity" 
                  name="Severity" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(v) => ['', 'Minor', 'Mod', 'Severe', 'Extreme'][v] || ''}
                />
                {/* Danger zone highlight */}
                <ReferenceArea x1={0} x2={24} y1={3} y2={5} fill="#ef4444" fillOpacity={0.1} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
                          <p className="font-semibold text-white">{data.name}</p>
                          <p className="text-white/60 text-xs">{data.severityLabel} • {data.hoursToLandfall}h to impact</p>
                          <p className="text-amber-400 text-xs mt-1">{(data.population / 1000000).toFixed(2)}M people at risk</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Hazards" 
                  data={impactMatrix} 
                  fill="#ef4444"
                >
                  {impactMatrix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Population at Risk - Horizontal Bar */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Population at Risk
          </h3>
          <p className="text-white/40 text-xs mb-4">Estimated population in hazard paths</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={populationAtRisk} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <YAxis 
                  type="category" 
                  dataKey="hazardName" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10} 
                  width={100}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
                          <p className="font-semibold text-white">{data.hazardName}</p>
                          <p className="text-amber-400">{data.population.toLocaleString()} people</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="population" radius={[0, 4, 4, 0]}>
                  {populationAtRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Reliability Trend */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Forecast Reliability Trend
          </h3>
          <p className="text-white/40 text-xs mb-4">Model accuracy improves as event approaches (lower deviation = better)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastReliability}>
                <defs>
                  <linearGradient id="deviationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} domain={[0, 40]} tickFormatter={(v) => `${v}km`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={10} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Acceptable', fill: '#22c55e', fontSize: 10 }} />
                <Area
                  type="monotone"
                  dataKey="deviation"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#deviationGradient)"
                  name="Path Deviation (km)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHE Charts Section - REVAMPED
// ─────────────────────────────────────────────────────────────

interface CHEChartProps {
  pollutantBreakdown: any[];
  safeWindow: any[];
  sourceAttribution: any[];
  dzriScore: number;
  selectedZone: string;
  coastalZones: string[];
  onZoneChange: (zone: string) => void;
}

function CHEChartsSection({ 
  pollutantBreakdown, 
  safeWindow, 
  sourceAttribution, 
  dzriScore, 
  selectedZone,
  coastalZones,
  onZoneChange 
}: CHEChartProps) {
  const [isZoneOpen, setIsZoneOpen] = useState(false);
  const safeHours = safeWindow.filter(h => h.isSafe).length;

  return (
    <div className="space-y-8">
      {/* Header with zone selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Coastal Health</h2>
          <p className="text-white/50 text-sm">Zone-specific water quality analysis</p>
        </div>
        
        {/* Zone Selector */}
        <div className="relative ml-4">
          <button
            onClick={() => setIsZoneOpen(!isZoneOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{selectedZone}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isZoneOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isZoneOpen && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[200px]">
              {coastalZones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => {
                    onZoneChange(zone);
                    setIsZoneOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedZone === zone 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <span className={`text-3xl font-bold ${dzriScore > 60 ? 'text-red-400' : dzriScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {dzriScore}%
            </span>
            <p className="text-white/40 text-xs">DZRI Score</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-cyan-400">{safeHours}h</span>
            <p className="text-white/40 text-xs">Safe Hours Today</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pollutant Breakdown - Stacked Bar */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-purple-400" />
            Pollutant Breakdown
          </h3>
          <p className="text-white/40 text-xs mb-4">What's causing pollution in {selectedZone}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="zone" stroke="rgba(255,255,255,0.5)" fontSize={10} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="oil" name="Oil" stackId="a" fill="#7c3aed" />
                <Bar dataKey="algae" name="Algae" stackId="a" fill="#22c55e" />
                <Bar dataKey="sewage" name="Sewage" stackId="a" fill="#84cc16" />
                <Bar dataKey="industrial" name="Industrial" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Attribution - Pie */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Pollution Sources
          </h3>
          <p className="text-white/40 text-xs mb-4">Where is the pollution coming from?</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceAttribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="percentage"
                  label={({ source, percentage }) => `${source}: ${percentage}%`}
                  labelLine={false}
                >
                  {sourceAttribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safe Window Timeline */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Safe Activity Window
          </h3>
          <p className="text-white/40 text-xs mb-4">Green = Safe for swimming/fishing (DO {'>'}4.5 mg/L, Temp 22-30°C)</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeWindow}>
                <defs>
                  <linearGradient id="doGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" fontSize={10} interval={2} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={4.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Min Safe DO', fill: '#ef4444', fontSize: 10 }} />
                {/* Highlight safe periods */}
                {safeWindow.map((entry, i) => (
                  entry.isSafe && (
                    <ReferenceArea 
                      key={i}
                      x1={entry.hour} 
                      x2={safeWindow[i + 1]?.hour || entry.hour}
                      fill="#22c55e"
                      fillOpacity={0.1}
                    />
                  )
                ))}
                <Line type="monotone" dataKey="doLevel" stroke="#22c55e" strokeWidth={2} name="DO Level (mg/L)" dot={false} />
                <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temp (°C)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PFZ Charts Section - REVAMPED
// ─────────────────────────────────────────────────────────────

interface PFZChartProps {
  cpueForecast: any[];
  fuelCatchROI: any[];
  marketPrice: any[];
  bestZone: { zone: string; roi: number; predictedRevenue: number };
  selectedSpecies: string;
  fishSpecies: string[];
  onSpeciesChange: (species: string) => void;
}

function PFZChartsSection({ 
  cpueForecast, 
  fuelCatchROI, 
  marketPrice, 
  bestZone,
  selectedSpecies,
  fishSpecies,
  onSpeciesChange
}: PFZChartProps) {
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header with species selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Fish className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Fishing Zones</h2>
          <p className="text-white/50 text-sm">Optimal fishing decisions</p>
        </div>
        
        {/* Species Selector */}
        <div className="relative ml-4">
          <button
            onClick={() => setIsSpeciesOpen(!isSpeciesOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 hover:bg-amber-500/30 transition-all"
          >
            <Fish className="w-4 h-4" />
            <span className="font-medium">{selectedSpecies}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isSpeciesOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSpeciesOpen && (
            <div className="absolute top-full mt-2 left-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
              {fishSpecies.map((species) => (
                <button
                  key={species}
                  onClick={() => {
                    onSpeciesChange(species);
                    setIsSpeciesOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedSpecies === species 
                      ? 'bg-amber-500/20 text-amber-400' 
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {species}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-400">{bestZone.zone}</span>
            <p className="text-white/40 text-xs">Best ROI Zone</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-amber-400">₹{(bestZone.predictedRevenue / 1000).toFixed(1)}K</span>
            <p className="text-white/40 text-xs">Est. Revenue</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPUE Forecast - Bar Chart */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Catch Per Unit Effort (CPUE)
          </h3>
          <p className="text-white/40 text-xs mb-4">Predicted tons/hour by zone</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpueForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="zone" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cpue" name="CPUE (tons/hr)" radius={[4, 4, 0, 0]}>
                  {cpueForecast.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel vs Catch ROI - Scatter */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-400" />
            Fuel vs Catch ROI
          </h3>
          <p className="text-white/40 text-xs mb-4">Top-left = Best ROI (high catch, low distance)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  dataKey="distance" 
                  name="Distance" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  label={{ value: 'Distance (km)', position: 'bottom', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="predictedCatch" 
                  name="Catch" 
                  stroke="rgba(255,255,255,0.5)" 
                  fontSize={10}
                  label={{ value: 'Catch (tons)', angle: -90, position: 'left', fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
                          <p className="font-semibold text-white">{data.zone}</p>
                          <p className="text-white/60 text-xs">{data.distance}km • {data.predictedCatch} tons</p>
                          <p className="text-emerald-400 text-xs mt-1">ROI: {data.roi.toFixed(2)}x</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Zones" data={fuelCatchROI}>
                  {fuelCatchROI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Price Correlation */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Market Price Correlation
          </h3>
          <p className="text-white/40 text-xs mb-4">What to catch today based on predicted catch × current market price</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketPrice}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="species" stroke="rgba(255,255,255,0.5)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl p-3 shadow-xl">
                          <p className="font-semibold text-white">{data.species}</p>
                          <p className="text-white/60 text-xs">Catch: {data.predictedCatch} tons @ ₹{data.marketPrice}/kg</p>
                          <p className="text-emerald-400 text-sm mt-1">Est. Revenue: ₹{data.revenue.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" name="Est. Revenue (₹)" radius={[4, 4, 0, 0]}>
                  {marketPrice.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Fleet Charts Section - REVAMPED
// ─────────────────────────────────────────────────────────────

interface FleetChartProps {
  utilization: any[];
  fuelEfficiency: any[];
  maintenanceHealth: any[];
  optimizationSavings: any[];
  summary: {
    totalVessels: number;
    activeVessels: number;
    utilizationRate: number;
    inefficientVessels: number;
    criticalMaintenanceAlerts: number;
  };
}

function FleetChartsSection({ 
  utilization, 
  fuelEfficiency, 
  maintenanceHealth, 
  optimizationSavings,
  summary 
}: FleetChartProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Ship className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Fleet Tracking</h2>
          <p className="text-white/50 text-sm">Operational efficiency & maintenance</p>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="text-center">
            <span className="text-3xl font-bold text-cyan-400">{summary.activeVessels}/{summary.totalVessels}</span>
            <p className="text-white/40 text-xs">Active Vessels</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-400">{summary.utilizationRate}%</span>
            <p className="text-white/40 text-xs">Utilization</p>
          </div>
          <div className="text-center">
            <span className={`text-2xl font-bold ${summary.criticalMaintenanceAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {summary.criticalMaintenanceAlerts}
            </span>
            <p className="text-white/40 text-xs">Critical Alerts</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Utilization - Pie */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            Fleet Utilization
          </h3>
          <p className="text-white/40 text-xs mb-4">How fleet time is being spent</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilization}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="percentage"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  labelLine={false}
                >
                  {utilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Efficiency Leaderboard */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-blue-400" />
            Fuel Efficiency Leaderboard
          </h3>
          <p className="text-white/40 text-xs mb-4">Liters per ton of catch (lower = better)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelEfficiency} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <YAxis type="category" dataKey="vesselName" stroke="rgba(255,255,255,0.5)" fontSize={10} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="litersPerTon" name="L/ton" radius={[0, 4, 4, 0]}>
                  {fuelEfficiency.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Health Heatmap */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            Maintenance Health
          </h3>
          <p className="text-white/40 text-xs mb-4">System health by vessel (red = critical)</p>
          <div className="grid grid-cols-5 gap-1">
            <div></div>
            {['Engine', 'Hull', 'Elec', 'Refrig'].map(sys => (
              <div key={sys} className="text-center text-white/50 text-xs">{sys}</div>
            ))}
            {['Sagarmitra', 'Matsya-07', 'Ocean Star', 'Jaldhara'].map(vessel => (
              <React.Fragment key={vessel}>
                <div className="text-white/70 text-xs truncate pr-1">{vessel.split(' ')[0]}</div>
                {maintenanceHealth
                  .filter(m => m.vessel === vessel.split(' ')[0] || m.vessel === vessel)
                  .slice(0, 4)
                  .map((cell, i) => (
                    <div
                      key={i}
                      className="h-10 rounded flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: cell.fill + '40', color: cell.fill }}
                      title={`${cell.system}: ${cell.health}%`}
                    >
                      {cell.health}
                    </div>
                  ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Route Optimization Savings */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            AI Route Optimization Savings
          </h3>
          <p className="text-white/40 text-xs mb-4">This month vs manual routing</p>
          <div className="space-y-4">
            {optimizationSavings.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-white/70">{item.metric}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold" style={{ color: item.fill }}>
                    {item.value.toLocaleString()}
                  </span>
                  <span className="text-white/50 text-sm">{item.unit}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────

export default function MissionDashboard() {
  const [activeTab, setActiveTab] = useState<'ews' | 'che' | 'pfz' | 'fleet'>('ews');
  const [isClient, setIsClient] = useState(false);

  // Get dashboard data from hook
  const {
    filters,
    updateFilters,
    resetFilters,
    toggleLiveMode,
    coastalZones,
    fishSpecies,
    ewsImpactMatrix,
    ewsForecastReliability,
    ewsPopulationAtRisk,
    ewsActiveThreats,
    chePollutantBreakdown,
    cheSafeWindow,
    cheSourceAttribution,
    cheZoneDZRI,
    pfzCPUEForecast,
    pfzFuelCatchROI,
    pfzMarketPrice,
    pfzBestZone,
    fleetUtilization,
    fleetFuelEfficiency,
    fleetMaintenanceHealth,
    fleetOptimizationSavings,
    fleetSummary,
    summaryStats,
  } = useDashboardData();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const tabs = [
    { id: 'ews', label: 'Hazard Watch', icon: AlertTriangle, color: MISSION_COLORS.ews },
    { id: 'che', label: 'Coastal Health', icon: Waves, color: MISSION_COLORS.che },
    { id: 'pfz', label: 'Fishing Zones', icon: Fish, color: MISSION_COLORS.pfz },
    { id: 'fleet', label: 'Fleet Tracking', icon: Ship, color: MISSION_COLORS.fleet },
  ] as const;

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-white/50">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
      {/* Dashboard Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-4">
          <Anchor className="w-10 h-10 text-cyan-400" />
          NeerSutra Mission Dashboard
        </h1>
        <p className="text-white/50">Actionable insights across all marine operations</p>
      </div>

      {/* Dashboard Controls */}
      <DashboardControls
        filters={filters}
        onUpdateFilters={updateFilters}
        onReset={resetFilters}
        onToggleLive={toggleLiveMode}
        activeTab={activeTab}
        summaryStats={summaryStats}
      />

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all
                ${isActive
                  ? 'bg-white/15 border border-white/20 shadow-lg'
                  : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                }
              `}
              style={isActive ? { borderColor: `${tab.color}50`, boxShadow: `0 0 20px ${tab.color}30` } : {}}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-5 h-5" style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.5)' }} />
              <span style={{ color: isActive ? tab.color : 'rgba(255,255,255,0.7)' }}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'ews' && (
            <EWSChartsSection
              impactMatrix={ewsImpactMatrix}
              forecastReliability={ewsForecastReliability}
              populationAtRisk={ewsPopulationAtRisk}
              activeThreats={ewsActiveThreats}
            />
          )}
          {activeTab === 'che' && (
            <CHEChartsSection
              pollutantBreakdown={chePollutantBreakdown}
              safeWindow={cheSafeWindow}
              sourceAttribution={cheSourceAttribution}
              dzriScore={cheZoneDZRI}
              selectedZone={filters.selectedZone}
              coastalZones={coastalZones}
              onZoneChange={(zone) => updateFilters({ selectedZone: zone })}
            />
          )}
          {activeTab === 'pfz' && (
            <PFZChartsSection
              cpueForecast={pfzCPUEForecast}
              fuelCatchROI={pfzFuelCatchROI}
              marketPrice={pfzMarketPrice}
              bestZone={pfzBestZone}
              selectedSpecies={filters.selectedSpecies}
              fishSpecies={fishSpecies}
              onSpeciesChange={(species) => updateFilters({ selectedSpecies: species })}
            />
          )}
          {activeTab === 'fleet' && (
            <FleetChartsSection
              utilization={fleetUtilization}
              fuelEfficiency={fleetFuelEfficiency}
              maintenanceHealth={fleetMaintenanceHealth}
              optimizationSavings={fleetOptimizationSavings}
              summary={fleetSummary}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
