/**
 * ============================================
 * 404 Not Found Page
 * ============================================
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full text-center">
        {/* Background glow */}
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
        
        {/* Glass panel */}
        <div className="relative bg-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* 404 display */}
          <div className="mb-6">
            <span className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              404
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-semibold text-white mb-2">
            Signal Lost
          </h1>
          
          {/* Description */}
          <p className="text-white/50 mb-8">
            The coordinates you're looking for don't exist in our navigation system.
          </p>
          
          {/* Navigation options */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl text-white font-medium transition-all shadow-lg shadow-cyan-500/25"
            >
              Return to Base
            </Link>
            <Link
              href="/neersutra"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 transition-colors"
            >
              Open NeerSutra
            </Link>
          </div>
          
          {/* Status indicator */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
              Route Not Found
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
