"use client";

import React, { useState, useRef, useEffect } from 'react';

// const SimpleLevelList = ({ data, onItemClick, scrollToTop }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const [itemHeight, setItemHeight] = useState(40); // Safe default
  const [screenHeight, setScreenHeight] = useState(800); // Safe default for SSR
  const [screenWidth, setScreenWidth] = useState(1024); // Safe default for SSR
  const containerRef = useRef(null);
  const overscan = 6;

  useEffect(() => {
    const updateHeight = () => {
      if (typeof window !== 'undefined') {
        const vh = window.innerHeight;
        setScreenHeight(vh);
        setScreenWidth(window.innerWidth);
        setContainerHeight(Math.min(vh * 0.6, 600) - 44);
        setItemHeight(window.innerWidth < 768 ? 36 : 40); // Update item height
      }
    };

    updateHeight();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
const formatLatLon = (lat, lon) => {
  if (lat === null || lon === null || lat === undefined || lon === undefined) {
    return '—, —';
  }
  
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';
  
  const formattedLat = Math.abs(lat).toFixed(3);
  const formattedLon = Math.abs(lon).toFixed(3);
  
  return `${formattedLat}°${latDirection}, ${formattedLon}°${lonDirection}`;
};

const formatDate = (isoString) => {
  if (!isoString) return '—';
  
  try {
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return '—';
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '—';
  
  try {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch {
    return '—';
  }
};

const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false
  }).format(value);
};

const generateMockLevels = (count = 100) => {
  const levels = [];
  
  for (let i = 0; i < count; i++) {
    const depth = i;
    const baseTemp = 25 - (depth * 0.02) + Math.sin(depth * 0.1) * 2;
    const temp = Math.max(2, baseTemp + (Math.random() - 0.5) * 0.5);
    const baseSal = 34.5 + Math.sin(depth * 0.05) * 0.5;
    const sal = baseSal + (Math.random() - 0.5) * 0.2;
    const psal = sal + (Math.random() - 0.5) * 0.1;
    
    levels.push({
      depth_m: depth,
      temp_c: Number(temp.toFixed(1)),
      sal: Number(sal.toFixed(2)),
      psal: Number(psal.toFixed(2))
    });
  }
  
  return levels;
};

// Simple virtualized list component
const LevelList = ({ levels }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);
  const [itemHeight, setItemHeight] = useState(40); // Safe default
  const containerRef = useRef(null);
  const overscan = 6;

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight;
      setContainerHeight(Math.min(vh * 0.6, 600) - 44);
      setItemHeight(window.innerWidth < 768 ? 36 : 40); // Update item height
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    levels.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const level = levels[i];
    const isEven = i % 2 === 0;
    
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
          display: 'grid',
          gridTemplateColumns: '56px 1fr 1fr 1fr',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid var(--divider)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          fontWeight: '500',
          fontSize: '14px',
          lineHeight: '18px',
          background: isEven ? 'rgba(76, 127, 206, 0.12)' : 'rgba(64, 111, 187, 0.12)',
        }}
      >
        <div style={{
          color: 'var(--white)',
          textAlign: 'right',
          paddingRight: '8px',
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontWeight: '500',
        }}>
          {formatNumber(level.depth_m, 0)}m
        </div>
        <div style={{
          color: 'var(--tile-text)',
          textAlign: 'right',
          paddingRight: '8px',
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontWeight: '500',
        }}>
          {level.temp_c !== null ? formatNumber(level.temp_c, 1) : '—'}
        </div>
        <div style={{
          color: 'var(--tile-text)',
          textAlign: 'right',
          paddingRight: '8px',
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontWeight: '500',
        }}>
          {level.sal !== null ? formatNumber(level.sal, 2) : '—'}
        </div>
        <div style={{
          color: 'var(--tile-text)',
          textAlign: 'right',
          paddingRight: '8px',
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
          fontWeight: '500',
        }}>
          {level.psal !== null ? formatNumber(level.psal, 2) : '—'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      background: 'var(--panel)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr 1fr 1fr',
        height: '44px',
        background: 'var(--panel)',
        borderBottom: '1px solid var(--divider)',
        position: 'sticky',
        top: '0',
        zIndex: '5',
        alignItems: 'center',
        padding: '0 12px',
      }}>
        {['Depth', 'Temp', 'Sal', 'Psal'].map((header) => (
          <div key={header} style={{
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: '600',
            fontSize: '12px',
            lineHeight: '14px',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            textAlign: 'right',
            paddingRight: '8px',
          }}>
            {header}
          </div>
        ))}
      </div>

      {/* Scrollable body */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          height: containerHeight,
          overflow: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--muted) transparent',
        }}
        onScroll={handleScroll}
      >
        <div style={{ 
          position: 'relative',
          height: levels.length * itemHeight,
        }}>
          {visibleItems}
        </div>

        {/* Blueprint background */}
        <div style={{
          position: 'absolute',
          right: '8px',
          top: '12px',
          width: 'min(280px, 26%)',
          height: '400px',
          backgroundImage: 'url(/floater-img.jpg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: '0.18',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: '1',
        }} />
      </div>
    </div>
  );
};

// Main FloatPopup component
const FloatPopupStandalone = ({ isOpen, data, onClose }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1024); // Safe default for SSR
  const detailsRef = useRef(null);
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // CSS variables
  const cssVariables = {
    '--bg-0': '#0f1217',
    '--panel': '#1a1f2a',
    '--panel-2': '#182132',
    '--accent': '#4ea1ff',
    '--accent-2': '#8bc1ff',
    '--muted': '#7f8aa3',
    '--ok': '#2fd15a',
    '--warn': '#ffb545',
    '--err': '#ff6b6b',
    '--chip-bg': '#122a18',
    '--tile': '#243049',
    '--tile-border': '#30405f',
    '--tile-text': '#e6f0ff',
    '--level-row': '#4c7fce',
    '--level-row-alt': '#406fbb',
    '--divider': '#2b3a57',
    '--white': '#ffffff',
    '--shadow': '0 10px 26px rgba(2, 10, 24, 0.45), 0 2px 8px rgba(2, 10, 24, 0.30)',
    '--focus': '0 0 0 3px rgba(78, 161, 255, 0.45)',
  };

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle screen width for responsive design
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleDetailsToggle = () => {
    setIsDetailsExpanded(!isDetailsExpanded);
    
    if (!isDetailsExpanded) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 150);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !data) return null;

  const isActive = data.status === 'active';

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(8, 12, 18, 0.64)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000',
        padding: '16px',
        fontFeatureSettings: '"tnum" 1',
        ...cssVariables,
      }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="float-popup-title"
    >
      <div 
        ref={modalRef}
        style={{
          background: 'rgba(26, 31, 42, 0.96)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow)',
          maxWidth: '1120px',
          minWidth: '320px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close popup"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '40px',
            height: '40px',
            border: 'none',
            background: 'none',
            color: 'var(--white)',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10',
          }}
        >
          ✕
        </button>

        {/* Header Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: screenWidth >= 1024 ? '496px 1fr' : '1fr',
          gap: '24px',
          padding: '24px',
        }}>
          {/* Image Card */}
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '312px',
            boxShadow: '0 6px 16px rgba(2, 10, 24, 0.28)',
          }}>
            <img
              src={data.image_url}
              alt={`ARGO Float ${data.platform_number} in ocean`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            
            {/* Status Chip */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              height: '28px',
              padding: '6px 12px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: '600',
              fontSize: '12px',
              lineHeight: '14px',
              color: 'var(--white)',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              background: isActive ? 'var(--chip-bg)' : 'rgba(127, 138, 163, 0.2)',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isActive ? 'var(--ok)' : 'var(--muted)',
              }} />
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </div>

            {/* Location */}
            <div style={{
              position: 'absolute',
              top: '104px',
              left: '112px',
              background: 'rgba(16, 24, 36, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '12px',
              lineHeight: '14px',
              color: 'var(--white)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              backdropFilter: 'blur(4px)',
            }}>
              {formatLatLon(data.location.lat, data.location.lon)}
            </div>

            {/* Timestamp */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
              fontWeight: '500',
              fontSize: '12px',
              lineHeight: '14px',
              color: 'var(--white)',
              opacity: '0.9',
              letterSpacing: '0.02em',
            }}>
              <span>{formatDate(data.captured_at)}</span>
              <span>{formatTime(data.captured_at)}</span>
            </div>
          </div>

          {/* Summary Card */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h1 id="float-popup-title" style={{
              fontFamily: 'Segoe UI, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: '700',
              fontSize: '24px',
              lineHeight: '28px',
              color: 'var(--white)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: '0',
            }}>
              ARGO FLOAT {data.platform_number}
            </h1>
            
            <div style={{ height: '1px', background: 'var(--divider)', margin: '12px 0 20px 0' }} />

            {/* Cycle Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '28px',
              marginBottom: '20px',
            }}>
              <span style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                lineHeight: '18px',
                color: 'var(--muted)',
              }}>
                Cycle No.
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                fontWeight: '600',
                fontSize: '24px',
                lineHeight: '28px',
                color: 'var(--white)',
              }}>
                {data.cycle_number}
              </span>
            </div>

            {/* Metric Tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px',
            }}>
              {[
                { value: data.metrics.temperature_c, label: '°C\nTemperature', decimals: 1 },
                { value: data.metrics.depth_m, label: 'm\nDepth', decimals: 0 },
                { value: data.metrics.salinity_psu, label: 'PSU\nSalinity', decimals: 2 },
                { value: data.metrics.pressure_dbar, label: 'dbar\nPressure', decimals: 0 },
              ].map((metric, index) => (
                <div key={index} style={{
                  background: 'var(--tile)',
                  border: '1px solid var(--tile-border)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  minHeight: '84px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(2, 10, 24, 0.1)',
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                    fontWeight: '600',
                    fontSize: '40px',
                    lineHeight: '44px',
                    color: 'var(--tile-text)',
                    marginBottom: '6px',
                  }}>
                    {metric.value !== null ? formatNumber(metric.value, metric.decimals) : '—'}
                  </div>
                  <div style={{
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: '12px',
                    lineHeight: '14px',
                    color: 'var(--muted)',
                    whiteSpace: 'pre-line',
                  }}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Details Button */}
            <button
              onClick={handleDetailsToggle}
              aria-expanded={isDetailsExpanded}
              style={{
                width: '100%',
                height: '44px',
                background: 'var(--panel-2)',
                border: '1px solid var(--divider)',
                borderRadius: '12px',
                color: 'var(--white)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                lineHeight: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              FLOATER DETAILS
              <span style={{
                fontSize: '14px',
                transform: isDetailsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}>
                ⌄
              </span>
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div 
          ref={detailsRef}
          style={{
            overflow: 'hidden',
            maxHeight: isDetailsExpanded ? '60vh' : '0',
            opacity: isDetailsExpanded ? '1' : '0',
            transition: 'all 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <div style={{ padding: '16px 20px 20px 20px' }}>
            {data.levels && data.levels.length > 0 ? (
              <LevelList levels={data.levels} />
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                fontSize: '14px',
                lineHeight: '18px',
                color: 'var(--muted)',
              }}>
                No depth level data available for this float.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component
const StandaloneDemo = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const mockData = {
    platform_number: "1902671",
    cycle_number: 3,
    status: "active",
    captured_at: "2025-08-24T00:30:00Z",
    location: { lat: -18.867, lon: 60.849 },
    image_url: "/floater-img.jpg",
    metrics: {
      temperature_c: 15.3,
      depth_m: 1370,
      salinity_psu: 32.67,
      pressure_dbar: 369
    },
    levels: generateMockLevels(100)
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f1217', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <button
        onClick={() => setIsPopupOpen(true)}
        style={{
          background: '#4ea1ff',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(78, 161, 255, 0.3)',
        }}
      >
        Open ARGO Float Popup (Standalone)
      </button>

      <FloatPopupStandalone
        isOpen={isPopupOpen}
        data={mockData}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default StandaloneDemo;
