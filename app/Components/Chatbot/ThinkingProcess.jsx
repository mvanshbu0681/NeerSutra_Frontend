"use client";

import React, { useState, useEffect } from 'react';

const ThinkingProcess = ({ isVisible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { 
      id: 'nlp', 
      label: 'Analyzing Query', 
      description: 'Processing your request...'
    },
    { 
      id: 'sql', 
      label: 'Building Query', 
      description: 'Generating database query...'
    },
    { 
      id: 'execute', 
      label: 'Executing Query', 
      description: 'Searching ARGO database...'
    },
    { 
      id: 'results', 
      label: 'Formatting Results', 
      description: 'Preparing your data...'
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    const stepDuration = 1000; // 1 second per step
    const totalSteps = steps.length;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        if (nextStep <= totalSteps) {
          setCompletedSteps(prevCompleted => [...prevCompleted, prev]);
          if (nextStep === totalSteps) {
            setTimeout(() => {
              onComplete && onComplete();
            }, 500);
          }
          return nextStep;
        }
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, onComplete, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="thinking-process">
      <div className="thinking-container">
        <div className="thinking-header">
          <div className="thinking-avatar">
            <img src="/mainlogo.svg" alt="ARGO AI" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="thinking-title">ARGO AI is processing...</div>
        </div>
        
        <div className="thinking-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`thinking-step ${
                completedSteps.includes(index) ? 'completed' : 
                currentStep === index ? 'active' : 'pending'
              }`}
            >
              <div className="step-icon">
                <div className={`step-indicator ${
                  completedSteps.includes(index) ? 'completed' : 
                  currentStep === index ? 'active' : 'pending'
                }`}>
                  {completedSteps.includes(index) && <span className="check-mark">✓</span>}
                </div>
              </div>
              <div className="step-content">
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.description}</div>
              </div>
              {currentStep === index && (
                <div className="step-loader">
                  <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .thinking-process {
          margin: 8px 0;
          padding: 16px;
          background: rgba(0, 20, 40, 0.95);
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .thinking-container {
          max-width: 100%;
        }

        .thinking-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          gap: 8px;
        }

        .thinking-avatar {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 255, 0.3);
        }

        .avatar-pulse {
          font-size: 14px;
        }

        .thinking-title {
          color: #00d4ff;
          font-weight: 500;
          font-size: 14px;
        }

        .thinking-steps {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .thinking-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
        }

        .thinking-step.pending {
          background: rgba(255, 255, 255, 0.05);
          opacity: 0.6;
        }

        .thinking-step.active {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          transform: translateX(5px);
        }

        .thinking-step.completed {
          background: rgba(0, 255, 127, 0.1);
          border: 1px solid rgba(0, 255, 127, 0.3);
        }

        .step-icon {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
        }

        .step-label {
          color: white;
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .step-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
        }

        .step-loader {
          margin-left: auto;
        }

        .loader-dots {
          display: flex;
          gap: 4px;
        }

        .loader-dots span {
          width: 6px;
          height: 6px;
          background: #00d4ff;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loader-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .thinking-process {
            padding: 15px;
            margin: 8px 0;
          }

          .thinking-steps {
            gap: 12px;
          }

          .thinking-step {
            padding: 10px;
          }

          .step-label {
            font-size: 13px;
          }

          .step-description {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default ThinkingProcess;
