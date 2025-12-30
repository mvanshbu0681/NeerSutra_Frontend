"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { chatbotAnimations } from "../../utils/gsapAnimations";

const ChatSidebar = ({
  chatHistory = [],
  currentSessionId,
  onSessionSelect,
  onDeleteSession,
  onClearAllChats,
  isOpen = true,
  onToggle,
}) => {
  const sidebarRef = useRef(null);
  const historyItemsRef = useRef([]);

  useEffect(() => {
    // Animate sidebar entrance only when opening
    if (sidebarRef.current && isOpen) {
      chatbotAnimations.sidebar.slideIn(sidebarRef.current);
    }
  }, [isOpen]);

  // Memoize sample history to prevent unnecessary re-renders
  const sampleHistory = useMemo(() => {
    return chatHistory.length > 0
      ? chatHistory
      : [
          {
            id: "1",
            title: "Arabian Sea Temperature Analysis",
            lastMessage:
              "Show me temperature data for ARGO floats in the Arabian Sea region",
            timestamp: Date.now() - 86400000,
            messages: [
              {
                text: "Show me temperature data for ARGO floats in the Arabian Sea region",
                isUser: true,
              },
            ],
          },
          {
            id: "2",
            title: "Bay of Bengal Salinity Trends",
            lastMessage:
              "What are the recent salinity measurements in Bay of Bengal?",
            timestamp: Date.now() - 172800000,
            messages: [
              {
                text: "What are the recent salinity measurements in Bay of Bengal?",
                isUser: true,
              },
            ],
          },
          {
            id: "3",
            title: "Float Deployment Status",
            lastMessage: "List all active ARGO floats deployed this month",
            timestamp: Date.now() - 259200000,
            messages: [
              {
                text: "List all active ARGO floats deployed this month",
                isUser: true,
              },
            ],
          },
          {
            id: "4",
            title: "Ocean Current Analysis",
            lastMessage: "Analyze current patterns near Mumbai coast",
            timestamp: Date.now() - 432000000,
            messages: [
              {
                text: "Analyze current patterns near Mumbai coast",
                isUser: true,
              },
            ],
          },
        ];
  }, [chatHistory]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 80) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation(); // Prevent session selection when clicking delete

    // Only allow deletion of real chat history, not sample data
    if (chatHistory.length === 0) {
      return; // Don't delete sample history items
    }

    // Add confirmation for important chats (more than 5 messages)
    const session = chatHistory.find((s) => s.id === sessionId);
    const messageCount = session?.messages?.length || 0;

    let shouldDelete = true;
    if (messageCount > 5) {
      shouldDelete = window.confirm(
        `This conversation has ${messageCount} messages. Are you sure you want to delete it?`
      );
    }

    if (shouldDelete && onDeleteSession) {
      // Add deleting animation class
      const historyItem = e.target.closest(".history-item");
      if (historyItem) {
        historyItem.classList.add("deleting");
        // Wait for animation to complete before actually deleting
        setTimeout(() => {
          onDeleteSession(sessionId);
        }, 300);
      } else {
        onDeleteSession(sessionId);
      }
    }
  };

  const handleContextMenu = (e, sessionId) => {
    e.preventDefault();

    // Only allow context menu for real chat history, not sample data
    if (
      chatHistory.length === 0 ||
      !chatHistory.some((chat) => chat.id === sessionId)
    ) {
      return;
    }

    // Clean up any existing context menus
    const existingMenus = document.querySelectorAll(".context-menu");
    existingMenus.forEach((menu) => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
    });

    const menu = document.createElement("div");
    menu.className = "context-menu";
    menu.innerHTML = `
      <div class="context-menu-item" data-action="delete">
        <span style="color: #EF4444;">🗑️ Delete Chat</span>
      </div>
      <div class="context-menu-item" data-action="rename">
        <span>✏️ Rename Chat</span>
      </div>
    `;

    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px;
      left: ${e.clientX}px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      padding: 4px;
      z-index: 1000;
      min-width: 150px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(menu);

    const handleMenuClick = (e) => {
      const action = e.target.closest(".context-menu-item")?.dataset.action;
      if (action === "delete") {
        handleDeleteClick(e, sessionId);
      }
      document.body.removeChild(menu);
      document.removeEventListener("click", handleMenuClick);
    };

    const handleClickOutside = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener("click", handleClickOutside);
    };

    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      menu.addEventListener("click", handleMenuClick);
    }, 0);
  };

  const handleClearAllClick = () => {
    if (
      onClearAllChats &&
      window.confirm("Are you sure you want to delete all chat history?")
    ) {
      onClearAllChats();
    }
  };

  const getSessionIcon = (session) => {
    const firstMessage = session.messages[0]?.text?.toLowerCase() || "";
    if (firstMessage.includes("temperature")) return "🌡️";
    if (firstMessage.includes("salinity")) return "🧂";
    if (firstMessage.includes("map")) return "🗺️";
    if (firstMessage.includes("float")) return "🎯";
    if (firstMessage.includes("data")) return "📊";
    return "🌊";
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onToggle}
      />

      <div ref={sidebarRef} className={`chat-sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">ARGO AI</h2>
          <p className="sidebar-subtitle">Ocean Intelligence Assistant</p>

          {/* New Conversation Button */}
          <button
            onClick={() => {
              if (window.location.pathname.includes("/chatbot")) {
                window.location.reload();
              }
            }}
            style={{
              marginTop: "16px",
              width: "100%",
              background: "#4886D3",
              border: "none",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 3px 12px rgba(72, 134, 211, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#3670B8";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 5px 20px rgba(72, 134, 211, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#4886D3";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 3px 12px rgba(72, 134, 211, 0.3)";
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>+</span>
            New Conversation
          </button>
        </div>

        {/* Chat History */}
        <div className="chat-history">
          <div
            style={{
              marginBottom: "16px",
              padding: "0 4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "rgba(255, 255, 255, 0.8)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                margin: "0",
              }}
            >
              Recent Conversations
            </h3>
            {chatHistory.length > 0 && (
              <button
                onClick={handleClearAllClick}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.7rem",
                  color: "#EF4444",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(239, 68, 68, 0.2)";
                  e.target.style.borderColor = "rgba(239, 68, 68, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(239, 68, 68, 0.1)";
                  e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {sampleHistory.length > 0 ? (
            sampleHistory.map((session, index) => (
              <div
                key={session.id}
                ref={(el) => (historyItemsRef.current[index] = el)}
                className={`history-item ${
                  currentSessionId === session.id ? "active" : ""
                }`}
                onContextMenu={
                  chatHistory.length > 0 &&
                  chatHistory.some((chat) => chat.id === session.id)
                    ? (e) => handleContextMenu(e, session.id)
                    : undefined
                }
                style={{
                  borderColor:
                    currentSessionId === session.id
                      ? "var(--aqua-blue)"
                      : undefined,
                  background:
                    currentSessionId === session.id
                      ? "rgba(0, 224, 255, 0.15)"
                      : undefined,
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <div
                  onClick={() => onSessionSelect && onSessionSelect(session)}
                  style={{ flex: 1 }}
                >
                  <div className="history-item-header">
                    <div className="history-icon">
                      {getSessionIcon(session)}
                    </div>
                    <h4 className="history-title">{session.title}</h4>
                  </div>

                  <p className="history-preview">
                    {truncateText(session.lastMessage)}
                  </p>

                  <div className="history-timestamp">
                    {formatDate(session.timestamp)}
                  </div>
                </div>

                {/* Delete Button - Only show for real chat history */}
                {chatHistory.length > 0 &&
                  chatHistory.some((chat) => chat.id === session.id) && (
                    <button
                      onClick={(e) => handleDeleteClick(e, session.id)}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#EF4444",
                        fontSize: "12px",
                        cursor: "pointer",
                        opacity: "0",
                        transition: "all 0.2s ease",
                        zIndex: 10,
                      }}
                      className="delete-btn"
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.2)";
                        e.target.style.borderColor = "rgba(239, 68, 68, 0.5)";
                        e.target.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.1)";
                        e.target.style.borderColor = "rgba(239, 68, 68, 0.3)";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      ✕
                    </button>
                  )}
              </div>
            ))
          ) : (
            <div className="chat-history-empty">
              <div className="chat-history-empty-icon">🌊</div>
              <div className="chat-history-empty-text">
                No chat history yet.
                <br />
                Start a conversation to begin exploring ARGO data!
              </div>
            </div>
          )}

          {/* New Chat Button */}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--glass-border)",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "#20C997",
                borderRadius: "50%",
                boxShadow: "0 0 8px #20C997",
              }}
            />
            <span>Connected to ARGO Network</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
