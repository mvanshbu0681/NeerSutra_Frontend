'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell,
  Anchor,
  X,
  Command,
  Wifi,
  WifiOff,
  Home,
  Ship,
  Waves,
  Fish,
  ChevronDown,
  Check,
  AlertTriangle,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../ThemeProvider';
import { cn } from '../../types/utils';
import { useRouter, usePathname } from 'next/navigation';
import DataCommandMenu from './DataCommandMenu';

interface TopBarProps {
  className?: string;
  activeMode?: 'fleet' | 'coastal' | 'pfz' | 'ews';
}

// Mission configurations
const MISSIONS = [
  { 
    id: 'fleet', 
    label: 'Fleet Tracking', 
    shortLabel: 'FLEET',
    icon: Ship, 
    path: '/neersutra',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'shadow-cyan-500/30',
    description: 'Real-time vessel monitoring',
  },
  { 
    id: 'coastal', 
    label: 'Coastal Health', 
    shortLabel: 'CHE',
    icon: Waves, 
    path: '/neersutra/che',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
    description: 'Ecosystem monitoring',
  },
  { 
    id: 'pfz', 
    label: 'Fishing Zones', 
    shortLabel: 'PFZ',
    icon: Fish, 
    path: '/neersutra/pfz',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    description: 'HSI forecast system',
  },
  { 
    id: 'ews', 
    label: 'Hazard Watch', 
    shortLabel: 'EWS',
    icon: AlertTriangle, 
    path: '/neersutra/ews',
    color: 'red',
    gradient: 'from-red-500 to-rose-600',
    glow: 'shadow-red-500/30',
    description: 'Multi-hazard early warning',
  },
] as const;

type MissionId = typeof MISSIONS[number]['id'];

/**
 * TopBar - Floating "Dynamic Island" style navigation
 * Aerogel glass material with specular lighting
 */
export function TopBar({ className, activeMode = 'fleet' }: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [isMissionSelectorOpen, setIsMissionSelectorOpen] = useState(false);
  const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
  const missionSelectorRef = useRef<HTMLDivElement>(null);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine active mode from pathname
  const currentMissionId: MissionId = pathname?.includes('/ews')
    ? 'ews'
    : pathname?.includes('/pfz') 
      ? 'pfz' 
      : pathname?.includes('/che') 
        ? 'coastal' 
        : 'fleet';
  
  const currentMission = MISSIONS.find(m => m.id === currentMissionId) || MISSIONS[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (missionSelectorRef.current && !missionSelectorRef.current.contains(event.target as Node)) {
        setIsMissionSelectorOpen(false);
      }
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) {
        setIsDataMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mission selection
  const handleMissionSelect = (mission: typeof MISSIONS[number]) => {
    setIsMissionSelectorOpen(false);
    router.push(mission.path);
  };

  return (
    <motion.div
      className={cn(
        'glass-island flex items-center gap-3 px-3 py-2',
        className
      )}
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        delay: 0.1 
      }}
      layout
    >
      {/* Home Button */}
      <motion.button
        onClick={() => router.push('/')}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Back to Home"
      >
        <Home className="w-4 h-4 text-[#94a3b8]" />
      </motion.button>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Logo */}
      <div className="flex items-center gap-2.5 pr-3 border-r border-white/8">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#22d3ee] to-[#2997ff] flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Anchor className="w-4 h-4 text-white" />
        </div>
        <span className="font-display text-base tracking-tight text-white">
          NeerSutra
        </span>
      </div>

      {/* Mission Selector Dropdown */}
      <div className="relative" ref={missionSelectorRef}>
        <motion.button
          onClick={() => setIsMissionSelectorOpen(!isMissionSelectorOpen)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all',
            'bg-black/40 border border-white/10 hover:border-white/20',
            isMissionSelectorOpen && 'border-white/25 bg-black/60'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active Mission Indicator */}
          <div className={cn(
            'flex items-center justify-center w-7 h-7 rounded-lg',
            `bg-gradient-to-br ${currentMission.gradient}`,
            `shadow-lg ${currentMission.glow}`
          )}>
            <currentMission.icon className="w-3.5 h-3.5 text-white" />
          </div>
          
          {/* Mission Label */}
          <div className="flex flex-col items-start">
            <span className="text-[9px] uppercase tracking-wider text-white/40 leading-none">
              Mission
            </span>
            <span className={cn(
              'text-xs font-semibold tracking-wide leading-tight',
              currentMission.color === 'cyan' && 'text-cyan-400',
              currentMission.color === 'emerald' && 'text-emerald-400',
              currentMission.color === 'amber' && 'text-amber-400',
              currentMission.color === 'red' && 'text-red-400',
            )}>
              {currentMission.shortLabel}
            </span>
          </div>
          
          {/* Chevron */}
          <motion.div
            animate={{ rotate: isMissionSelectorOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMissionSelectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={cn(
                'absolute top-full left-0 mt-2 w-56 z-50',
                'rounded-xl overflow-hidden',
                'bg-[#0a0a12]/95 backdrop-blur-xl',
                'border border-white/10',
                'shadow-2xl shadow-black/50'
              )}
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-white/30">
                  Select Mission
                </span>
              </div>
              
              {/* Mission Options */}
              <div className="p-1.5">
                {MISSIONS.map((mission) => {
                  const isActive = mission.id === currentMissionId;
                  const Icon = mission.icon;
                  
                  return (
                    <motion.button
                      key={mission.id}
                      onClick={() => handleMissionSelect(mission)}
                      className={cn(
                        'w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg',
                        'transition-all duration-150',
                        isActive 
                          ? 'bg-white/10' 
                          : 'hover:bg-white/5'
                      )}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Mission Icon */}
                      <div className={cn(
                        'flex items-center justify-center w-9 h-9 rounded-lg',
                        `bg-gradient-to-br ${mission.gradient}`,
                        isActive && `shadow-md ${mission.glow}`
                      )}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      
                      {/* Mission Info */}
                      <div className="flex-1 text-left">
                        <div className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-white' : 'text-white/70'
                        )}>
                          {mission.label}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {mission.description}
                        </div>
                      </div>
                      
                      {/* Active Check */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            'flex items-center justify-center w-5 h-5 rounded-full',
                            mission.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                            mission.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                            mission.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                            mission.color === 'red' && 'bg-red-500/20 text-red-400',
                          )}
                        >
                          <Check className="w-3 h-3" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Field */}
      <AnimatePresence mode="wait">
        {isSearchOpen ? (
          <motion.div
            initial={{ width: 180, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 180, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
          >
            <Search className="w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vessels, ports..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#64748b] outline-none"
              autoFocus
            />
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
              <X className="w-4 h-4 text-[#64748b] hover:text-white transition-colors" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/8 transition-colors cursor-pointer min-w-[180px] border border-transparent hover:border-white/10"
          >
            <Search className="w-4 h-4 text-[#64748b]" />
            <span className="text-sm text-[#64748b]">Search...</span>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-[#475569] bg-black/20 px-1.5 py-0.5 rounded">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1 min-w-4" />

      {/* Connection Status */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        isOnline ? "bg-emerald-500/10" : "bg-red-500/10"
      )}>
        {isOnline ? (
          <>
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-medium text-emerald-400 tracking-wide">
              LIVE
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">OFFLINE</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Data Command Center Button */}
      <div className="relative" ref={dataMenuRef}>
        <motion.button
          onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all',
            'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20',
            isDataMenuOpen && 'bg-white/10 border-white/20'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Database className="w-4 h-4 text-[#94a3b8]" />
          <span className="text-xs font-medium text-white/70">Data</span>
        </motion.button>

        <DataCommandMenu 
          isOpen={isDataMenuOpen} 
          onClose={() => setIsDataMenuOpen(false)} 
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/10" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        
        <motion.button
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-4 h-4 text-[#94a3b8]" />
          {/* Notification Badge */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-[#0a0a0f]">
            3
          </span>
        </motion.button>

        {/* User Avatar */}
        <motion.button
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/25"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          A
        </motion.button>
      </div>
    </motion.div>
  );
}

export default TopBar;
