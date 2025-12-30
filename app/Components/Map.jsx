"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Loader } from "@googlemaps/js-api-loader";
import FloaterDetailsModal from "./FloaterDetailsModal";
import FloatPopup from "./FloatPopup/FloatPopup";
import floaterAPI from "../utils/floaterAPI";

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyA4n0kiTE-UJoa_Y7g9ZQmPZUPmgZhEi9Q";

// ————— helpers —————
function toFloatsArray(rows) {
  return (rows ?? [])
    .map((m) => {
      const lat = +m.latitude,
        lng = +m.longitude;
      if (
        Number.isNaN(lat) ||
        Number.isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      )
        return null;
      return {
        id: String(m.platform_number ?? ""),
        platform_number: String(m.platform_number ?? "—"),
        cycle_number: m.cycle_number ?? null,
        date_key: m.date_key ?? null,
        latitude: lat,
        longitude: lng,
        status: m.status || "active",
        depth: m.depth || null,
        battery: m.battery || null,
      };
    })
    .filter(Boolean);
}

// Create SVG icon URL for Google Maps markers
function createFloaterIconURL(status = "active", size = 44) {
  const colors = {
    active: {
      primary: "#e8e8e8",
      secondary: "#c0c0c0",
      accent: "#f5f5f5",
      antenna: "#1976d2",
      sensor: "#ff5722",
    },
    warning: {
      primary: "#e8e8e8",
      secondary: "#c0c0c0",
      accent: "#f5f5f5",
      antenna: "#ff9800",
      sensor: "#ff5722",
    },
    offline: {
      primary: "#9e9e9e",
      secondary: "#757575",
      accent: "#bdbdbd",
      antenna: "#616161",
      sensor: "#424242",
    },
  }[status] || {
    primary: "#e8e8e8",
    secondary: "#c0c0c0",
    accent: "#f5f5f5",
    antenna: "#1976d2",
    sensor: "#ff5722",
  };

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${colors.secondary}"/>
          <stop offset="30%" style="stop-color:${colors.accent}"/>
          <stop offset="70%" style="stop-color:${colors.primary}"/>
          <stop offset="100%" style="stop-color:${colors.secondary}"/>
        </linearGradient>
      </defs>
      
      <!-- Shadow -->
      <ellipse cx="${size / 2 + 1}" cy="${size * 0.88}" rx="${
    size * 0.18
  }" ry="${size * 0.06}" fill="rgba(0,0,0,0.25)"/>
      
      <!-- Main body -->
      <rect x="${size * 0.38}" y="${size * 0.18}" width="${
    size * 0.24
  }" height="${size * 0.55}" rx="2" fill="url(#bodyGrad)"/>
      
      <!-- Top cap -->
      <ellipse cx="${size / 2}" cy="${size * 0.18}" rx="${size * 0.12}" ry="${
    size * 0.04
  }" fill="${colors.accent}"/>
      
      <!-- Bottom cap -->
      <ellipse cx="${size / 2}" cy="${size * 0.73}" rx="${size * 0.12}" ry="${
    size * 0.04
  }" fill="${colors.secondary}"/>
      
      <!-- Sensor band -->
      <rect x="${size * 0.38}" y="${size * 0.42}" width="${
    size * 0.24
  }" height="${size * 0.07}" fill="#424242"/>
      
      <!-- Antenna -->
      <line x1="${size / 2}" y1="${size * 0.18}" x2="${size / 2}" y2="${
    size * 0.06
  }" stroke="${colors.antenna}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="${size / 2}" cy="${size * 0.05}" r="${size * 0.025}" fill="${
    colors.antenna
  }"/>
      
      <!-- Sensor light -->
      <circle cx="${size * 0.56}" cy="${size * 0.35}" r="${
    size * 0.018
  }" fill="${colors.sensor}"/>
      
      <!-- Highlight -->
      <rect x="${size * 0.39}" y="${size * 0.18}" width="${
    size * 0.025
  }" height="${size * 0.55}" fill="rgba(255,255,255,0.35)" rx="1"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

// ————— component —————
export default function AnimatedIndiaMap() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const googleRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floaterData, setFloaterData] = useState(null);
  const [isFloatPopupOpen, setIsFloatPopupOpen] = useState(false);
  const [selectedFloatData, setSelectedFloatData] = useState(null);
  const [realFloaterData, setRealFloaterData] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [floatersVisible, setFloatersVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load real floater data on component mount
  useEffect(() => {
    const loadFloaters = async () => {
      try {
        const floaters = await floaterAPI.getLatestFloaters();
        setRealFloaterData(floaters);
      } catch (error) {
        console.error("Error loading floaters:", error);
        setRealFloaterData([]);
      }
    };

    loadFloaters();
  }, []);

  const floatsArray = useMemo(
    () => toFloatsArray(realFloaterData.length > 0 ? realFloaterData : []),
    [realFloaterData]
  );

  // Initialize Google Maps
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["marker", "geometry"],
    });

    loader
      .load()
      .then((google) => {
        googleRef.current = google;

        // Dark ocean-focused map style for Indian Ocean visibility
        const darkMapStyle = [
          { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0f172a" }],
          },
          { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
          {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#334155" }],
          },
          {
            featureType: "administrative.country",
            elementType: "labels.text.fill",
            stylers: [{ color: "#cbd5e1" }],
          },
          {
            featureType: "administrative.province",
            elementType: "labels.text.fill",
            stylers: [{ color: "#94a3b8" }],
          },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#94a3b8" }],
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#1e293b" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#1e293b" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#64748b" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#1e3a2f" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#334155" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1e293b" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#64748b" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#475569" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#334155" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#0c4a6e" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#38bdf8" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#0c4a6e" }],
          },
        ];

        const map = new google.maps.Map(containerRef.current, {
          // Center on Indian Ocean for better visibility
          center: { lat: 12.0, lng: 75.0 },
          zoom: 5,
          minZoom: 3,
          maxZoom: 18,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [
              google.maps.MapTypeId.HYBRID,
              google.maps.MapTypeId.SATELLITE,
              google.maps.MapTypeId.ROADMAP,
              google.maps.MapTypeId.TERRAIN,
            ],
          },
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
          streetViewControl: false,
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP,
          },
          scaleControl: true,
          rotateControl: false,
          gestureHandling: "greedy",
          styles: darkMapStyle,
          restriction: {
            latLngBounds: {
              north: 40,
              south: -15,
              west: 50,
              east: 100,
            },
            strictBounds: false,
          },
        });

        mapRef.current = map;
        setMapLoaded(true);
        setIsLoading(false);

        // Add idle listener for smooth rendering
        map.addListener("idle", () => {
          // Map has finished loading/moving
        });
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
        setIsLoading(false);
      });

    return () => {
      // Cleanup markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          if (marker.setMap) marker.setMap(null);
        });
        markersRef.current = [];
      }
      mapRef.current = null;
    };
  }, []);

  // Create and update markers when floater data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !googleRef.current) return;

    const google = googleRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      if (marker.setMap) marker.setMap(null);
    });
    markersRef.current = [];

    // Create new markers for each floater
    floatsArray.forEach((floater) => {
      const iconUrl = createFloaterIconURL(floater.status, 44);

      const marker = new google.maps.Marker({
        position: { lat: floater.latitude, lng: floater.longitude },
        map: mapRef.current,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36),
        },
        title: `Floater ${floater.platform_number}`,
        optimized: true,
        visible: floatersVisible,
        animation: null,
      });

      // Store floater data on marker for click handler
      marker.floaterData = floater;

      // Add click listener
      marker.addListener("click", () => {
        const data = {
          platform_number: floater.platform_number,
          location: { lat: floater.latitude, lon: floater.longitude },
        };
        setSelectedFloatData(data);
        setIsFloatPopupOpen(true);

        // Smooth pan to marker
        mapRef.current.panTo(marker.getPosition());
      });

      // Add hover effect
      marker.addListener("mouseover", () => {
        marker.setIcon({
          url: iconUrl,
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 44),
        });
      });

      marker.addListener("mouseout", () => {
        marker.setIcon({
          url: iconUrl,
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36),
        });
      });

      markersRef.current.push(marker);
    });
  }, [floatsArray, mapLoaded, floatersVisible]);

  // Toggle floaters visibility
  useEffect(() => {
    if (!mapLoaded || !markersRef.current) return;

    markersRef.current.forEach((marker) => {
      if (marker.setVisible) {
        marker.setVisible(floatersVisible);
      }
    });
  }, [floatersVisible, mapLoaded]);

  const closeModal = () => {
    setIsModalOpen(false);
    setFloaterData(null);
  };

  const closeFloatPopup = () => {
    setIsFloatPopupOpen(false);
    setSelectedFloatData(null);
  };

  // Zoom to fit all floaters
  const fitToFloaters = useCallback(() => {
    if (!mapRef.current || !googleRef.current || floatsArray.length === 0)
      return;

    const google = googleRef.current;
    const bounds = new google.maps.LatLngBounds();

    floatsArray.forEach((floater) => {
      bounds.extend({ lat: floater.latitude, lng: floater.longitude });
    });

    mapRef.current.fitBounds(bounds, { padding: 50 });
  }, [floatsArray]);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">
              Loading Google Maps...
            </span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Professional Layer Control Sidebar */}
      <div
        className="absolute z-40 backdrop-blur-xl rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10"
        style={{
          top: "100px",
          left: "16px",
          background:
            "linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 50%, rgba(15, 23, 42, 0.95) 100%)",
          borderColor: "rgba(100, 116, 139, 0.25)",
          width: "240px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset, 0 -1px 0 0 rgba(255, 255, 255, 0.1) inset",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b border-slate-700/40"
          style={{
            background:
              "linear-gradient(180deg, rgba(51, 65, 85, 0.25) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <svg
                className="w-4 h-4 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <div>
              <strong className="text-sm font-semibold text-white/95 tracking-wide block leading-tight">
                Map Layers
              </strong>
              <span className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                Google Maps
              </span>
            </div>
          </div>
        </div>

        {/* Layer Toggle Sections */}
        <div className="p-3 space-y-2">
          {/* Floaters Info */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/40 hover:border-slate-600/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/30 animate-pulse" />
                <span className="text-xs font-medium text-white/90">
                  Argo Floaters
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded-full">
                  {realFloaterData.length}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={floatersVisible}
                  onChange={(e) => setFloatersVisible(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-[18px] bg-slate-700/80 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400/50 rounded-full peer peer-checked:after:translate-x-[14px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[14px] after:w-[14px] after:transition-all after:shadow-sm peer-checked:bg-blue-500/80"></div>
              </label>
            </div>

            {floatersVisible && (
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-700/40">
                {[
                  { color: "#4ade80", label: "Active", status: "active" },
                  { color: "#fbbf24", label: "Warning", status: "warning" },
                  { color: "#94a3b8", label: "Offline", status: "offline" },
                ].map((item, idx) => {
                  const count = floatsArray.filter(
                    (f) => f.status === item.status
                  ).length;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 0 6px ${item.color}40`,
                          }}
                        />
                        <span className="text-slate-300/90">{item.label}</span>
                      </div>
                      <span className="text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/40">
            <button
              onClick={fitToFloaters}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-xs text-cyan-400 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
              Fit All Floaters
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2.5 border-t border-slate-700/30"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.4) 100%)",
          }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse"></div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">
              Live Data
            </span>
          </div>
        </div>
      </div>

      <FloaterDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        floaterData={floaterData}
        loading={!floaterData && isModalOpen}
      />
      <FloatPopup
        isOpen={isFloatPopupOpen}
        data={selectedFloatData}
        onClose={closeFloatPopup}
      />
    </div>
  );
}
