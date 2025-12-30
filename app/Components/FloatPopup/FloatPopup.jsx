"use client";

import React, { useState, useRef, useEffect } from "react";
import LevelList from "./LevelList";
import DatePicker from "../DatePicker/DatePicker";
import floaterAPI from "../../utils/floaterAPI";
import {
  formatLatLon,
  formatDate,
  formatTime,
  formatNumber,
} from "./utils/formatters";
import "./FloatPopup.css";

const FloatPopup = ({ isOpen, data, onClose }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [floaterData, setFloaterData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const detailsRef = useRef(null);
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Load initial data when popup opens
  useEffect(() => {
    if (isOpen && data?.platform_number) {
      const platformNumber = parseInt(data.platform_number);

      // Reset state
      setSelectedDate(null);
      setFloaterData(null);
      setError(null);

      // Load available dates and latest data
      loadInitialData(platformNumber);
    }
  }, [isOpen, data?.platform_number]);

  const loadInitialData = async (platformNumber) => {
    setIsLoading(true);
    try {
      // Load available dates and latest data in parallel
      const [datesResponse, latestResponse] = await Promise.all([
        floaterAPI.getFloaterDates(platformNumber),
        floaterAPI.getFloaterLatest(platformNumber),
      ]);

      setAvailableDates(datesResponse);
      setFloaterData(latestResponse);
    } catch (err) {
      console.error("Error loading floater data:", err);
      setError("Failed to load floater data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = async (dateKey) => {
    if (!data?.platform_number) return;

    const platformNumber = parseInt(data.platform_number);
    setSelectedDate(dateKey);

    if (!dateKey) {
      // Load latest data
      setIsLoading(true);
      try {
        const latestResponse = await floaterAPI.getFloaterLatest(
          platformNumber
        );
        setFloaterData(latestResponse);
      } catch (err) {
        console.error("Error loading latest data:", err);
        setError("Failed to load latest data");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Load data for specific date
      setIsLoading(true);
      try {
        const dateResponse = await floaterAPI.getFloaterByDate(
          platformNumber,
          parseInt(dateKey)
        );
        setFloaterData(dateResponse);
      } catch (err) {
        console.error("Error loading date data:", err);
        setError("Failed to load data for selected date");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }

      // Tab trapping
      if (e.key === "Tab") {
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

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleDetailsToggle = () => {
    setIsDetailsExpanded(!isDetailsExpanded);

    // Scroll to details section when expanding
    if (!isDetailsExpanded) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
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

  // Use API data if available, otherwise fallback to passed data with safe defaults
  const displayData = floaterData
    ? {
        platform_number: data.platform_number,
        cycle_number:
          floaterData.summary?.cycle_number || data.cycle_number || "N/A",
        status: data.status || "active",
        captured_at:
          floaterData.summary?.juld_datetime ||
          data.captured_at ||
          new Date().toISOString(),
        location: data.location || { lat: data.latitude, lon: data.longitude },
        image_url: data.image_url || "/floater-img.jpg",
        metrics: {
          temperature_c:
            floaterData.summary?.avg_temp ||
            data.metrics?.temperature_c ||
            null,
          depth_m:
            floaterData.summary?.level_count || data.metrics?.depth_m || null,
          salinity_psu:
            floaterData.summary?.avg_psal || data.metrics?.salinity_psu || null,
          pressure_dbar:
            floaterData.summary?.avg_pres ||
            data.metrics?.pressure_dbar ||
            null,
        },
        levels: floaterData.levels
          ? (() => {
              // Use level_count from summary to limit the data to actual measurements
              const maxLevels =
                floaterData.summary?.level_count || floaterData.levels.length;

              return floaterData.levels
                .filter((level) => {
                  // Only include levels within the actual measurement count
                  const hasValidIndex =
                    level.level_index !== null &&
                    level.level_index !== undefined;
                  const withinCount = hasValidIndex
                    ? level.level_index < maxLevels
                    : true;
                  const hasValidDepth =
                    level.pres !== null &&
                    level.pres !== undefined &&
                    level.pres >= 0;
                  const hasValidData =
                    level.temp !== null || level.psal !== null;

                  return withinCount && hasValidDepth && hasValidData;
                })
                .sort((a, b) => (a.level_index || 0) - (b.level_index || 0)) // Sort by level_index
                .map((level) => ({
                  depth_m: level.level_index || 0,
                  temp_c: level.temp,
                  pres: level.pres,
                  psal: level.psal,
                  level_index: level.level_index,
                }));
            })()
          : [], // No fallback to dummy data - show empty if no API data
      }
    : {
        // Fallback structure before API data loads
        platform_number: data.platform_number || "Unknown",
        cycle_number: data.cycle_number || "N/A",
        status: data.status || "active",
        captured_at: data.captured_at || new Date().toISOString(),
        location: data.location || { lat: data.latitude, lon: data.longitude },
        image_url: data.image_url || "/floater-img.jpg",
        metrics: {
          temperature_c: null,
          depth_m: null,
          salinity_psu: null,
          pressure_dbar: null,
        },
        levels: [],
      };

  const isActive = displayData.status === "active";

  // Debug log to help troubleshoot
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
    console.log("FloatPopup displayData:", displayData);
    console.log("FloatPopup raw floaterData:", floaterData);
    if (floaterData?.levels) {
      const levelCount = floaterData.summary?.level_count;
      console.log("API levels info:", {
        levelCount: levelCount,
        totalLevelsInResponse: floaterData.levels.length,
        actualLevelsDisplayed: displayData.levels.length,
        maxDepth:
          displayData.levels.length > 0
            ? Math.max(...displayData.levels.map((l) => l.depth_m))
            : 0,
        sampleLevels: displayData.levels.slice(0, 3),
      });
    }
  }

  return (
    <div
      className="float-popup-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="float-popup-title"
    >
      <div className="float-popup-modal" ref={modalRef}>
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          className="float-popup-close"
          onClick={onClose}
          aria-label="Close popup"
        >
          ✕
        </button>

        {/* Header Section */}
        <div className="float-popup-header">
          {/* Left Column - Video */}
          <div className="float-popup-image-card">
            <video
              src="/deep_sea.mp4"
              className="float-popup-image"
              autoPlay
              loop
              muted
              playsInline
              aria-label={`ARGO Float ${displayData.platform_number} underwater video`}
            />

            {/* Status Chip */}
            <div
              className={`float-popup-status-chip ${
                isActive ? "active" : "inactive"
              }`}
            >
              <span className="status-dot" aria-live="polite"></span>
              {isActive ? "ACTIVE" : "INACTIVE"}
            </div>

            {/* Location Tag */}
            <div className="float-popup-location">
              {formatLatLon(displayData.location.lat, displayData.location.lon)}
            </div>

            {/* Date and Time */}
            <div className="float-popup-timestamp">
              <span className="date">
                {formatDate(displayData.captured_at)}
              </span>
              <span className="time">
                {formatTime(displayData.captured_at)}
              </span>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="float-popup-summary">
            <h1 id="float-popup-title" className="float-popup-title">
              ARGO FLOAT {displayData.platform_number}
            </h1>
            <div className="title-divider"></div>

            {/* Date Picker */}
            <DatePicker
              dates={availableDates}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              isLoading={isLoading}
            />

            {/* Cycle Row */}
            <div className="cycle-row">
              <span className="cycle-label">Cycle No.</span>
              <span className="cycle-value">{displayData.cycle_number}</span>
            </div>

            {/* Metric Tiles */}
            <div className="metric-tiles">
              <div className="metric-tile">
                <div className="metric-number">
                  {displayData.metrics?.temperature_c !== null
                    ? formatNumber(displayData.metrics?.temperature_c, 1)
                    : "—"}
                  <span className="metric-unit">°C</span>
                </div>
                <div className="metric-label">Temperature</div>
              </div>
              <div className="metric-tile">
                <div className="metric-number">
                  {displayData.metrics?.depth_m !== null
                    ? formatNumber(displayData.metrics?.depth_m, 0)
                    : "—"}
                  <span className="metric-unit">m</span>
                </div>
                <div className="metric-label">Depth</div>
              </div>
              <div className="metric-tile">
                <div className="metric-number">
                  {displayData.metrics?.salinity_psu !== null
                    ? formatNumber(displayData.metrics?.salinity_psu, 2)
                    : "—"}
                  <span className="metric-unit">PSU</span>
                </div>
                <div className="metric-label">Salinity</div>
              </div>
              <div className="metric-tile">
                <div className="metric-number">
                  {displayData.metrics?.pressure_dbar !== null
                    ? formatNumber(displayData.metrics?.pressure_dbar, 0)
                    : "—"}
                  <span className="metric-unit">dbar</span>
                </div>
                <div className="metric-label">Pressure</div>
              </div>
            </div>

            {/* Details Button */}
            <button
              className="details-button"
              onClick={handleDetailsToggle}
              aria-expanded={isDetailsExpanded}
            >
              FLOATER DETAILS
              <span
                className={`details-caret ${
                  isDetailsExpanded ? "expanded" : ""
                }`}
              >
                ⌄
              </span>
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div
          ref={detailsRef}
          className={`float-popup-details ${
            isDetailsExpanded ? "expanded" : ""
          }`}
        >
          <div className="details-content">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading floater data...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : displayData.levels && displayData.levels.length > 0 ? (
              <LevelList levels={displayData.levels} />
            ) : (
              <div className="empty-state">
                No depth level data available for this float.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatPopup;
