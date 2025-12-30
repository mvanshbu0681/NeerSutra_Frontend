"use client";

import React, { useRef, useState, useEffect } from "react";
import Navbar from "./Navbar";

// Animated Floater component
function AnimatedFloater() {
  const floaterRef = useRef();
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (floaterRef.current) {
      if (isHovered) {
        // Faster rotation when hovered
        floaterRef.current.rotation.y += 0.02;
      } else {
        // Slow rotation animation when not hovered
        floaterRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      }
      // Subtle floating motion with downward offset
      floaterRef.current.position.y =
        -0.2 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.3}
      position={[0, -0.1, 0]}
    >
      <Model
        ref={floaterRef}
        scale={0.25}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        style={{ cursor: "pointer" }}
      />
    </Float>
  );
}

// Loading fallback
function Loader() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#ffffff",
        fontSize: "1.2rem",
        fontWeight: "600",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>Loading 3D Model...</div>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(255, 255, 255, 0.3)",
          borderTop: "3px solid #00d4ff",
          borderRadius: "50%",
          margin: "0 auto",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
}

const FloaterScene = () => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    // Page load animation sequence
    const timer1 = setTimeout(() => {
      setShowLoader(false);
      setIsPageLoaded(true);
    }, 1500);

    const timer2 = setTimeout(() => {
      setShowContent(true);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Show navbar when cursor is in top 100px of screen
      setIsNavbarVisible(e.clientY <= 100);
    };

    const handleMouseLeave = () => {
      // Hide navbar when mouse leaves the window
      setIsNavbarVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className={`page-container ${isPageLoaded ? "loaded" : ""}`}>
      {/* Page Loading Screen */}
      {showLoader && (
        <div className="page-loader">
          <div className="loader-content">
            <div className="loader-logo">
              <div className="loader-floater">
                <div className="loader-floater-body"></div>
                <div className="loader-waves">
                  <div className="wave wave-1"></div>
                  <div className="wave wave-2"></div>
                  <div className="wave wave-3"></div>
                </div>
              </div>
            </div>
            <h1 className="loader-title">ARGO Floater Technology</h1>
            <div className="loader-progress">
              <div className="progress-bar"></div>
            </div>
            <p className="loader-text">Initializing Ocean Data Systems...</p>
          </div>
        </div>
      )}

      {/* Navbar with cursor-based reveal */}
      <div
        className={`navbar-container-floater ${
          isNavbarVisible ? "visible" : "hidden"
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
          transform: isNavbarVisible ? "translateY(0)" : "translateY(-100%)",
          opacity: isNavbarVisible ? 1 : 0,
        }}
      >
        <Navbar isVisible={isNavbarVisible} />
      </div>

      <div
        className={`floater-scene-container ${
          showContent ? "content-visible" : ""
        }`}
      >
        <div className="scene-content">
          <div
            className={`canvas-container ${showContent ? "animate-in" : ""}`}
          >
            <div className="video-wrapper" onClick={() => togglePlay()}>
              <video
                ref={videoRef}
                src="/break_apart.mp4"
                className="break-apart-video"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Break apart video showcasing floater"
              />

              <button
                className={`video-play-toggle ${
                  isPlaying ? "playing" : "paused"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                {isPlaying ? "❚❚" : "▶"}
              </button>
            </div>
          </div>

          <div
            className={`text-content ${showContent ? "animate-in-text" : ""}`}
          >
            <h2 className="section-title">ARGO Floater Technology</h2>
            <p className="section-description">
              Explore our advanced oceanographic floater in 3D. This autonomous
              device collects vital ocean data, drifting through the depths and
              surfacing to transmit scientific measurements via satellite.
            </p>
            <div className="feature-list">
              <div className="feature-item" style={{ animationDelay: "0.2s" }}>
                <span className="feature-icon">🌊</span>
                <span>Autonomous Ocean Profiling</span>
              </div>
              <div className="feature-item" style={{ animationDelay: "0.4s" }}>
                <span className="feature-icon">📡</span>
                <span>Satellite Data Transmission</span>
              </div>
              <div className="feature-item" style={{ animationDelay: "0.6s" }}>
                <span className="feature-icon">🔬</span>
                <span>Real-time Scientific Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        /* Import the custom Nineties Display font */
        @font-face {
          font-family: 'Nineties Display';
          src: url('/NinetiesDisplay.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        /* Page Loading Screen */
        .page-loader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: loaderFadeOut 0.8s ease-out 1.2s forwards;
        }

        @keyframes loaderFadeOut {
          0% {
            opacity: 1;
            visibility: visible;
          }
          100% {
            opacity: 0;
            visibility: hidden;
          }
        }

        .loader-content {
          text-align: center;
          color: white;
          font-family: 'JetBrains Mono', monospace;
        }

        .loader-logo {
          margin-bottom: 2rem;
          animation: logoScale 1.5s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
        }

        @keyframes logoScale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .loader-floater {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .loader-floater-body {
          width: 60px;
          height: 120px;
          background: linear-gradient(135deg, #3985E3, #00d4ff);
          border-radius: 30px;
          margin: 0 auto;
          position: relative;
          animation: floaterFloat 2s ease-in-out infinite;
        }

        @keyframes floaterFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        .loader-floater-body::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 30px;
          background: linear-gradient(to top, #00d4ff, #ffffff);
          border-radius: 2px;
          animation: antennaGlow 1.5s ease-in-out infinite alternate;
        }

        .loader-waves {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 10px;
        }

        .wave {
          width: 20px;
          height: 6px;
          background: linear-gradient(45deg, rgba(0, 212, 255, 0.6), rgba(57, 133, 227, 0.6));
          border-radius: 3px;
          animation: waveMotion 1.5s ease-in-out infinite;
        }

        .wave-1 { animation-delay: 0s; }
        .wave-2 { animation-delay: 0.2s; }
        .wave-3 { animation-delay: 0.4s; }

        @keyframes waveMotion {
          0%, 100% {
            transform: translateY(0) scaleX(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px) scaleX(1.2);
            opacity: 1;
          }
        }

        .loader-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #3985E3;
          margin: 1.5rem 0;
          text-shadow: 0 0 20px rgba(57, 133, 227, 0.5);
          letter-spacing: 0.05em;
          opacity: 0;
          animation: titleFadeIn 1s ease-out 0.3s forwards;
        }

        @keyframes titleFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .loader-progress {
          width: 300px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          margin: 2rem auto;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3985E3, #00d4ff);
          border-radius: 2px;
          width: 0%;
          animation: progressFill 1.2s ease-out forwards;
        }

        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .loader-text {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 1rem;
          opacity: 0;
          animation: textFadeIn 1s ease-out 0.6s forwards;
        }

        @keyframes textFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Page Load Animations */
        .page-container {
          opacity: 0;
          animation: pageLoad 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        .page-container.loaded {
          opacity: 1;
        }

        @keyframes pageLoad {
          0% {
            opacity: 0;
            transform: scale(1.05);
            filter: blur(10px);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0px);
          }
        }

        /* Content Animation States */
        .floater-scene-container {
          min-height: 100vh;
          background: url('/white.jpeg') center center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .floater-scene-container.content-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Canvas Animation */
        .canvas-container {
          position: relative;
          width: 70%;
          max-width: 500px;
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          margin: 0 auto;
          opacity: 0;
          transform: translateX(-100px) rotateY(-15deg);
          transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .canvas-container.animate-in {
          opacity: 1;
          transform: translateX(0) rotateY(0deg);
        }

        /* Text Content Animation */
        .text-content {
          color: #ffffff;
          padding: 2.5rem;
          font-family: 'JetBrains Mono', monospace;
          opacity: 0;
          transform: translateX(100px);
          transition: all 1s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .text-content.animate-in-text {
          opacity: 1;
          transform: translateX(0);
        }

        /* Title Animation */
        .section-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: #3985E3;
          line-height: 1.1;
          text-shadow: 0 0 30px rgba(57, 133, 227, 0.3);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          text-align: left;
          opacity: 0;
          transform: translateY(30px);
          animation: titleSlideIn 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) 0.8s forwards;
        }

        @keyframes titleSlideIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translateY(15px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Description Animation */
        .section-description {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.3rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 2.5rem;
          font-weight: 400;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.02em;
          opacity: 0;
          transform: translateY(20px);
          animation: descriptionSlideIn 1s cubic-bezier(0.25, 0.8, 0.25, 1) 1.2s forwards;
        }

        @keyframes descriptionSlideIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Feature List Staggered Animation */
        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1.2rem 1.5rem;
          background: rgba(0, 100, 150, 0.3);
          border-radius: 50px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          opacity: 0;
          transform: translateX(-30px);
          animation: featureSlideIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 1.5s forwards;
        }

        .feature-item:nth-child(2) {
          animation-delay: 1.7s;
        }

        .feature-item:nth-child(3) {
          animation-delay: 1.9s;
        }

        @keyframes featureSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-30px) scale(0.8);
          }
          70% {
            opacity: 0.8;
            transform: translateX(5px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .feature-item:hover {
          background: rgba(0, 150, 200, 0.4);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateX(12px) scale(1.05);
          box-shadow: 0 8px 30px rgba(0, 150, 200, 0.4);
          border-radius: 50px;
        }

        .feature-icon {
          font-size: 1.8rem;
          min-width: 2.2rem;
          text-align: center;
          animation: iconFloat 3s ease-in-out infinite;
        }

        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Scene Content Grid Animation */
        .scene-content {
          max-width: 1400px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          z-index: 1;
          opacity: 0;
          animation: sceneContentFadeIn 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) 0.6s forwards;
        }

        @keyframes sceneContentFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Navbar reveal container styles */
        .navbar-container-floater {
          background: none;
          backdrop-filter: none;
          border: none;
          box-shadow: none;
        }

        .navbar-container-floater.visible {
          animation: slideDown 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        .navbar-container-floater.hidden {
          animation: slideUp 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        /* Hover indicator at top of screen - removed */
        .navbar-container-floater::before {
          display: none;
        }

        .navbar-container-floater.visible::before {
          display: none;
        }

        .floater-scene-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(57, 133, 227, 0.1), rgba(0, 212, 255, 0.1));
          pointer-events: none;
          opacity: 0;
          animation: overlayFadeIn 2s ease-in-out 1s forwards;
        }

        @keyframes overlayFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .scene-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }

          .section-title {
            font-size: 3rem;
            text-align: center;
          }

          .canvas-container {
            width: 85%;
            max-width: 450px;
            height: 500px;
          }

          .text-content {
            padding: 2rem;
          }
        }

        @media (max-width: 768px) {
          .floater-scene-container {
            padding: 1rem;
          }

          .section-title {
            font-size: 2.2rem;
            margin-bottom: 1.5rem;
          }

          .section-description {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .canvas-container {
            width: 95%;
            max-width: 400px;
            height: 400px;
          }

          .feature-item {
            padding: 1rem;
            font-size: 1rem;
          }

          .feature-icon {
            font-size: 1.5rem;
            min-width: 2rem;
          }

          .text-content {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .section-title {
            font-size: 1.8rem;
          }

          .section-description {
            font-size: 1rem;
          }

          .feature-item {
            padding: 0.8rem;
            gap: 1rem;
          }

          .canvas-container {
            width: 95%;
            max-width: 350px;
            height: 350px;
          }
        }

        /* Video wrapper styles for break_apart.mp4 replacement */
        .video-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(180deg, #000000 0%, #00121a 100%);
          box-shadow: 0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .break-apart-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          background: #000;
        }

        .video-play-toggle {
          position: absolute;
          right: 18px;
          bottom: 18px;
          background: rgba(0,0,0,0.45);
          color: #ffffff;
          border: none;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px) saturate(120%);
          transition: transform 150ms ease, background 150ms ease;
          z-index: 4;
        }

        .video-play-toggle:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .video-play-toggle.paused {
          background: rgba(255,255,255,0.06);
          color: #e6f0ff;
        }

        @media (max-width: 767px) {
          .video-play-toggle {
            width: 44px;
            height: 44px;
            right: 12px;
            bottom: 12px;
            font-size: 16px;
          }
        }

      `}</style>
    </div>
  );
};

export default FloaterScene;
