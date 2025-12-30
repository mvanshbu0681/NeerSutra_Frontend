"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

const About = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <div
        className="about-page"
        style={{
          backgroundImage: "url(/About.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-end",
          padding: "0 8%",
        }}
      >
        {/* Main Content Container */}
        <div
          style={{
            maxWidth: "700px",
            width: "100%",
            textAlign: "right",
            transition: "all 1s ease-in-out",
            transform: isLoaded ? "translateX(0)" : "translateX(100px)",
            opacity: isLoaded ? 1 : 0,
          }}
        >
          {/* ABOUT US Heading */}
          <h1
            style={{
              fontSize: "5rem",
              fontWeight: "900",
              color: "black",
              margin: "0 0 50px 0",
              lineHeight: "1",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "2px",
              marginTop: "120px",
            }}
          >
            ABOUT US
          </h1>

          {/* First Paragraph */}
          <p
            style={{
              fontSize: "1.4rem",
              lineHeight: "1.8",
              color: "black",
              marginBottom: "30px",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "550",
            }}
          >
            The Saltwater Drifters are a team of tech enthusiasts from Bennett
            University who created this project as our entry for the Smart India
            Hackathon 2025.
          </p>

          {/* Second Paragraph */}
          <p
            style={{
              fontSize: "1.4rem",
              lineHeight: "1.8",
              color: "black",
              marginBottom: "0",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "550",
            }}
          >
            We aim to create realistic and innovative solutions to real world
            problems, and have aspired to learn and grow alongside. the creation
            of this project
          </p>
        </div>

        {/* Mobile Responsive Styles */}
        <style jsx>{`
          @media (max-width: 1024px) {
            .about-page {
              padding: 0 5% !important;
            }

            .about-page h1 {
              font-size: 4rem !important;
              margin-bottom: 30px !important;
            }

            .about-page p {
              font-size: 1.2rem !important;
            }
          }

          @media (max-width: 768px) {
            .about-page {
              align-items: center !important;
              padding: 80px 5% !important;
            }

            .about-page > div {
              text-align: center !important;
              max-width: 90% !important;
            }

            .about-page h1 {
              font-size: 3.5rem !important;
              margin-bottom: 25px !important;
            }

            .about-page p {
              font-size: 1.15rem !important;
              line-height: 1.6 !important;
              margin-bottom: 20px !important;
            }
          }

          @media (max-width: 480px) {
            .about-page h1 {
              font-size: 2.5rem !important;
              margin-bottom: 20px !important;
            }

            .about-page p {
              font-size: 1rem !important;
              line-height: 1.5 !important;
              margin-bottom: 15px !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default About;
