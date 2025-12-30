"use client";

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronDown, Waves, Thermometer, Droplets, Gauge, BarChart3 } from 'lucide-react';
import Navbar from './Navbar';

const generateOceanData = (region, parameter) => {
  const depths = [0, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000];
  
  const baseValues = {
    temperature: {
      north: [15, 12, 8, 5, 4, 3, 2.5, 2, 1.8, 1.5, 1.2, 1.0, 0.8],
      south: [22, 18, 14, 10, 8, 6, 4, 3, 2.5, 2, 1.8, 1.5, 1.2],
      east: [25, 22, 18, 12, 9, 7, 5, 4, 3, 2.5, 2, 1.8, 1.5],
      west: [20, 16, 12, 8, 6, 4.5, 3.5, 2.8, 2.3, 2, 1.7, 1.4, 1.1]
    },
    salinity: {
      north: [32, 33, 34, 34.5, 34.7, 34.8, 34.9, 35, 35.1, 35.2, 35.3, 35.4, 35.5],
      south: [34, 34.2, 34.5, 34.8, 35, 35.2, 35.4, 35.6, 35.7, 35.8, 35.9, 36, 36.1],
      east: [33, 33.5, 34, 34.3, 34.6, 34.8, 35, 35.2, 35.4, 35.6, 35.8, 36, 36.2],
      west: [33.5, 34, 34.2, 34.4, 34.6, 34.8, 35, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7]
    },
    pressure: {
      north: [0, 5, 10, 20, 30, 50, 75, 100, 150, 200, 300, 400, 500],
      south: [0, 5.2, 10.3, 20.5, 30.8, 51, 76, 102, 153, 204, 306, 408, 510],
      east: [0, 5.1, 10.2, 20.3, 30.5, 50.8, 75.5, 101, 152, 203, 305, 407, 509],
      west: [0, 5, 10.1, 20.2, 30.4, 50.5, 75.2, 100.5, 151, 201, 302, 403, 505]
    }
  };

  return depths.map((depth, index) => ({
    depth,
    value: baseValues[parameter][region][index]
  }));
};

const GraphComparison = () => {
  const [region1, setRegion1] = useState('north');
  const [region2, setRegion2] = useState('south');
  const [parameter, setParameter] = useState('temperature');

  const regions = [
    { value: 'north', label: 'North Atlantic', color: '#3B82F6' },
    { value: 'south', label: 'South Atlantic', color: '#EF4444' },
    { value: 'east', label: 'East Pacific', color: '#10B981' },
    { value: 'west', label: 'West Pacific', color: '#F59E0B' }
  ];

  const parameters = [
    { value: 'temperature', label: 'Temperature (°C)', icon: Thermometer, unit: '°C' },
    { value: 'salinity', label: 'Salinity (PSU)', icon: Droplets, unit: 'PSU' },
    { value: 'pressure', label: 'Pressure (Bar)', icon: Gauge, unit: 'Bar' }
  ];

  const chartData = useMemo(() => {
    const depths = [0, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000];
    
    const region1Data = generateOceanData(region1, parameter);
    const region2Data = generateOceanData(region2, parameter);
    
    return depths.map(depth => {
      const point1 = region1Data.find(d => d.depth === depth);
      const point2 = region2Data.find(d => d.depth === depth);
      
      return {
        depth,
        [region1]: point1?.value || 0,
        [region2]: point2?.value || 0
      };
    });
  }, [region1, region2, parameter]);

  const getParameterInfo = () => {
    return parameters.find(p => p.value === parameter);
  };

  const getRegionInfo = (regionKey) => {
    return regions.find(r => r.value === regionKey);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const paramInfo = getParameterInfo();
      return (
        <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-xl p-4 shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{`Depth: ${label}m`}</p>
          {payload.map((entry, index) => {
            const regionInfo = getRegionInfo(entry.dataKey);
            return (
              <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
                {`${regionInfo?.label}: ${entry.value} ${paramInfo?.unit}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const ParameterIcon = getParameterInfo()?.icon || Waves;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-cyan-900">
      <Navbar />
      
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("/visuals.jpeg")`
      }}></div>
      
      <div className="relative z-10 mt-15 flex flex-col items-center w-full min-h-screen pt-35 pb-24 px-6 md:px-12 space-y-16">
        
        <div className="text-center max-w-6xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 flex items-center justify-center gap-6">
            <BarChart3 className="w-16 h-16 text-cyan-400" />
            <span>Region Comparison Dashboard</span>
          </h1>
          <p className="text-blue-200 text-2xl leading-relaxed">
            Compare oceanographic parameters between different oceanic regions across depth profiles
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12 shadow-2xl w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            <div className="space-y-6">
              <label className="block text-white font-semibold text-xl flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <span>Region 1</span>
              </label>
              <div className="relative">
                <select
                  value={region1}
                  onChange={(e) => setRegion1(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-8 py-5 text-white text-lg appearance-none cursor-pointer hover:bg-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {regions.filter(r => r.value !== region2).map(region => (
                    <option key={region.value} value={region.value} className="bg-gray-800 text-white">
                      {region.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/70 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-white font-semibold text-xl flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
                <span>Region 2</span>
              </label>
              <div className="relative">
                <select
                  value={region2}
                  onChange={(e) => setRegion2(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-8 py-5 text-white text-lg appearance-none cursor-pointer hover:bg-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {regions.filter(r => r.value !== region1).map(region => (
                    <option key={region.value} value={region.value} className="bg-gray-800 text-white">
                      {region.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/70 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-6">
              <label className="block text-white font-semibold text-xl flex items-center gap-4">
                <ParameterIcon className="w-7 h-7 text-cyan-400" />
                <span>Parameter</span>
              </label>
              <div className="relative">
                <select
                  value={parameter}
                  onChange={(e) => setParameter(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-8 py-5 text-white text-lg appearance-none cursor-pointer hover:bg-white/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  {parameters.map(param => (
                    <option key={param.value} value={param.value} className="bg-gray-800 text-white">
                      {param.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/70 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-20 shadow-2xl w-full max-w-full">
          
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-6">
              <ParameterIcon className="w-12 h-12 text-cyan-400" />
              <span>{getParameterInfo()?.label} Comparison</span>
            </h2>
            <p className="text-blue-200 text-2xl">
              {getRegionInfo(region1)?.label} vs {getRegionInfo(region2)?.label} • Depth Range: 0-5000m
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-16 mb-16 flex items-center justify-center">
            <div className="h-[800px] w-full max-w-6xl">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 80, right: 120, left: 150, bottom: 120 }}
                >
                  <defs>
                    <linearGradient id={`gradient-${region1}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getRegionInfo(region1)?.color} stopOpacity={0.7}/>
                      <stop offset="95%" stopColor={getRegionInfo(region1)?.color} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id={`gradient-${region2}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getRegionInfo(region2)?.color} stopOpacity={0.7}/>
                      <stop offset="95%" stopColor={getRegionInfo(region2)?.color} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.3)" />
                  
                  <XAxis 
                    dataKey="depth" 
                    stroke="rgba(255,255,255,0.9)"
                    fontSize={18}
                    fontWeight="700"
                    label={{ 
                      value: 'Depth (meters)', 
                      position: 'insideBottom', 
                      offset: -40, 
                      style: { 
                        textAnchor: 'middle', 
                        fill: 'rgba(255,255,255,0.9)',
                        fontSize: '22px',
                        fontWeight: '800'
                      } 
                    }}
                  />
                  
                  <YAxis 
                    stroke="rgba(255,255,255,0.9)"
                    fontSize={18}
                    fontWeight="700"
                    label={{ 
                      value: `${getParameterInfo()?.label}`, 
                      angle: -90, 
                      position: 'insideLeft', 
                      style: { 
                        textAnchor: 'middle', 
                        fill: 'rgba(255,255,255,0.9)',
                        fontSize: '22px',
                        fontWeight: '800'
                      } 
                    }}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Legend 
                    wrapperStyle={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '18px',
                      fontWeight: '700',
                      paddingTop: '40px'
                    }}
                    formatter={(value) => getRegionInfo(value)?.label || value}
                  />
                  
                  <Area
                    type="monotone"
                    dataKey={region1}
                    stroke={getRegionInfo(region1)?.color}
                    strokeWidth={5}
                    fill={`url(#gradient-${region1})`}
                    connectNulls={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                  <Area
                    type="monotone"
                    dataKey={region2}
                    stroke={getRegionInfo(region2)?.color}
                    strokeWidth={5}
                    fill={`url(#gradient-${region2})`}
                    connectNulls={true}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-10 border border-white/25 shadow-xl">
              <h3 className="text-white font-semibold text-2xl mb-6 flex items-center gap-4">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getRegionInfo(region1)?.color }}></div>
                {getRegionInfo(region1)?.label}
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between text-blue-200">
                  <span>Surface:</span>
                  <span className="font-medium text-white">{chartData[0]?.[region1]} {getParameterInfo()?.unit}</span>
                </div>
                <div className="flex justify-between text-blue-200">
                  <span>Deep (5000m):</span>
                  <span className="font-medium text-white">{chartData[chartData.length - 1]?.[region1]} {getParameterInfo()?.unit}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-10 border border-white/25 shadow-xl">
              <h3 className="text-white font-semibold text-2xl mb-6 flex items-center gap-4">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getRegionInfo(region2)?.color }}></div>
                {getRegionInfo(region2)?.label}
              </h3>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between text-blue-200">
                  <span>Surface:</span>
                  <span className="font-medium text-white">{chartData[0]?.[region2]} {getParameterInfo()?.unit}</span>
                </div>
                <div className="flex justify-between text-blue-200">
                  <span>Deep (5000m):</span>
                  <span className="font-medium text-white">{chartData[chartData.length - 1]?.[region2]} {getParameterInfo()?.unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphComparison;
