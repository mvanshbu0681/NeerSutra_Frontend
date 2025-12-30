import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error("ChatInterface Error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "var(--gradient-background)",
            color: "var(--white-text)",
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              backdropFilter: "blur(20px)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1rem",
                color: "#EF4444",
              }}
            >
              🌊 Oops! Something went wrong
            </h2>
            <p
              style={{
                marginBottom: "1.5rem",
                opacity: 0.8,
                lineHeight: "1.6",
              }}
            >
              The chatbot interface encountered an unexpected error. This is
              usually temporary.
            </p>
            <button
              onClick={() => {
                this.setState({
                  hasError: false,
                  error: null,
                  errorInfo: null,
                });
                window.location.reload();
              }}
              style={{
                background: "var(--gradient-primary)",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(76, 107, 207, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              🔄 Reload Chatbot
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: "1rem", textAlign: "left" }}>
                <summary style={{ cursor: "pointer", color: "#EF4444" }}>
                  Debug Info (Development Mode)
                </summary>
                <pre
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginTop: "0.5rem",
                    fontSize: "0.75rem",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
