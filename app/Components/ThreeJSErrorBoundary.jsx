import React from "react";

class ThreeJSErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ThreeJS Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="three-error-fallback">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h3>3D Model Loading Error</h3>
            <p>Unable to load the 3D floater model. This might be due to:</p>
            <ul>
              <li>WebGL not being supported by your browser</li>
              <li>Graphics driver issues</li>
              <li>Model file not found</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              Reload Page
            </button>
          </div>

          <style jsx>{`
            .three-error-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
              width: 100%;
              background: linear-gradient(
                135deg,
                rgba(0, 100, 200, 0.1),
                rgba(0, 150, 255, 0.1)
              );
              border-radius: 12px;
              padding: 20px;
              text-align: center;
            }

            .error-content {
              color: white;
              max-width: 300px;
            }

            .error-icon {
              font-size: 2rem;
              margin-bottom: 1rem;
            }

            .error-content h3 {
              margin: 0 0 1rem 0;
              font-size: 1.2rem;
              color: #ff6b6b;
            }

            .error-content p {
              margin: 0 0 0.5rem 0;
              font-size: 0.9rem;
              color: rgba(255, 255, 255, 0.8);
            }

            .error-content ul {
              text-align: left;
              margin: 1rem 0;
              padding-left: 1.5rem;
            }

            .error-content li {
              font-size: 0.8rem;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 0.3rem;
            }

            .retry-btn {
              background: linear-gradient(135deg, #00d4ff, #0ea5e9);
              color: white;
              border: none;
              padding: 0.7rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              margin-top: 1rem;
              transition: all 0.3s ease;
            }

            .retry-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThreeJSErrorBoundary;
