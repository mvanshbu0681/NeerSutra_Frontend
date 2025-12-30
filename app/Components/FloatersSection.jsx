import React from "react";

const FloatersSection = () => {
  return (
    <div
      id="floaters"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Floaters</h2>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          Floater tracking and management coming soon...
        </p>
      </div>
    </div>
  );
};

export default FloatersSection;
