"use client";

import React, { useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import { Model } from "./FloaterModel";
import { chatbotAnimations } from "../utils/gsapAnimations";

const FloaterDetailsModal = ({
  isOpen,
  onClose,
  floaterData,
  loading = false,
}) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // No depth simulation state needed anymore

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Animate modal entrance
      chatbotAnimations.modal.fadeScaleIn(modalRef.current);

      // Stagger content animation
      setTimeout(() => {
        const contentElements = contentRef.current?.querySelectorAll(
          ".detail-section, .model-container"
        );
        if (contentElements) {
          chatbotAnimations.modal.staggerContent(Array.from(contentElements));
        }
      }, 200);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Simple 3D Model Component
  const AnimatedFloaterModel = () => {
    return (
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <Model scale={0.4} position={[0, 0, 0]} />
      </Float>
    );
  };

  // Default data structure
  const defaultData = {
    id: "ARGO_LOADING",
    name: "Loading...",
    status: "Unknown",
    location: { lat: 0, lng: 0 },
    depth: 0,
    temperature: 0,
    salinity: 0,
    battery: 0,
    lastUpdate: new Date(),
    deploymentDate: new Date(),
    dataQuality: 0,
    platform_number: "Loading...",
  };

  const data = floaterData || defaultData;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="floater-modal-overlay"
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="floater-modal-content"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <motion.h2
                className="modal-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                🌊 ARGO Floater Details
              </motion.h2>
              <motion.button
                className="modal-close-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3 }}
              >
                ✕
              </motion.button>
            </div>

            <div ref={contentRef} className="modal-body">
              {/* Left Side - 3D Model */}
              <motion.div
                className="model-container detail-section"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="model-canvas">
                  <Canvas
                    camera={{ position: [5, 5, 5], fov: 45 }}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <ambientLight intensity={0.5} />
                    <directionalLight
                      position={[10, 10, 5]}
                      intensity={1}
                      color="#ffffff"
                    />
                    <pointLight position={[-10, -10, -10]} intensity={0.3} />
                    <Environment preset="sunset" />
                    <AnimatedFloaterModel />
                    <OrbitControls
                      enablePan={false}
                      enableZoom={true}
                      enableRotate={true}
                      minDistance={3}
                      maxDistance={8}
                      autoRotate={true}
                      autoRotateSpeed={2}
                    />
                  </Canvas>
                </div>

                {loading && (
                  <div className="model-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading floater data...</p>
                  </div>
                )}
              </motion.div>

              {/* Right Side - Floater Information */}
              <motion.div
                className="info-container detail-section"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {/* Floater Header Info */}
                <div className="floater-header">
                  <div className="floater-id">
                    <h3>Platform {data.platform_number}</h3>
                    <span
                      className={`status-badge ${(
                        data.status || "active"
                      ).toLowerCase()}`}
                    >
                      ● {data.status || "Active"}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid - Floater data */}
                <div className="metrics-grid">
                  <motion.div
                    className="metric-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="metric-icon">🌡️</div>
                    <div className="metric-info">
                      <span className="metric-label">Temperature</span>
                      <span className="metric-value">
                        {data.temperature || "N/A"}°C
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="metric-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="metric-icon">🧂</div>
                    <div className="metric-info">
                      <span className="metric-label">Salinity</span>
                      <span className="metric-value">
                        {data.salinity || "N/A"} PSU
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="metric-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="metric-icon">📏</div>
                    <div className="metric-info">
                      <span className="metric-label">Max Depth</span>
                      <span className="metric-value">
                        {data.depth || "N/A"}m
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="metric-card"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="metric-icon">🔋</div>
                    <div className="metric-info">
                      <span className="metric-label">Battery</span>
                      <span className="metric-value">
                        {data.battery || "N/A"}%
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Location & Time Info */}
                <motion.div
                  className="location-time-info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="info-row">
                    <span className="info-label">📍 Location:</span>
                    <span className="info-value">
                      {data.latitude?.toFixed(4) ||
                        data.location?.lat?.toFixed(4) ||
                        "N/A"}
                      ,{" "}
                      {data.longitude?.toFixed(4) ||
                        data.location?.lng?.toFixed(4) ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">📅 Last Update:</span>
                    <span className="info-value">
                      {data.date_key
                        ? new Date(
                            data.date_key
                              .toString()
                              .replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">⭐ Data Quality:</span>
                    <span className="info-value">
                      {data.dataQuality || "98"}%
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">🚀 Deployment Date:</span>
                    <span className="info-value">
                      {data.deploymentDate
                        ? new Date(data.deploymentDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="action-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <motion.button
                    className="action-btn primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📊 View Data Charts
                  </motion.button>
                  <motion.button
                    className="action-btn secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📥 Export Data
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloaterDetailsModal;
