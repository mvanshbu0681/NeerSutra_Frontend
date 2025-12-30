'use client';

/**
 * ============================================
 * Global Error Boundary
 * Root-level catch-all for unhandled errors
 * ============================================
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('🚨 Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050505] text-white min-h-screen flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full">
          {/* Background glow */}
          <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
          
          {/* Glass panel */}
          <div className="relative bg-[#0a0a12]/90 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
            {/* Error icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-red-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-center mb-2">
              <span className="text-red-400">System</span> Malfunction
            </h1>
            
            {/* Subtitle */}
            <p className="text-center text-white/60 mb-6">
              A critical error has occurred. Our systems have logged this incident.
            </p>
            
            {/* Error details (dev only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/5 overflow-auto max-h-32">
                <p className="font-mono text-xs text-red-400 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="font-mono text-xs text-white/40 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-colors text-sm font-medium"
              >
                Return Home
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl text-white font-medium transition-all text-sm shadow-lg shadow-red-500/25"
              >
                Reboot System
              </button>
            </div>
            
            {/* Status indicator */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
                Error State Active
              </span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
