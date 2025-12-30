/**
 * ============================================
 * Coastal Health Engine - Dedicated Route
 * /neersutra/che
 * Scientific 4D Analysis Dashboard
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import CHELayout from './CHELayout';

export default function CHEPage() {
  return (
    <motion.div
      className="w-full h-screen"
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <CHELayout />
    </motion.div>
  );
}
