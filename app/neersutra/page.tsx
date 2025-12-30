/**
 * ============================================
 * NeerSutra - Main Map Landing Page
 * Fleet Command / Vessel Tracking Interface
 * ============================================
 */

'use client';

import { motion } from 'framer-motion';
import { NeerSutraLayout } from './NeerSutraLayoutV2';

export default function NeerSutraPage() {
  return (
    <motion.div
      className="w-full h-screen"
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <NeerSutraLayout />
    </motion.div>
  );
}
