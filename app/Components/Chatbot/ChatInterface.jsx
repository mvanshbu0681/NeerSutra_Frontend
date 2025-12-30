"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import ErrorBoundary from "./ErrorBoundary";
import floatChatAPI from "../../utils/floatChatAPI";
import "../../styles/chatbot.css";

const ChatInterface = () => {
  // State Management
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState(null);

  // Refs
  const chatInterfaceRef = useRef(null);
  const currentConversationId = useRef(null);

  // API Health Check
  const checkApiHealth = useCallback(async () => {
    try {
      const healthy = await floatChatAPI.checkHealth();
      setIsApiConnected(healthy);
    } catch (error) {
      console.error("API health check failed:", error);
      setIsApiConnected(false);
    }
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatHistory");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }

    // Check API health on mount
    checkApiHealth();
  }, [checkApiHealth]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Generate session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create new chat session
  const createNewSession = useCallback(() => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    currentConversationId.current = null;

    // Create new session in history
    const newSession = {
      id: newSessionId,
      title: "New Conversation",
      lastMessage: "",
      timestamp: Date.now(),
      messages: [],
    };

    setChatHistory((prev) => [newSession, ...prev]);
    return newSessionId;
  }, [generateSessionId]);

  // Send message handler
  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!messageText.trim() || isLoading) return;

      // Create or ensure current session
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = createNewSession();
      }

      // Add user message
      const userMessage = {
        id: `msg_${Date.now()}_user`,
        text: messageText,
        isUser: true,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Add thinking message
      const thinkingMsg = {
        id: `thinking_${Date.now()}`,
        text: "",
        isUser: false,
        isThinking: true,
        timestamp: Date.now(),
      };
      setThinkingMessage(thinkingMsg);

      try {
        let response;

        if (isApiConnected) {
          // Use real API
          response = await floatChatAPI.sendChatQuery(
            messageText,
            true, // debug mode
            currentConversationId.current
          );

          // Update conversation ID for future messages
          if (response.conversation_id) {
            currentConversationId.current = response.conversation_id;
          }
        } else {
          // Fallback to mock response
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
          response = {
            answer: `I'm currently unable to connect to the ARGO database, but I can provide general information about oceanographic data. Your question about "${messageText}" is interesting! In general, ARGO floats collect temperature, salinity, and pressure data across the world's oceans.`,
            sql: null,
            sample: null,
            hasData: false,
          };
        }

        // Remove thinking message and add AI response
        setThinkingMessage(null);

        const aiMessage = {
          id: `msg_${Date.now()}_ai`,
          text: response.answer,
          isUser: false,
          timestamp: Date.now(),
          queryData:
            response.sql ||
            response.download_url ||
            (response.sample &&
              response.sample.rows &&
              response.sample.rows.length > 0)
              ? {
                  sample: response.sample || null,
                  download_url: response.download_url,
                  sql: response.sql,
                  tier: response.tier,
                }
              : null,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update session title if it's the first message
        setChatHistory((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  title:
                    session.title === "New Conversation"
                      ? messageText.slice(0, 50) +
                        (messageText.length > 50 ? "..." : "")
                      : session.title,
                  lastMessage: response.answer.slice(0, 100) + "...",
                  messages: [...session.messages, userMessage, aiMessage],
                }
              : session
          )
        );
      } catch (error) {
        console.error("Error sending message:", error);

        setThinkingMessage(null);

        const errorMessage = {
          id: `msg_${Date.now()}_error`,
          text: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
          isUser: false,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, isLoading, isApiConnected, createNewSession]
  );

  // Session selection handler
  const handleSessionSelect = useCallback(
    (sessionId) => {
      const session = chatHistory.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSessionId(sessionId);
        setMessages(session.messages || []);
        currentConversationId.current = null; // Reset for new session
      }
    },
    [chatHistory]
  );

  // Delete session handler
  const handleDeleteSession = useCallback(
    (sessionId) => {
      setChatHistory((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
        currentConversationId.current = null;
      }
    },
    [currentSessionId]
  );

  // Clear all chats handler
  const handleClearAllChats = useCallback(() => {
    setChatHistory([]);
    setCurrentSessionId(null);
    setMessages([]);
    currentConversationId.current = null;
    localStorage.removeItem("chatHistory");
  }, []);

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Auto-create session if none exists and user starts typing
  useEffect(() => {
    if (!currentSessionId && messages.length === 0) {
      // Don't auto-create, let user create when they send first message
    }
  }, [currentSessionId, messages.length]);

  const currentSession = chatHistory.find(
    (session) => session.id === currentSessionId
  );

  // Prepare messages for display including thinking state
  const displayMessages = React.useMemo(() => {
    const msgs = [...messages];
    if (thinkingMessage) {
      msgs.push(thinkingMessage);
    }
    return msgs;
  }, [messages, thinkingMessage]);

  return (
    <ErrorBoundary>
      <div className="chatbot-interface" ref={chatInterfaceRef}>
        {/* Sidebar */}
        <ChatSidebar
          chatHistory={chatHistory}
          currentSessionId={currentSessionId}
          onSessionSelect={handleSessionSelect}
          onDeleteSession={handleDeleteSession}
          onClearAllChats={handleClearAllChats}
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
        />

        {/* Main Chat Area */}
        <div className={`chat-main ${!isSidebarOpen ? "sidebar-closed" : ""}`}>
          {/* Chat Window */}
          <ChatWindow
            messages={displayMessages}
            isLoading={isLoading}
            currentSession={currentSession}
          />

          {/* Chat Input */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* Mobile Sidebar Toggle */}
        <button
          className="sidebar-toggle mobile-only"
          onClick={handleToggleSidebar}
          aria-label="Toggle Chat History"
        >
          <span className="toggle-icon">{isSidebarOpen ? "✕" : "☰"}</span>
        </button>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay mobile-only"
            onClick={handleToggleSidebar}
          />
        )}
      </div>

      <style jsx>{`
        .chatbot-interface {
          display: flex;
          height: 100vh;
          width: 100%;
          position: relative;
          background: transparent;
        }

        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .chat-main.sidebar-closed {
          margin-left: 0;
        }

        .sidebar-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 8px;
          color: #2d3748;
          cursor: pointer;
          z-index: 1001;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .toggle-icon {
          font-size: 18px;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .sidebar-toggle.mobile-only {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .sidebar-overlay.mobile-only {
            display: block;
          }
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default ChatInterface;
