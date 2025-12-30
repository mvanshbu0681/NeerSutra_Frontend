/**
 * ============================================
 * CHE Heatmap Layer - Deck.gl Layer for CHE Visualization
 * Renders DZRI/PEI/ORS as heatmap overlay on map
 * ============================================
 */

'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { useCHEStore, getLayerColorScale } from '../../../../../src/store/useCHEStore';
import { generateSimulationGrid, generateLocationAnalysis } from '../../../../../src/lib/che/engine';
import type { GridCell, SimulationGrid } from '../../../../../src/lib/che/types';

interface CHEHeatmapLayerProps {
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  onCellClick?: (lat: number, lon: number) => void;
}

/**
 * Generate deck.gl layers for CHE visualization
 */
export function useCHELayers({
  bounds,
  onCellClick,
}: CHEHeatmapLayerProps) {
  const { 
    activeLayer, 
    selectedDepth, 
    selectedTime, 
    layerOpacity,
    setSimulationGrid,
    setLoading,
    selectLocation,
  } = useCHEStore();
  
  // Generate simulation grid when bounds/depth/time change
  const grid = useMemo(() => {
    if (!bounds || activeLayer === 'none') return null;
    
    setLoading(true);
    const simulationGrid = generateSimulationGrid(bounds, 0.5, selectedDepth, selectedTime);
    setSimulationGrid(simulationGrid);
    
    return simulationGrid;
  }, [bounds, selectedDepth, selectedTime, activeLayer]);
  
  // Get value from cell based on active layer
  const getCellValue = useCallback((cell: GridCell): number => {
    switch (activeLayer) {
      case 'dzri': return cell.DZRI;
      case 'pei': return cell.PEI;
      case 'ors': return cell.ORS;
      case 'do': return cell.DO_atDepth / 10; // Normalize to 0-1
      default: return 0;
    }
  }, [activeLayer]);
  
  // Get color for cell
  const getCellColor = useCallback((cell: GridCell): [number, number, number, number] => {
    const value = getCellValue(cell);
    const colorScale = getLayerColorScale(activeLayer);
    
    // Interpolate between colors
    const t = Math.min(Math.max(value, 0), 1);
    
    let color: [number, number, number];
    if (t < 0.5) {
      // Interpolate between first and second color
      const localT = t * 2;
      color = [
        Math.round(colorScale[0][0] + (colorScale[1][0] - colorScale[0][0]) * localT),
        Math.round(colorScale[0][1] + (colorScale[1][1] - colorScale[0][1]) * localT),
        Math.round(colorScale[0][2] + (colorScale[1][2] - colorScale[0][2]) * localT),
      ];
    } else {
      // Interpolate between second and third color
      const localT = (t - 0.5) * 2;
      color = [
        Math.round(colorScale[1][0] + (colorScale[2][0] - colorScale[1][0]) * localT),
        Math.round(colorScale[1][1] + (colorScale[2][1] - colorScale[1][1]) * localT),
        Math.round(colorScale[1][2] + (colorScale[2][2] - colorScale[1][2]) * localT),
      ];
    }
    
    return [...color, Math.round(layerOpacity * 200)] as [number, number, number, number];
  }, [activeLayer, layerOpacity, getCellValue]);
  
  // Handle cell click
  const handleClick = useCallback((info: any) => {
    if (info.object) {
      const { lat, lon } = info.object as GridCell;
      const analysis = generateLocationAnalysis(lat, lon, selectedTime);
      selectLocation(lat, lon, analysis);
      onCellClick?.(lat, lon);
    }
  }, [selectedTime, selectLocation, onCellClick]);
  
  // Create layers
  const layers = useMemo(() => {
    if (!grid || activeLayer === 'none') return [];
    
    // Scatterplot layer for grid visualization
    const scatterLayer = new ScatterplotLayer({
      id: 'che-scatter-layer',
      data: grid.cells,
      pickable: true,
      opacity: layerOpacity,
      stroked: true,
      filled: true,
      radiusScale: 20000,
      radiusMinPixels: 8,
      radiusMaxPixels: 30,
      getPosition: (d: GridCell) => [d.lon, d.lat],
      getFillColor: getCellColor,
      getLineColor: [255, 255, 255, 40] as [number, number, number, number],
      lineWidthMinPixels: 1,
      onClick: handleClick,
      updateTriggers: {
        getFillColor: [activeLayer, layerOpacity],
      },
    });
    
    return [scatterLayer];
  }, [grid, activeLayer, layerOpacity, getCellColor, handleClick]);
  
  return { layers, grid };
}

/**
 * CHE Layer Legend Component
 */
export function CHELayerLegend({ className = '' }: { className?: string }) {
  const { activeLayer } = useCHEStore();
  
  if (activeLayer === 'none') return null;
  
  const colorScale = getLayerColorScale(activeLayer);
  
  const labels = {
    dzri: ['Safe', 'Warning', 'High Risk'],
    pei: ['Low', 'Moderate', 'Eutrophic'],
    ors: ['Fragile', 'Moderate', 'Resilient'],
    do: ['Hypoxic', 'Low', 'Healthy'],
    none: ['', '', ''],
  };
  
  return (
    <div className={`glass-panel rounded-xl p-3 ${className}`}>
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
        {activeLayer.toUpperCase()} Legend
      </div>
      
      {/* Gradient bar */}
      <div 
        className="h-2 rounded-full mb-2"
        style={{
          background: `linear-gradient(to right, 
            rgb(${colorScale[0].join(',')}), 
            rgb(${colorScale[1].join(',')}), 
            rgb(${colorScale[2].join(',')})
          )`,
        }}
      />
      
      {/* Labels */}
      <div className="flex justify-between">
        {labels[activeLayer].map((label, i) => (
          <span 
            key={i} 
            className="text-[9px] text-white/50"
            style={{ color: `rgb(${colorScale[i].join(',')})` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
