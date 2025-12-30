"use client";

import React, { useState, useEffect } from "react";

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "map", "visuals", "floaters"];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="floating-nav">
      <div className="nav-dots">
        <button
          className={`nav-dot ${activeSection === "hero" ? "active" : ""}`}
          onClick={() => scrollToSection("hero")}
          title="Hero Section"
        >
          <span className="dot-label">Home</span>
        </button>
        <button
          className={`nav-dot ${activeSection === "map" ? "active" : ""}`}
          onClick={() => scrollToSection("map")}
          title="Map Section"
        >
          <span className="dot-label">Map</span>
        </button>
        <button
          className={`nav-dot ${activeSection === "visuals" ? "active" : ""}`}
          onClick={() => scrollToSection("visuals")}
          title="Visuals Section"
        >
          <span className="dot-label">Visuals</span>
        </button>
        <button
          className={`nav-dot ${activeSection === "floaters" ? "active" : ""}`}
          onClick={() => scrollToSection("floaters")}
          title="Floaters Section"
        >
          <span className="dot-label">Floaters</span>
        </button>
      </div>

      <style jsx>{`
        .floating-nav {
          position: fixed;
          right: 30px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          padding: 15px 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .nav-dots {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .nav-dot {
          position: relative;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-dot:hover {
          transform: scale(1.2);
          border-color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.2);
        }

        .nav-dot.active {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 1);
          transform: scale(1.3);
        }

        .dot-label {
          position: absolute;
          right: 25px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .nav-dot:hover .dot-label {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .floating-nav {
            right: 15px;
            padding: 10px 6px;
          }

          .nav-dot {
            width: 12px;
            height: 12px;
          }

          .dot-label {
            font-size: 0.7rem;
            padding: 3px 8px;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
