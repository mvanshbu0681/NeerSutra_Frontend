import React from "react";

const VisualsSection = () => {
  return (
    <div
      id="visuals"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Visuals</h2>
        <p style={{ fontSize: "1.2rem", opacity: 0.8 }}>
          Data visualization and analytics coming soon...
        </p>
      </div>
    </div>
  );
};

export default VisualsSection;
