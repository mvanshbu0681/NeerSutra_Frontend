"use client";

import React, { useEffect, useRef, useState } from "react";

const Navigation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once animation starts, we can disconnect the observer
          observer.disconnect();
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: '0px 0px -100px 0px' // Start animation slightly before full visibility
      }
    );

    if (navigationRef.current) {
      observer.observe(navigationRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleStartChat = () => {
    window.location.href = '/chatbot';
  };

  const handleOpenMap = () => {
    window.location.href = '/neersutra';
  };

  return (
    <div 
      ref={navigationRef}
      className={`navigation-container ${isVisible ? 'animate' : ''}`}
    >
      {/* Top Right Navigation */}
      <div className="top-nav">
        <a href="/visuals" className="nav-item nav-item-1">
          DATA
        </a>
        <a href="/chatbot" className="nav-item nav-item-2">
          CHAT
        </a>
        <a href="/neersutra" className="nav-item nav-item-3">
          MAP
        </a>
        <a href="/floaters" className="nav-item nav-item-4">
          3D MODEL
        </a>
        <a href="/about" className="nav-item nav-item-5">
          ABOUT
        </a>
      </div>

      {/* Main Navigation Menu */}
      <div className="main-nav-content">
        <hr className="line line-top" />
        <h1 className="nav-title">
          <span className="title-part title-fl">FL</span>
          <img src="/mainlogo.svg" alt="O" className="logo-inline" />
          <span className="title-part title-at">AT CHAT</span>
        </h1>
        <p className="nav-subtitle">
          Your personal assistant on all things ocean data
        </p>
        <hr className="line line-bottom" />

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-button action-btn-1" onClick={handleStartChat}>
            START CHAT
          </button>
          <button className="action-button action-btn-2" onClick={handleOpenMap}>
            OPEN MAP
          </button>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: "NinetiesDisplay";
          src: url("/NinetiesDisplay.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .navigation-container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          position: relative;
          z-index: 2;
          background-image: url("/visuals.jpeg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          font-family: "NinetiesDisplay", "Arial", sans-serif;
          padding-left: 8%;
          opacity: 0;
          transform: scale(1.05);
        }

        .navigation-container.animate {
          animation: fadeInBackground 2s ease-out forwards;
        }

        @keyframes fadeInBackground {
          from {
            opacity: 0;
            transform: scale(1.05);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .top-nav {
          position: absolute;
          top: 30px;
          right: 40px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          z-index: 10;
          transform: translateX(100px);
          opacity: 0;
        }

        .navigation-container.animate .top-nav {
          animation: slideInFromRight 1.5s ease-out forwards;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .nav-item {
          color: #ffffff !important;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 2px;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          padding: 8px 12px;
          font-family: "JetBrains Mono", monospace;
          text-transform: uppercase;
          background: none;
          border: none;
          backdrop-filter: none;
          border-radius: 0;
          opacity: 0;
          transform: translateX(50px);
        }

        .navigation-container.animate .nav-item-1 {
          animation: slideInNav 0.8s ease-out forwards;
          animation-delay: 0.2s;
        }
        .navigation-container.animate .nav-item-2 {
          animation: slideInNav 0.8s ease-out forwards;
          animation-delay: 0.4s;
        }
        .navigation-container.animate .nav-item-3 {
          animation: slideInNav 0.8s ease-out forwards;
          animation-delay: 0.6s;
        }
        .navigation-container.animate .nav-item-4 {
          animation: slideInNav 0.8s ease-out forwards;
          animation-delay: 0.8s;
        }
        .navigation-container.animate .nav-item-5 {
          animation: slideInNav 0.8s ease-out forwards;
          animation-delay: 1s;
        }

        @keyframes slideInNav {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .nav-item:hover {
          color: #00e0ff;
          background: none;
          border: none;
          transform: translateX(-8px) scale(1.05);
          box-shadow: none;
          text-shadow: 0 0 15px rgba(0, 224, 255, 0.6);
        }

        .main-nav-content {
          text-align: left;
          color: white;
          max-width: 600px;
          width: 100%;
          padding: 2rem 0;
          overflow: visible;
          transform: translateX(-100px);
          opacity: 0;
        }

        .navigation-container.animate .main-nav-content {
          animation: slideInFromLeft 1.5s ease-out forwards;
        }

        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .line {
          border: none;
          border-top: 2px solid #ffffff;
          margin: 20px 0;
          width: 190%;
          margin-left: -10%;
          opacity: 0;
          transform: scaleX(0);
          transform-origin: left;
        }

        .navigation-container.animate .line-top {
          animation: expandLine 1.2s ease-out forwards;
          animation-delay: 0.5s;
        }

        .navigation-container.animate .line-bottom {
          animation: expandLine 1.2s ease-out forwards;
          animation-delay: 2.5s;
        }

        @keyframes expandLine {
          to {
            opacity: 0.8;
            transform: scaleX(1);
          }
        }

        .nav-title {
          font-size: 8rem;
          font-weight: 800;
          letter-spacing: 6px;
          margin: 30px 0 10px 0;
          color: #ffffff;
          text-shadow: 0 0 40px rgba(0, 224, 255, 0.5);
          line-height: 1.2;
          font-family: "NinetiesDisplay", "Arial", sans-serif;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-wrap: nowrap;
          white-space: nowrap;
          overflow: visible;
        }

        .title-part {
          opacity: 0;
          transform: translateY(50px);
          display: inline-block;
        }

        .navigation-container.animate .title-fl {
          animation: titleSlideUp 1s ease-out forwards;
          animation-delay: 1s;
        }

        .navigation-container.animate .title-at {
          animation: titleSlideUp 1s ease-out forwards;
          animation-delay: 1.4s;
        }

        @keyframes titleSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logo-inline {
          height: 190px;
          vertical-align: middle;
          margin: -25px -25px;
          filter: drop-shadow(0 0 20px rgba(0, 224, 255, 0.5));
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          opacity: 0;
          transform: scale(0) rotate(180deg);
        }

        .navigation-container.animate .logo-inline {
          animation: logoSpinIn 1.5s ease-out forwards;
          animation-delay: 1.2s;
        }

        @keyframes logoSpinIn {
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .logo-inline:hover {
          transform: scale(1.15) rotate(15deg);
          filter: drop-shadow(0 0 35px rgba(0, 224, 255, 0.9));
        }

        .nav-subtitle {
          font-size: 1.1rem;
          letter-spacing: 2px;
          margin: 2px 0 15px 0;
          opacity: 0;
          font-weight: 300;
          color: #ffffff;
          font-family: "JetBrains Mono", monospace;
          transform: translateY(30px);
        }

        .navigation-container.animate .nav-subtitle {
          animation: subtitleFadeIn 1s ease-out forwards;
          animation-delay: 2s;
        }

        @keyframes subtitleFadeIn {
          to {
            opacity: 0.9;
            transform: translateY(0);
          }
        }

        .action-buttons {
          margin-top: 40px;
          display: flex;
          justify-content: flex-start;
          gap: 25px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(50px);
        }

        .navigation-container.animate .action-buttons {
          animation: buttonsSlideUp 1s ease-out forwards;
          animation-delay: 3s;
        }

        @keyframes buttonsSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .action-button {
          padding: 15px 35px;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
          opacity: 0;
          transform: scale(0.8);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.7)
          );
          color: #333;
          overflow: hidden;
          position: relative;
        }

        .navigation-container.animate .action-btn-1 {
          animation: buttonPopIn 0.6s ease-out forwards;
          animation-delay: 3.2s;
        }

        .navigation-container.animate .action-btn-2 {
          animation: buttonPopIn 0.6s ease-out forwards;
          animation-delay: 3.4s;
        }

        @keyframes buttonPopIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .action-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 224, 255, 0.4),
            transparent
          );
          transition: left 0.6s ease;
        }

        .action-button:hover::before {
          left: 100%;
        }

        .action-button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0, 224, 255, 0.4);
          background: linear-gradient(
            135deg,
            rgba(0, 224, 255, 0.9),
            rgba(0, 180, 255, 0.8)
          );
          color: white;
        }

        .action-button:active {
          transform: translateY(-1px) scale(0.98);
        }

        @media (max-width: 768px) {
          .navigation-container {
            padding-left: 5%;
          }

          .nav-title {
            font-size: 2.5rem;
            letter-spacing: 4px;
          }

          .logo-inline {
            height: 35px;
            margin: 0 3px;
          }

          .nav-subtitle {
            font-size: 1rem;
            letter-spacing: 1px;
          }

          .main-nav-content {
            width: 95%;
            padding: 1.5rem 0;
          }

          .line {
            width: 100%;
          }

          .top-nav {
            top: 20px;
            right: 20px;
            gap: 10px;
          }

          .nav-item {
            font-size: 12px;
            padding: 6px 10px;
          }

          .action-buttons {
            gap: 15px;
            margin-top: 30px;
          }

          .action-button {
            padding: 12px 25px;
            font-size: 12px;
          }

          .line {
            width: 115%;
            margin-left: -7.5%;
          }
        }

        @media (max-width: 480px) {
          .navigation-container {
            padding-left: 4%;
          }

          .nav-title {
            font-size: 2rem;
            letter-spacing: 2px;
          }

          .logo-inline {
            height: 25px;
            margin: 0 2px;
          }

          .nav-subtitle {
            font-size: 0.9rem;
            letter-spacing: 1px;
          }

          .main-nav-content {
            width: 96%;
            padding: 1rem 0;
          }

          .line {
            width: 110%;
            margin: 15px 0;
            margin-left: -5%;
          }

          .action-buttons {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-top: 25px;
          }

          .action-button {
            padding: 10px 20px;
            font-size: 11px;
            width: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default Navigation;