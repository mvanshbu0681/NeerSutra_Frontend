import React from "react";

const ScrollIndicator = ({ targetId, text = "Scroll Down" }) => {
  const scrollToTarget = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="scroll-indicator" onClick={scrollToTarget}>
      <span className="scroll-text">{text}</span>
      <span className="scroll-arrow">↓</span>
    </div>
  );
};

export default ScrollIndicator;
