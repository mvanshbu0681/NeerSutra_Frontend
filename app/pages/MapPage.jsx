"use client";

import React from "react";
import AnimatedIndiaMap from "../Components/Map";
import Navbar from "../Components/Navbar";

const MapPage = () => {
  return (
    <div className="map-page">
      <div className="navbar-wrapper">
        <Navbar />
      </div>
      <div className="map-container">
        <AnimatedIndiaMap />
      </div>

      <style jsx="true">{`
        .map-page {
          position: relative;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: transparent;
        }

        /* Sticky navbar wrapper */
        .navbar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.98) 0%,
            rgba(15, 23, 42, 0.9) 70%,
            transparent 100%
          );
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding-bottom: 12px;
        }

        /* Map container to fill remaining space */
        .map-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          z-index: 1;
        }

        /* Override navbar default styling for map page */
        .navbar-wrapper :global(.navbar) {
          background: transparent !important;
          backdrop-filter: none !important;
          border-bottom: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

export default MapPage;
