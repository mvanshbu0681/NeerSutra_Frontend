"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatbotAnimations } from "../../utils/gsapAnimations";

const FloatDetailsModal = ({ isOpen, onClose, floatData }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      chatbotAnimations.modal.fadeScaleIn(modalRef.current);

      // Stagger content animation
      const contentElements = contentRef.current?.querySelectorAll(
        ".detail-card, .chart-container"
      );
      if (contentElements) {
        chatbotAnimations.modal.staggerContent(Array.from(contentElements));
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const defaultFloatData = {
    id: "ARGO_IN_001",
    location: { lat: 15.2993, lng: 74.124 },
    temperature: 28.5,
    salinity: 35.2,
    depth: 2000,
    battery: 87,
    lastUpdate: new Date(),
    status: "Active",
    deploymentDate: new Date("2024-01-15"),
    measurements: 156,
    dataQuality: 98.5,
  };

  const data = floatData || defaultFloatData;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="float-modal"
          ref={modalRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">🌊 ARGO Float Details</h2>
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div ref={contentRef}>
              {/* Float Status Overview */}
              <div className="detail-card" style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      background: "var(--gradient-primary)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      boxShadow: "0 0 20px rgba(0, 224, 255, 0.4)",
                    }}
                  >
                    🎯
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "var(--white-text)",
                        fontSize: "1.3rem",
                      }}
                    >
                      {data.id}
                    </h3>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        color: data.status === "Active" ? "#20C997" : "#FFA500",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      ● {data.status}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      background: "rgba(0, 224, 255, 0.1)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 224, 255, 0.3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      Battery:
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "var(--white-text)",
                        marginLeft: "4px",
                      }}
                    >
                      {data.battery}%
                    </span>
                  </div>
                  <div
                    style={{
                      background: "rgba(32, 201, 151, 0.1)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 201, 151, 0.3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      Data Quality:
                    </span>
                    <span
                      style={{
                        fontWeight: "600",
                        color: "var(--white-text)",
                        marginLeft: "4px",
                      }}
                    >
                      {data.dataQuality}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Measurement Details */}
              <div className="float-details-grid">
                <div className="detail-card">
                  <div className="detail-label">🌡️ Temperature</div>
                  <div className="detail-value">{data.temperature}°C</div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">🧂 Salinity</div>
                  <div className="detail-value">{data.salinity} PSU</div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">📏 Depth</div>
                  <div className="detail-value">{data.depth}m</div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">📊 Measurements</div>
                  <div className="detail-value">{data.measurements}</div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">📍 Latitude</div>
                  <div className="detail-value">
                    {data.location.lat.toFixed(4)}°
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-label">📍 Longitude</div>
                  <div className="detail-value">
                    {data.location.lng.toFixed(4)}°
                  </div>
                </div>
              </div>

              {/* Data Visualization */}
              <div
                className="chart-container"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "16px",
                  padding: "24px",
                  marginTop: "24px",
                  backdropFilter: "blur(15px)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px 0",
                    color: "var(--white-text)",
                    textAlign: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  📈 Depth Profile Data
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  {/* Temperature Chart */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 16px 0",
                        color: "#00E0FF",
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                    >
                      🌡️ Temperature Profile
                    </h4>
                    <div
                      style={{
                        height: "200px",
                        background: "rgba(0, 224, 255, 0.05)",
                        borderRadius: "8px",
                        border: "1px dashed rgba(0, 224, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ fontSize: "2rem" }}>📊</div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        Interactive Chart
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        Plotly visualization would render here
                      </div>
                    </div>
                  </div>

                  {/* Salinity Chart */}
                  <div>
                    <h4
                      style={{
                        margin: "0 0 16px 0",
                        color: "#20C997",
                        fontSize: "1rem",
                        textAlign: "center",
                      }}
                    >
                      🧂 Salinity Profile
                    </h4>
                    <div
                      style={{
                        height: "200px",
                        background: "rgba(32, 201, 151, 0.05)",
                        borderRadius: "8px",
                        border: "1px dashed rgba(32, 201, 151, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ fontSize: "2rem" }}>📈</div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "rgba(255, 255, 255, 0.7)",
                        }}
                      >
                        Interactive Chart
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255, 255, 255, 0.5)",
                        }}
                      >
                        Chart.js visualization would render here
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "var(--gradient-primary)",
                    border: "none",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    color: "white",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(0, 224, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🗺️ Show on Map
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(32, 201, 151, 0.2)",
                    border: "1px solid rgba(32, 201, 151, 0.4)",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    color: "#20C997",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  📥 Download Data
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    padding: "12px 20px",
                    color: "var(--white-text)",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🔄 Refresh Data
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatDetailsModal;
