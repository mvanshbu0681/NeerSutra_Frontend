"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const Navbar = ({ isVisible = true }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the hero section (home page)
  const isOnHeroSection = pathname === "/";
  const isOnChatbotPage = pathname === "/chatbot";
  const isOnNeerSutra = pathname === "/neersutra" || pathname === "/neersutra/che";

  // Hide navbar completely on NeerSutra pages (they have their own HUD)
  if (isOnNeerSutra) {
    return null;
  }

  // Check if we need glassy background (not on hero section or when scrolled on hero)
  const needsGlassyBackground = !isOnHeroSection || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Only add scroll listener if not on chatbot page
    if (!isOnChatbotPage) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (!isOnChatbotPage) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isOnChatbotPage]);

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`navbar ${needsGlassyBackground ? "glassy" : ""} ${
        isScrolled ? "scrolled" : ""
      } ${isOnChatbotPage ? "chatbot-navbar" : ""} ${
        isOnChatbotPage && !isVisible ? "hidden" : ""
      }`}
    >
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand" onClick={handleLogoClick}>
          <div className="logo">
            <img
              src="/mainlogo.svg"
              alt="Float Chat Logo"
              width="80"
              height="80"
              className="logo-img"
            />
          </div>
          <div className="brand-text">
            <span className="brand-name">Float Chat</span>
            {/* <span className="brand-tagline">Ocean Intelligence</span> */}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <button className="nav-link" onClick={() => handleNavigation("/")}>
            <span className="nav-text">HOME</span>
            <div className="nav-underline"></div>
          </button>
          <button
            className="nav-link"
            onClick={() => handleNavigation("/visuals")}
          >
            <span className="nav-text">DATA</span>
            <div className="nav-underline"></div>
          </button>
          <button
            className="nav-link"
            onClick={() => handleNavigation("/chatbot")}
          >
            <span className="nav-text">CHAT</span>
            <div className="nav-underline"></div>
          </button>
          <button className="nav-link" onClick={() => handleNavigation("/neersutra")}>
            <span className="nav-text">MAP</span>
            <div className="nav-underline"></div>
          </button>
          <button
            className="nav-link"
            onClick={() => handleNavigation("/floaters")}
          >
            <span className="nav-text">3D MODEL</span>
            <div className="nav-underline"></div>
          </button>
          <button
            className="nav-link"
            onClick={() => handleNavigation("/about")}
          >
            <span className="nav-text">ABOUT</span>
            <div className="nav-underline"></div>
          </button>
        </div>

        {/* Launch Map Button */}
        <button
          className="launch-map-btn"
          onClick={() => handleNavigation("/neersutra")}
        >
          <span className="launch-btn-glow"></span>
          <span className="launch-btn-content">
            <svg className="launch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>Launch Map</span>
          </span>
        </button>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-content">
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/")}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">HOME</span>
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/visuals")}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">DATA</span>
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/chatbot")}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">CHAT</span>
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/neersutra")}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-text">MAP</span>
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/floaters")}
          >
            <span className="nav-icon">🎯</span>
            <span className="nav-text">3D MODEL</span>
          </button>
          <button
            className="mobile-nav-link"
            onClick={() => handleNavigation("/about")}
          >
            <span className="nav-icon">ℹ️</span>
            <span className="nav-text">ABOUT</span>
          </button>
          <button
            className="mobile-nav-link neersutra-mobile"
            onClick={() => handleNavigation("/neersutra")}
          >
            <span className="nav-icon">🚀</span>
            <span className="nav-text">LAUNCH MAP</span>
          </button>
        </div>
      </div>

      <style>{`
        
        @font-face {
          font-family: "NinetiesDisplay";
          src: url("/NinetiesDisplay.otf") format("opentype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 0.5rem 0;
          background: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar.chatbot-navbar {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15);
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar.chatbot-navbar.hidden {
          transform: translateY(-100%);
          opacity: 0;
          visibility: hidden;
        }

        .navbar.glassy {
          background: rgba(15, 23, 42, 0.15);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
        }

        .navbar.scrolled {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(25px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 0 4px 32px rgba(0, 0, 0, 0.15);
        }

        .navbar-container {
          height: 50px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .navbar-brand:hover .logo-img {
          transform: scale(1.05) rotate(5deg);
        }

        .logo {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-img {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.3));
          border-radius: 6px;
          width: 40px;
          height: 40px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .brand-name {
          font-family: 'NinetiesDisplay', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1;
          text-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
          transition: all 0.3s ease;
        }

        .brand-tagline {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(148, 163, 184, 0.8);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1;
        }

        .navbar.scrolled .brand-name {
          color: #ffffff;
          text-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
        }

        .navbar.scrolled .brand-tagline {
          color: rgba(148, 163, 184, 0.9);
        }

        .navbar.glassy .brand-name {
          color: #ffffff;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
        }

        .navbar.glassy .brand-tagline {
          color: rgba(255, 255, 255, 0.8);
        }

        .navbar-links {
          display: flex;
          gap: 0.25rem;
          align-items: center;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          overflow: hidden;
          margin: 0 0.125rem;
          border-radius: 6px;
        }

        .nav-link::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 212, 255, 0.2),
            transparent
          );
          transition: left 0.6s ease;
        }

        .nav-link:hover::before {
          left: 100%;
        }

        .nav-link:hover {
          color: #00d4ff;
          background: none;
          border: none;
          transform: translateY(-2px);
          box-shadow: none;
        }

        .nav-link:hover .nav-underline {
          width: 100%;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-link:active {
          transform: translateY(0);
        }

        .nav-text {
          font-weight: 600;
          letter-spacing: 0.025em;
        }

        .nav-icon {
          font-size: 1.125rem;
          transition: all 0.3s ease;
        }

        .nav-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #00d4ff, #0099cc);
          transition: width 0.3s ease;
        }

        /* Launch Map Button - Premium Neon Style */
        .launch-map-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1.25rem;
          background: rgba(34, 211, 238, 0.08);
          border: 1px solid rgba(34, 211, 238, 0.4);
          border-radius: 9999px;
          color: #22d3ee;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .launch-map-btn:hover {
          background: rgba(34, 211, 238, 0.15);
          border-color: #22d3ee;
          box-shadow: 
            0 0 24px rgba(34, 211, 238, 0.4),
            0 0 48px rgba(34, 211, 238, 0.2),
            inset 0 0 24px rgba(34, 211, 238, 0.08);
          transform: translateY(-2px);
        }

        .launch-btn-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.4), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
          animation: glow-sweep 2s ease-in-out infinite;
        }

        .launch-map-btn:hover .launch-btn-glow {
          opacity: 1;
        }

        @keyframes glow-sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        .launch-btn-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .launch-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .launch-arrow {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }

        .launch-map-btn:hover .launch-arrow {
          transform: translateX(3px);
        }

        .launch-map-btn:hover .launch-icon {
          transform: scale(1.1);
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .mobile-menu-btn:hover {
          background: rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .hamburger-line {
          width: 16px;
          height: 1.5px;
          background: #ffffff;
          margin: 1.5px 0;
          transition: all 0.3s ease;
          border-radius: 1px;
        }

        .hamburger-line.active:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger-line.active:nth-child(2) {
          opacity: 0;
        }

        .hamburger-line.active:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        .mobile-nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .mobile-nav.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: all;
        }

        .mobile-nav-content {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          font-family: "JetBrains Mono", monospace;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          backdrop-filter: blur(10px);
        }

        .mobile-nav-link:hover {
          background: rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(0, 212, 255, 0.3);
          transform: translateX(4px);
        }

        .mobile-nav-link.neersutra-mobile {
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          color: #22d3ee;
        }

        .mobile-nav-link.neersutra-mobile:hover {
          background: rgba(34, 211, 238, 0.2);
          border-color: #22d3ee;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .navbar-container {
            padding: 0 1.5rem;
            max-width: 100%;
          }

          .nav-link {
            padding: 0.5rem 0.875rem;
            font-size: 0.75rem;
          }

          .brand-name {
            font-size: 1.375rem;
          }

          .logo-img {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
            height: 45px;
          }

          .navbar-links {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .brand-name {
            font-size: 1.25rem;
          }

          .logo-img {
            width: 32px;
            height: 32px;
          }

          .navbar-brand {
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .navbar-container {
            padding: 0 0.75rem;
            height: 40px;
          }

          .brand-name {
            font-size: 1.125rem;
          }

          .logo-img {
            width: 28px;
            height: 28px;
          }

          .mobile-menu-btn {
            width: 32px;
            height: 32px;
          }

          .hamburger-line {
            width: 14px;
            height: 1px;
            margin: 1px 0;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;