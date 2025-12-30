"use client";

import React, { useRef, useEffect } from "react";
import { chatbotAnimations } from "../../utils/gsapAnimations";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages = [], isLoading = false, currentSession }) => {
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to latest message
    if (messagesContainerRef.current) {
      chatbotAnimations.chatWindow.autoScroll(messagesContainerRef.current);
    }
  }, [messages, isLoading]);

  // Default welcome messages if no messages exist
  const displayMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: "welcome-1",
            text: "Hello! I'm ARGO AI, your ocean intelligence assistant. I can help you explore and analyze ARGO float data from the Indian Ocean region.",
            isUser: false,
            timestamp: Date.now() - 60000,
          },
          {
            id: "welcome-2",
            text: "You can ask me about:\n• 🌊 ARGO float locations and status\n• 🌡️ Temperature and salinity measurements\n• 📊 Data trends and analysis\n• 🗺️ Geographic data visualization\n• 📈 Historical oceanographic patterns",
            isUser: false,
            timestamp: Date.now() - 30000,
          },
          {
            id: "welcome-3",
            text: "What would you like to know about the ocean today?",
            isUser: false,
            timestamp: Date.now(),
          },
        ];

  return (
    <div className="chat-window">
      {/* Messages Container */}
      <div ref={messagesContainerRef} className="chat-messages">
        {/* Messages */}
        {displayMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isThinking={message.isThinking}
            queryData={message.queryData}
          />
        ))}

        {/* Typing Indicator */}
        {isLoading && <ChatMessage message="" isUser={false} isTyping={true} />}
      </div>

      {/* Scroll to bottom button */}
      <button
        onClick={() => {
          if (messagesContainerRef.current) {
            chatbotAnimations.chatWindow.autoScroll(
              messagesContainerRef.current
            );
          }
        }}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          background: "var(--gradient-primary)",
          border: "none",
          borderRadius: "50%",
          color: "white",
          fontSize: "1.2rem",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0, 224, 255, 0.4)",
          transition: "all 0.3s ease",
          display: messages.length > 5 ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 6px 20px rgba(0, 224, 255, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 15px rgba(0, 224, 255, 0.4)";
        }}
        aria-label="Scroll to bottom"
      >
        ⬇️
      </button>
    </div>
  );
};

export default ChatWindow;
