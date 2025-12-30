"use client";

import React, { useState, useEffect, useRef } from 'react';
import { formatNumber } from './utils/formatters';
import './LevelList.css';

/**
 * Virtualized list component for level data
 * This is a fallback implementation that doesn't require react-window
 */
const LevelList = ({ levels }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(300);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [itemHeight, setItemHeight] = useState(40); // Safe default
  const containerRef = useRef(null);
  
  // Debug logging to see actual levels data
  useEffect(() => {
    if (levels && levels.length > 0) {
      console.log('LevelList received levels:', {
        count: levels.length,
        maxDepth: Math.max(...levels.map(l => l.depth_m || 0)),
        hasLevelIndex: levels[0].level_index !== undefined,
        sampleLevels: levels.slice(0, 5), // First 5 levels
        lastLevels: levels.slice(-5) // Last 5 levels
      });
    }
  }, [levels]);
  const overscan = 5;

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      setItemHeight(vw < 768 ? 36 : 40); // Update item height based on screen size
      
      // Adjusted height calculation for the new modal constraints
      let maxHeight;
      if (vw < 480) {
        maxHeight = Math.min(vh * 0.3, 240); // Very small mobile: 30% viewport, max 240px
      } else if (vw < 768) {
        maxHeight = Math.min(vh * 0.35, 320); // Mobile: 35% viewport, max 320px
      } else if (vw < 1024) {
        maxHeight = Math.min(vh * 0.4, 400); // Tablet: 40% viewport, max 400px
      } else {
        maxHeight = Math.min(vh * 0.45, 480); // Desktop: 45% viewport, max 480px
      }
      
      setContainerHeight(maxHeight - 90); // Subtract header + summary height
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = React.useCallback((e) => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);

  const handleRowHover = (index) => {
    setHoveredRow(index);
  };

  const handleRowLeave = () => {
    setHoveredRow(null);
  };

  // Calculate visible range for virtualization
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    levels.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Generate only visible items for performance
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const level = levels[i];
    const isEven = i % 2 === 0;
    const isHovered = hoveredRow === i;
    
    visibleItems.push(
      <div
        key={i}
        className={`level-row ${isEven ? 'even' : 'odd'} ${isHovered ? 'hovered' : ''}`}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
        onMouseEnter={() => handleRowHover(i)}
        onMouseLeave={handleRowLeave}
        role="row"
        tabIndex={0}
      >
        <div className="depth-cell" role="cell">
          <span className="depth-value">{formatNumber(level.depth_m, 0)}</span>
          <span className="depth-unit">m</span>
        </div>
        <div className="data-cell" role="cell">
          <span className="data-value">
            {level.temp_c !== null ? formatNumber(level.temp_c, 1) : '—'}
          </span>
          {level.temp_c !== null && <span className="data-unit">°C</span>}
        </div>
        <div className="data-cell" role="cell">
          <span className="data-value">
            {level.pres !== null ? formatNumber(level.pres, 2) : '—'}
          </span>
        </div>
        <div className="data-cell" role="cell">
          <span className="data-value">
            {level.psal !== null ? formatNumber(level.psal, 2) : '—'}
          </span>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!levels || levels.length === 0) return null;
    
    const validTemps = levels.filter(l => l.temp_c !== null).map(l => l.temp_c);
    const validSals = levels.filter(l => l.sal !== null).map(l => l.sal);
    const maxDepth = Math.max(...levels.map(l => l.depth_m));
    
    return {
      totalLevels: levels.length,
      maxDepth,
      tempRange: validTemps.length > 0 ? {
        min: Math.min(...validTemps),
        max: Math.max(...validTemps)
      } : null,
      salRange: validSals.length > 0 ? {
        min: Math.min(...validSals),
        max: Math.max(...validSals)
      } : null
    };
  }, [levels]);

  return (
    <div className="level-list-container">
      {/* Data Summary */}
      {stats && (
        <div className="data-summary">
          <div className="summary-item">
            <span className="summary-value">{stats.totalLevels}</span>
            <span className="summary-label">Levels</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{formatNumber(stats.maxDepth, 0)}m</span>
            <span className="summary-label">Max Depth</span>
          </div>
          {stats.tempRange && (
            <div className="summary-item">
              <span className="summary-value">
                {formatNumber(stats.tempRange.min, 1)}° - {formatNumber(stats.tempRange.max, 1)}°C
              </span>
              <span className="summary-label">Temp Range</span>
            </div>
          )}
        </div>
      )}
      
      {/* Sticky Header */}
      <div className="level-header">
        <div className="depth-header">Depth</div>
        <div className="data-header">Temp</div>
        <div className="data-header">Pres</div>
        <div className="data-header">Psal</div>
      </div>

      {/* Scrollable List with Custom Virtualization */}
      <div 
        ref={containerRef}
        className="level-list-body simple-virtual"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
        role="table"
        aria-label={`Ocean depth data with ${levels.length} levels`}
        aria-rowcount={levels.length}
      >
        <div 
          style={{ 
            position: 'relative',
            height: levels.length * itemHeight,
          }}
          role="rowgroup"
        >
          {visibleItems}
        </div>

        {/* Blueprint Background Image */}
        <div className="blueprint-image" aria-hidden="true"></div>
        
        {/* Scroll indicators */}
        {levels.length > Math.ceil(containerHeight / itemHeight) && (
          <>
            {scrollTop > 0 && (
              <div className="scroll-indicator scroll-indicator-top" aria-hidden="true">
                ↑ More data above
              </div>
            )}
            {scrollTop < (levels.length * itemHeight - containerHeight) && (
              <div className="scroll-indicator scroll-indicator-bottom" aria-hidden="true">
                ↓ More data below
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LevelList;