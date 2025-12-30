'use client';

import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../types/utils';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'island' | 'capsule';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  delay?: number;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const variantClasses = {
  default: 'glass-panel',
  elevated: 'glass-panel hover:shadow-2xl',
  island: 'glass-island',
  capsule: 'glass-capsule',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      animate = true,
      delay = 0,
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      variantClasses[variant],
      paddingClasses[padding],
      className
    );

    if (!animate) {
      return (
        <div ref={ref} className={baseClasses} {...(props as any)}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.34, 1.56, 0.64, 1], // Spring-like
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Specialized Callout Card - docks to edge
interface CalloutCardProps extends GlassCardProps {
  position?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
}

import { X } from 'lucide-react';

export const CalloutCard = forwardRef<HTMLDivElement, CalloutCardProps>(
  ({ children, position = 'right', onClose, className, ...props }, ref) => {
    const positionClasses = {
      left: 'fixed left-6 top-1/2 -translate-y-1/2',
      right: 'fixed right-6 top-1/2 -translate-y-1/2',
      top: 'fixed top-6 left-1/2 -translate-x-1/2',
      bottom: 'fixed bottom-32 left-1/2 -translate-x-1/2',
    };

    const slideDirection = {
      left: { x: -100, opacity: 0 },
      right: { x: 100, opacity: 0 },
      top: { y: -100, opacity: 0 },
      bottom: { y: 100, opacity: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-card z-50 w-80 max-h-[70vh] overflow-hidden',
          positionClasses[position],
          className
        )}
        initial={slideDirection[position]}
        animate={{ x: 0, y: position === 'top' || position === 'bottom' ? 0 : '-50%', opacity: 1 }}
        exit={slideDirection[position]}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        {...(props as any)}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn-ghost btn-icon-rounded p-1.5 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="p-5 overflow-y-auto max-h-[calc(70vh-2rem)]">
          {children}
        </div>
      </motion.div>
    );
  }
);

CalloutCard.displayName = 'CalloutCard';

export default GlassCard;
