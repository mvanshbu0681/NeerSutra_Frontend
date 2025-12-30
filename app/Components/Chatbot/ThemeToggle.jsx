"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const ThemeToggle = ({ onThemeChange }) => {
  const [currentTheme, setCurrentTheme] = useState("dark");

  const applyTheme = useCallback(
    (theme) => {
      const chatbotInterface = document.querySelector(".chatbot-interface");
      if (chatbotInterface) {
        // Remove existing theme classes
        chatbotInterface.classList.remove("dark-theme", "light-theme");
        // Add new theme class
        chatbotInterface.classList.add(`${theme}-theme`);
      }

      // Save to localStorage
      localStorage.setItem("argo-chatbot-theme", theme);

      // Notify parent component
      if (onThemeChange) {
        onThemeChange(theme);
      }
    },
    [onThemeChange]
  );

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("argo-chatbot-theme") || "dark";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, [applyTheme]);

  const handleThemeToggle = (newTheme) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <motion.div
      className="theme-toggle"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <motion.div
        className={`theme-option ${currentTheme === "dark" ? "active" : ""}`}
        onClick={() => handleThemeToggle("dark")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🌙 Deep Ocean
      </motion.div>

      <motion.div
        className={`theme-option ${currentTheme === "light" ? "active" : ""}`}
        onClick={() => handleThemeToggle("light")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ☀️ Surface
      </motion.div>
    </motion.div>
  );
};

export default ThemeToggle;
