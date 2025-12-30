"use client";

import React from "react";
import Navbar from "../Components/Navbar";
import MissionDashboard from "../Components/MissionDashboard";

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
