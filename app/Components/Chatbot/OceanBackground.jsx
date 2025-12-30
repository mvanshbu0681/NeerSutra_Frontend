"use client";

import React from "react";

const OceanBackground = () => {
  return (
    <div
      className="chatbot-background"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: "url(/Chatbot.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Optional overlay for better text readability */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default OceanBackground;
