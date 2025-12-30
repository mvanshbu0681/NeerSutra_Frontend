"use client";

import React, { useEffect, useRef } from "react";
import "./FisheryPopup.css";

const FisheryPopup = ({ isOpen, data, onClose }) => {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => closeButtonRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const {
        region,
        risk,
        environmental_status,
        temperature,
        salinity,
        dissolved_oxygen,
        ph,
        fish_species, // Expecting array or string
        timestamp,
    } = data;

    // Parse fish species if it's a string (legacy fallback) or use array
    let speciesList = [];
    if (Array.isArray(fish_species)) {
        speciesList = fish_species;
    } else if (typeof fish_species === "string") {
        // If it's a simple comma-separated string, we can't get counts easily, but we can list names
        speciesList = fish_species.split(", ").map(name => ({ name, abundance: "Unknown" }));
    } else if (typeof fish_species === "string" && fish_species.startsWith("[")) {
        try {
            speciesList = JSON.parse(fish_species);
        } catch (e) {
            speciesList = [];
        }
    }

    // Risk colors
    const riskColors = {
        low: "#10B981",
        medium: "#F59E0B",
        high: "#EF4444",
        critical: "#7F1D1D",
    };
    const riskColor = riskColors[risk?.toLowerCase()] || "#7f8aa3";

    return (
        <div className="fishery-popup-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="fishery-popup-modal" ref={modalRef} style={{ "--accent": riskColor }}>
                <button
                    ref={closeButtonRef}
                    className="fishery-popup-close"
                    onClick={onClose}
                    aria-label="Close popup"
                >
                    ✕
                </button>

                <div className="fishery-popup-header">
                    {/* Left Column: Visual/Map Placeholder */}
                    <div className="fishery-popup-image-card">
                        <div className="fishery-popup-risk-chip" style={{ color: riskColor }}>
                            <span className="risk-dot" style={{ backgroundColor: riskColor }}></span>
                            {risk?.toUpperCase()} RISK
                        </div>

                        {/* Large Icon Placeholder */}
                        <div className="fishery-icon-large">
                            🐟
                        </div>

                        {/* Timestamp */}
                        <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
                            {timestamp ? new Date(timestamp).toLocaleString() : "Unknown Date"}
                        </div>
                    </div>

                    {/* Right Column: Data */}
                    <div className="fishery-popup-summary">
                        <h1 className="fishery-popup-title">{region || "Unknown Region"}</h1>
                        <div className="fishery-popup-subtitle">Status: {environmental_status || "Unknown"}</div>
                        <div className="title-divider"></div>

                        {/* Metrics */}
                        <div className="metric-tiles">
                            <div className="metric-tile" style={{ borderColor: riskColor }}>
                                <div className="metric-number" style={{ color: riskColor }}>
                                    {temperature ?? "—"}
                                    <span className="metric-unit">°C</span>
                                </div>
                                <div className="metric-label">Temperature</div>
                            </div>
                            <div className="metric-tile" style={{ borderColor: riskColor }}>
                                <div className="metric-number" style={{ color: riskColor }}>
                                    {dissolved_oxygen ?? "—"}
                                    <span className="metric-unit">mg/L</span>
                                </div>
                                <div className="metric-label">Dissolved Oxygen</div>
                            </div>
                            <div className="metric-tile" style={{ borderColor: riskColor }}>
                                <div className="metric-number" style={{ color: riskColor }}>
                                    {salinity ?? "—"}
                                    <span className="metric-unit">PSU</span>
                                </div>
                                <div className="metric-label">Salinity</div>
                            </div>
                            <div className="metric-tile" style={{ borderColor: riskColor }}>
                                <div className="metric-number" style={{ color: riskColor }}>
                                    {ph ?? "—"}
                                    <span className="metric-unit">pH</span>
                                </div>
                                <div className="metric-label">Acidity</div>
                            </div>
                        </div>

                        {/* Species List */}
                        <div className="species-section">
                            <div className="species-header">Detected Species</div>
                            <div className="species-list">
                                {speciesList.length > 0 ? (
                                    speciesList.map((fish, idx) => (
                                        <div key={idx} className="species-item">
                                            <div>
                                                <div className="species-name">{fish.name}</div>
                                                {fish.scientific_name && <div className="species-scientific">{fish.scientific_name}</div>}
                                            </div>
                                            {fish.estimated_count && (
                                                <div className="species-count" style={{ color: riskColor }}>
                                                    {fish.estimated_count}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="species-item" style={{ justifyContent: 'center', color: 'var(--muted)' }}>
                                        No species data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FisheryPopup;
