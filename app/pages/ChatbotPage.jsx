"use client";

import React, { useState, useEffect } from "react";
import ChatInterface from "../Components/Chatbot/ChatInterface";
import ErrorBoundary from "../Components/Chatbot/ErrorBoundary";
import APITestPanel from "../Components/Chatbot/APITestPanel";
import Navbar from "../Components/Navbar";

const ChatbotPage = () => {
  const [windowWidth, setWindowWidth] = useState(1024); // Safe default value

  // Handle window resize
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate dynamic padding based on screen size
  const getDynamicPadding = () => {
    // Check if mobile based on current window width
    if (windowWidth <= 480) return "60px";
    if (windowWidth <= 768) return "70px";
    return "80px"; // Desktop
  };

  return (
    <div
      className="chatbot-page"
      style={{
        backgroundImage: "url(/Chatbot.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Fixed navbar at top */}
      <div
        className="navbar-fixed-area"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          pointerEvents: "all",
        }}
      >
        <Navbar isVisible={true} />
      </div>

      <div
        className="chatbot-container"
        style={{
          marginTop: getDynamicPadding(),
          height: `calc(100vh - ${getDynamicPadding()})`,
          width: "100vw",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        <ErrorBoundary>
          <ChatInterface />
        </ErrorBoundary>
      </div>

      {/* Development API Test Panel - Remove in production */}
      {/* {import.meta.env.DEV && <APITestPanel />} */}

      <style>{`
        .chatbot-page {
          height: 100vh !important;
          width: 100vw !important;
          overflow: hidden;
          position: relative;
        }

        .navbar-fixed-area {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .navbar-fixed-area > nav {
          pointer-events: all;
        }

        .chatbot-container {
          box-sizing: border-box;
        }

        /* Ensure ChatInterface fills the available space properly */
        .chatbot-container > div {
          height: 100% !important;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .navbar-fixed-area {
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
          }
        }

        @media (max-width: 480px) {
          .navbar-fixed-area {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotPage;
