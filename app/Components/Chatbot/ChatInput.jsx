"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

const ChatInput = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleInputFocus = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = "scale(1.01)";
      containerRef.current.style.boxShadow = "0 0 20px rgba(0, 224, 255, 0.3)";
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.transform = "scale(1)";
      containerRef.current.style.boxShadow = "0 0 0px rgba(0, 224, 255, 0)";
    }
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSendMessage(message.trim());
        setMessage("");
      }
    },
    [message, isLoading, onSendMessage]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const placeholderTexts = useMemo(
    () => [
      "Ask about ARGO floats in the Arabian Sea...",
      "What's the temperature data for Bay of Bengal?",
      "Show me recent float deployments...",
      "Find salinity measurements near Mumbai...",
      "Analyze ocean currents in the Indian Ocean...",
    ],
    []
  );

  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholderTexts[0]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => {
        const currentIndex = placeholderTexts.indexOf(prev);
        return placeholderTexts[(currentIndex + 1) % placeholderTexts.length];
      });
    }, 4000); // Increased interval to reduce animation frequency

    return () => clearInterval(interval);
  }, [placeholderTexts]);

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit}>
        <div className="chat-input-wrapper" ref={containerRef}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="chat-input"
            placeholder={currentPlaceholder}
            disabled={isLoading}
            autoComplete="off"
            aria-label="Type your message about ARGO floats"
          />

          <button
            type="submit"
            className="send-button"
            disabled={!message.trim() || isLoading}
            aria-label="Send message"
            style={{
              opacity: !message.trim() || isLoading ? 0.5 : 1,
              cursor: !message.trim() || isLoading ? "not-allowed" : "pointer",
            }}
          >
            <span className="send-icon">➤</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
