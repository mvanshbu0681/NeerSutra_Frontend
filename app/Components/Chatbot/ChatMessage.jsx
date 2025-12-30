import React, { useRef, useState, useCallback } from "react";
import FloatDetailsModal from "./FloatDetailsModal";
import DataTable from "./DataTable";
import ThinkingProcess from "./ThinkingProcess";

const ChatMessage = ({
  message,
  isUser = false,
  timestamp,
  isTyping = false,
  isThinking = false,
  queryData = null,
  onThinkingComplete = null,
}) => {
  const messageRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatMessage = useCallback((text) => {
    // Remove CSV download links from text and other file URLs
    let cleanedText = text.replace(
      /(?:file:\/\/|https?:\/\/)[^\s]+\.csv[^\s]*/gi,
      ""
    );
    cleanedText = cleanedText.replace(/Download the data[^\n]*\n?/gi, "");
    cleanedText = cleanedText.replace(/You can download[^\n]*\n?/gi, "");
    cleanedText = cleanedText.replace(/\[Download CSV\][^)]*\)/gi, "");

    // Split text by code blocks
    const parts = cleanedText.split(/(```[\s\S]*?```)/);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // This is a code block
        const content = part.slice(3, -3);
        const lines = content.split("\n");
        const language = lines[0].trim();
        const code = lines.slice(1).join("\n");

        return (
          <div
            key={index}
            style={{
              margin: "12px 0",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {language && (
              <div
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#2d2d2d",
                  color: "#00E0FF",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                {language}
              </div>
            )}
            <pre
              style={{
                padding: "12px",
                margin: 0,
                color: "#e6e6e6",
                fontSize: "13px",
                lineHeight: "1.4",
                overflow: "auto",
              }}
            >
              <code>{code}</code>
            </pre>
          </div>
        );
      } else {
        // Regular text - handle markdown-style formatting
        return (
          <div key={index} style={{ whiteSpace: "pre-wrap" }}>
            {part.split("\n").map((line, lineIndex) => {
              // Skip empty lines after cleaning
              if (!line.trim()) return <br key={lineIndex} />;

              // Handle table rows (for inline markdown tables, not T3 data)
              if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
                const cells = line
                  .split("|")
                  .slice(1, -1)
                  .map((cell) => cell.trim());
                const isHeader = line.includes("---");

                if (isHeader) return null; // Skip separator rows

                return (
                  <div
                    key={lineIndex}
                    style={{
                      display: "flex",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      padding: "4px 0",
                    }}
                  >
                    {cells.map((cell, cellIndex) => (
                      <div
                        key={cellIndex}
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          fontSize: "13px",
                          color: cellIndex === 0 ? "#00E0FF" : "inherit",
                        }}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                );
              }

              // Handle bold text
              if (line.includes("**")) {
                const boldParts = line.split(/(\*\*.*?\*\*)/);
                return (
                  <div key={lineIndex}>
                    {boldParts.map((boldPart, boldIndex) => {
                      if (
                        boldPart.startsWith("**") &&
                        boldPart.endsWith("**")
                      ) {
                        return (
                          <strong key={boldIndex} style={{ color: "#00E0FF" }}>
                            {boldPart.slice(2, -2)}
                          </strong>
                        );
                      }
                      return boldPart;
                    })}
                  </div>
                );
              }

              return <div key={lineIndex}>{line}</div>;
            })}
          </div>
        );
      }
    });
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Animation removed - using CSS transitions instead

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (isThinking) {
    return (
      <div className="chat-message bot thinking-message">
        <div className="message-avatar bot">🤖</div>
        <div className="message-content">
          <ThinkingProcess isVisible={true} onComplete={onThinkingComplete} />
        </div>
      </div>
    );
  }

  if (isTyping) {
    return (
      <div className={`chat-message bot`} ref={messageRef}>
        <div className="message-avatar bot">
          <img
            src="/mainlogo.svg"
            alt="ARGO AI"
            style={{ width: "24px", height: "24px" }}
          />
        </div>
        <div className="typing-indicator">
          <div className="typing-dots">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
          <span
            style={{
              marginLeft: "8px",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.85rem",
            }}
          >
            ARGO AI is processing...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message ${isUser ? "user" : "bot"}`} ref={messageRef}>
      <div className={`message-avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? (
          <div className="user-avatar">U</div>
        ) : (
          <img
            src="/mainlogo.svg"
            alt="ARGO AI"
            style={{ width: "28px", height: "28px", filter: "grayscale(100%)" }}
          />
        )}
      </div>

      <div className="message-content">
        <div className={`message-bubble ${isUser ? "user" : "bot"}`}>
          <div className="message-text">
            {isUser ? message : formatMessage(message)}
          </div>

          {/* Action Buttons for Bot Messages */}
          {!isUser && !isTyping && message && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                style={{
                  background: "#4886D3",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 3px 10px rgba(72, 134, 211, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#3670B8";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow =
                    "0 5px 16px rgba(72, 134, 211, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#4886D3";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 3px 10px rgba(72, 134, 211, 0.3)";
                }}
              >
                <span>📊</span> VIEW DATA
              </button>
              {/* <button
                style={{
                  background: "transparent",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  color: "#4b5563",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f3f4f6";
                  e.target.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "#d1d5db";
                }}
              >
                <span>🗺️</span> LOCATE ON MAP
              </button> */}
            </div>
          )}

          {/* Data Table for query results */}
          {!isUser && queryData && (
            <DataTable
              data={queryData.sample || null}
              downloadUrl={queryData.download_url}
              sql={queryData.sql}
              tier={queryData.tier}
            />
          )}
        </div>

        {timestamp && (
          <div className="message-timestamp">{formatTimestamp(timestamp)}</div>
        )}
      </div>

      {/* Float Details Modal */}
      <FloatDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        floatData={null} // Pass specific float data here when available
      />
    </div>
  );
};

// Add styles for minimal, classy design
const styles = `
  .thinking-message {
    margin-bottom: 12px;
  }
  
  .chat-message {
    animation: messageSlideIn 0.3s ease-out;
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 500;
  }
  
  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px) translateX(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) translateX(0);
    }
  }
  
  .chat-message.user {
    animation: messageSlideInUser 0.3s ease-out;
  }
  
  @keyframes messageSlideInUser {
    from {
      opacity: 0;
      transform: translateY(8px) translateX(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) translateX(0);
    }
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ChatMessage;
