'use client';

/**
 * ============================================
 * AsyncView - Standardized Async UI Wrapper
 * Handles loading, error, and empty states
 * ============================================
 */

import { ReactNode } from 'react';

interface AsyncViewProps {
  /** Whether data is currently loading */
  isLoading?: boolean;
  
  /** Error object if fetch failed */
  error?: Error | null;
  
  /** Optional data to check for empty state */
  data?: unknown;
  
  /** Content to render on success */
  children: ReactNode;
  
  /** Custom loading skeleton (optional) */
  skeleton?: ReactNode;
  
  /** Custom error component (optional) */
  errorComponent?: ReactNode;
  
  /** Custom empty state component (optional) */
  emptyComponent?: ReactNode;
  
  /** Retry function for error state */
  onRetry?: () => void;
  
  /** Additional class names */
  className?: string;
  
  /** Minimum height for the container */
  minHeight?: string;
}

/**
 * AsyncView - Wraps content with consistent loading/error/empty handling
 * 
 * @example
 * <AsyncView 
 *   isLoading={isLoading} 
 *   error={error}
 *   data={items}
 *   onRetry={refetch}
 * >
 *   <MyContent items={items} />
 * </AsyncView>
 */
export function AsyncView({
  isLoading = false,
  error = null,
  data,
  children,
  skeleton,
  errorComponent,
  emptyComponent,
  onRetry,
  className = '',
  minHeight = '200px',
}: AsyncViewProps) {
  // Loading State
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        <GlassSpinner />
      </div>
    );
  }
  
  // Error State
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        <GlassErrorCard error={error} onRetry={onRetry} />
      </div>
    );
  }
  
  // Empty State (only if data is explicitly checked)
  if (data !== undefined && isEmpty(data)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ minHeight }}
      >
        <GlassEmptyState />
      </div>
    );
  }
  
  // Success State
  return <>{children}</>;
}

/**
 * Check if data is empty
 */
function isEmpty(data: unknown): boolean {
  if (data === null || data === undefined) return true;
  if (Array.isArray(data) && data.length === 0) return true;
  if (typeof data === 'object' && Object.keys(data).length === 0) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────
// Glass UI Components
// ─────────────────────────────────────────────────────────────

/**
 * Glass-styled loading spinner
 */
export function GlassSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-14 h-14 border-3',
  };
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className={`${sizeClasses[size]} border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin`}
      />
      <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
        Loading...
      </span>
    </div>
  );
}

/**
 * Glass-styled error card
 */
export function GlassErrorCard({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry?: () => void;
}) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-red-500/20 max-w-sm">
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg 
            className="w-5 h-5 text-red-400" 
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
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-400 mb-1">
            Error Loading Data
          </h4>
          <p className="text-xs text-white/50 break-words">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Glass-styled empty state
 */
export function GlassEmptyState({ 
  message = 'No data available',
  icon,
}: { 
  message?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center p-6">
      {icon || (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-white/30" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        </div>
      )}
      <p className="text-sm text-white/40">{message}</p>
    </div>
  );
}

/**
 * Skeleton placeholder components
 */
export function SkeletonBox({ 
  className = '' 
}: { 
  className?: string;
}) {
  return (
    <div 
      className={`bg-white/5 rounded-lg animate-pulse ${className}`}
    />
  );
}

export function SkeletonText({ 
  lines = 1,
  className = '',
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-white/5 rounded animate-pulse"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ 
  className = '' 
}: { 
  className?: string;
}) {
  return (
    <div className={`glass-panel rounded-xl p-4 ${className}`}>
      <SkeletonBox className="w-10 h-10 mb-3" />
      <SkeletonText lines={2} />
    </div>
  );
}

export default AsyncView;
