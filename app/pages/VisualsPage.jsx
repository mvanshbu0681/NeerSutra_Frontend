"use client";

import React from "react";
import dynamic from "next/dynamic";
import Navbar from "../Components/Navbar";

// MissionDashboard pulls in recharts + framer-motion (large). It is already a
// client-only component, so deferring it to its own chunk keeps the initial
// route payload small without changing what the user sees.
const MissionDashboard = dynamic(() => import("../Components/MissionDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
      Loading dashboard…
    </div>
  ),
});

const VisualsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Navbar */}
      <Navbar />
      
      {/* NeerSutra Mission Dashboard */}
      <div className="pt-24 px-8 pb-16">
        <MissionDashboard />
      </div>
    </div>
  );
};

export default VisualsPage;
