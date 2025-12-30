"use client";

import React, { useState, useEffect, useRef } from 'react';
import { formatNumber } from './utils/formatters';
import './LevelList.css';

/**
 * Simple virtualized list implementation without react-window dependency
 * This version can be used if react-window is not available
 */
const SimpleLevelList = ({ levels }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const [itemHeight, setItemHeight] = useState(40); // Safe default
  const containerRef = useRef(null);
  const overscan = 6;

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      setContainerHeight(Math.min(vh * 0.6, 600) - 44); // Subtract header height
      setItemHeight(window.innerWidth < 768 ? 36 : 40); // Update item height based on screen size
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    levels.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Generate visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const level = levels[i];
    const isEven = i % 2 === 0;
    
    visibleItems.push(
      <div
        key={i}
        className={`level-row ${isEven ? 'even' : 'odd'}`}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
      >
        <div className="depth-cell">
          {formatNumber(level.depth_m, 0)}m
        </div>
        <div className="data-cell">
          {level.temp_c !== null ? formatNumber(level.temp_c, 1) : '—'}
        </div>
        <div className="data-cell">
          {level.sal !== null ? formatNumber(level.sal, 2) : '—'}
        </div>
        <div className="data-cell">
          {level.psal !== null ? formatNumber(level.psal, 2) : '—'}
        </div>
      </div>
    );
  }

  return (
    <div className="level-list-container">
      {/* Sticky Header */}
      <div className="level-header">
        <div className="depth-header">Depth</div>
        <div className="data-header">Temp</div>
        <div className="data-header">Sal</div>
        <div className="data-header">Psal</div>
      </div>

      {/* Scrollable List */}
      <div 
        ref={containerRef}
        className="level-list-body simple-virtual"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div 
          style={{ 
            position: 'relative',
            height: levels.length * itemHeight,
          }}
        >
          {visibleItems}
        </div>

        {/* Blueprint Background Image */}
        <div className="blueprint-image"></div>
      </div>
    </div>
  );
};

export default SimpleLevelList;
