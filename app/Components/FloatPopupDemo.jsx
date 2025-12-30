import React, { useState } from 'react';
import FloatPopup from './FloatPopup/FloatPopup';
import { generateMockLevels } from './FloatPopup/utils/formatters';

const FloatPopupDemo = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Mock data matching the screenshot
  const mockData = {
    platform_number: "1902671",
    cycle_number: 3,
    status: "active",
    captured_at: "2025-08-24T00:30:00Z",
    location: { lat: -18.867, lon: 60.849 },
    image_url: "/floater-img.jpg", // Make sure this image exists in your public folder
    metrics: {
      temperature_c: 15.3,
      depth_m: 1370,
      salinity_psu: 32.67,
      pressure_dbar: 369
    },
    levels: generateMockLevels(100) // Generate 100 levels for demo
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-0, #0f1217)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <button
        onClick={handleOpenPopup}
        style={{
          background: 'var(--accent, #4ea1ff)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(78, 161, 255, 0.3)',
          transition: 'all 150ms ease'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(78, 161, 255, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(78, 161, 255, 0.3)';
        }}
      >
        Open ARGO Float Popup
      </button>

      <FloatPopup
        isOpen={isPopupOpen}
        data={mockData}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default FloatPopupDemo;
