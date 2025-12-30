"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollIndicator from "../ScrollIndicator";

const HeroSection = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const ctaRef = useRef(null);

  const scrollToNextSection = () => {
    const nextSection =
      document.querySelector(".navigation-container") ||
      document.querySelector('[data-section="next"]') ||
      document.getElementById("next-section");

    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      // Fallback: scroll by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Set initial states
    gsap.set(containerRef.current, {
      opacity: 0,
    });

    gsap.set(ctaRef.current, {
      opacity: 0,
      y: 30,
    });

    // Create main timeline for animations
    const tl = gsap.timeline();

    // Fade in container
    tl.to(containerRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
    })
      // Animate CTA text
      .to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5"
      );

    // Auto-scroll after 15 seconds
    const autoScrollTimer = setTimeout(() => {
      scrollToNextSection();
    }, 30000);

    // Cleanup
    return () => {
      tl.kill();
      clearTimeout(autoScrollTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-container"
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      >
        <source src="/main.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* CTA Button */}
      <div
        ref={ctaRef}
        className="cta-container"
        onClick={scrollToNextSection}
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <div className="cta-text">Talk to the ocean</div>
        <div className="scroll-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16L16 12H13V8H11V12H8L12 16Z"
              fill="rgba(255, 255, 255, 0.8)"
            />
            <path
              d="M12 20L16 16H13V12H11V16H8L12 20Z"
              fill="rgba(255, 255, 255, 0.6)"
            />
          </svg>
        </div>
      </div>

      {/* Scroll Indicator */}
      {/* <ScrollIndicator targetId="map" text="Explore Map" /> */}

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }

        @keyframes fadeGlow {
          0% {
            text-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
          }
          50% {
            text-shadow: 0 0 30px rgba(100, 255, 218, 0.8);
          }
          100% {
            text-shadow: 0 0 20px rgba(100, 255, 218, 0.5);
          }
        }

        .cta-container {
          transition: all 0.3s ease;
        }

        .cta-container:hover {
          transform: translateX(-50%) scale(1.05);
        }

        .cta-text {
          font-family: "JetBrains Mono", monospace;
          font-size: 1rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 20px;
          text-transform: uppercase;
          margin-bottom: 1px;
          animation: fadeGlow 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .cta-container:hover .cta-text {
          color: rgba(100, 255, 218, 1);
          text-shadow: 0 0 25px rgba(100, 255, 218, 0.8);
        }

        .scroll-arrow {
          position: center;
          animation: bounce 2s infinite;
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }

        .cta-container:hover .scroll-arrow {
          opacity: 1;
        }

        .scroll-arrow svg {
          filter: drop-shadow(0 0 8px rgba(100, 255, 218, 0.3));
        }

        @media (max-width: 768px) {
          .cta-container {
            bottom: 60px;
          }

          .cta-text {
            font-size: 1rem;
            letter-spacing: 15px;
          }

          .scroll-arrow svg {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .cta-container {
            bottom: 50px;
          }

          .cta-text {
            font-size: 0.9rem;
            letter-spacing: 15px;
          }

          .scroll-arrow svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
