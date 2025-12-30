"use client";

import React from "react";
import FloaterScene from "../Components/FloaterScene";
import Navbar from "../Components/Navbar";

const FloatersPage = () => {
  return (
    <div className="floaters-page">
      <Navbar />
      <div className="floaters-container">
        <FloaterScene />
      </div>

      <style>{`
        .floaters-page {
          min-height: 100vh;
        }

        .floaters-container {
          min-height: 100vh;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default FloatersPage;
