"use client";

import React from "react";
import HeroSection from "../Components/HeroSection";
import Navbar from "../Components/Navbar";
import Navigation from "../Components/Navigation";
import FloaterScene from "../Components/FloaterScene";

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Top Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section - Full viewport height */}
      <section id="hero" className="section">
        <HeroSection />
      </section>

      {/* Navigation Section with Background Image */}
      <section id="navigation" className="section navigation-section">
        <Navigation />
      </section>

      {/* 3D Floater Scene Section - Full viewport height */}
      {/* <section id="floater-3d" className="section">
        <FloaterScene />
      </section> */}
      

      <style>{`
        .home-page {
          min-height: 100vh;
        }

        .section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .navigation-section {
          background-image: url('/blue.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          position: relative;
        }

        .navigation-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1;
        }

        .navigation-section > * {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
