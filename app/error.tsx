'use client';

/**
 * ============================================
 * Segment Error Boundary
 * Catches errors within route segments
 * ============================================
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to reporting service
    console.error('🔴 Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="relative max-w-md w-full">
        {/* Background glow */}
        <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full" />
        
        {/* Glass panel */}
        <div className="relative glass-panel rounded-2xl p-6 border border-amber-500/20">
          {/* Error icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <svg 
                className="w-7 h-7 text-amber-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold text-center mb-2 text-white">
            Something went wrong
          </h2>
          
          {/* Subtitle */}
          <p className="text-center text-white/50 text-sm mb-5">
            This section encountered an error. You can try again or navigate elsewhere.
          </p>
          
          {/* Error details (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-5 p-3 bg-black/30 rounded-lg border border-white/5 overflow-auto max-h-24">
              <p className="font-mono text-[11px] text-amber-400/80 break-all">
                {error.message}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 transition-colors text-sm"
            >
              Go Back
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl text-white font-medium transition-all text-sm shadow-lg shadow-amber-500/20"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
