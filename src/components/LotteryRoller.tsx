"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/types";

interface LotteryRollerProps {
  users: User[];
  isSpinning: boolean;
  isStopping: boolean;
  winner: User | null;
  onSpinComplete: () => void;
}

// Single name item component
function NameItem({ 
  user, 
  position, 
  isWinner,
  showWinner,
}: { 
  user: User; 
  position: "top" | "center" | "bottom";
  isWinner: boolean;
  showWinner: boolean;
}) {
  const isCenter = position === "center";
  const isHighlighted = isCenter && isWinner && showWinner;
  
  return (
    <div
      className={`
        flex items-center justify-center w-full
        transition-all duration-300
        ${isCenter ? "h-[200px]" : "h-[120px]"}
      `}
    >
      <div
        className={`
          px-12 py-6 rounded-3xl
          transition-all duration-500
          ${isHighlighted 
            ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.8)]" 
            : isCenter 
              ? "bg-white/10 backdrop-blur-sm" 
              : "bg-transparent"
          }
        `}
      >
        <span
          className={`
            font-black tracking-wide
            transition-all duration-300
            ${isCenter 
              ? isHighlighted
                ? "text-8xl text-amber-900 drop-shadow-lg"
                : "text-8xl text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]" 
              : "text-4xl text-white/40"
            }
          `}
        >
          {user.name}
        </span>
      </div>
    </div>
  );
}

export default function LotteryRoller({
  users,
  isSpinning,
  isStopping,
  winner,
  onSpinComplete,
}: LotteryRollerProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isAnimatingStop, setIsAnimatingStop] = useState(false);
  
  // Refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear spinning interval only
  const clearSpinInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Clear all stop timeouts
  const clearStopTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  // Get visible items
  const getVisibleItems = useCallback((idx: number): { prev: User | null; curr: User | null; next: User | null } => {
    if (users.length === 0) return { prev: null, curr: null, next: null };
    const len = users.length;
    const safeIdx = ((idx % len) + len) % len;
    const prev = users[(safeIdx - 1 + len) % len] || null;
    const curr = users[safeIdx] || null;
    const next = users[(safeIdx + 1) % len] || null;
    return { prev, curr, next };
  }, [users]);

  // STOPPING: When isStopping becomes true, schedule all frames upfront
  useEffect(() => {
    if (isStopping && winner && !isAnimatingStop) {
      // Mark that we're handling the stop
      setIsAnimatingStop(true);
      clearSpinInterval();
      setIsBlurred(false);
      
      // Find winner index
      const winnerIdx = users.findIndex(u => u.id === winner.id);
      if (winnerIdx === -1) {
        onSpinComplete();
        return;
      }

      // Get current position from ref to avoid stale closure
      const startIdx = displayIndex;
      
      // Calculate steps: 8-15 steps over 2.5 seconds
      const steps = 12;
      const totalDuration = 2500; // 2.5 seconds
      
      // Pre-calculate all timings with easing
      let cumulativeTime = 0;
      const schedule: { time: number; index: number }[] = [];
      
      for (let i = 0; i < steps; i++) {
        const progress = i / steps;
        // Ease-out: slower at the end
        const delay = (totalDuration / steps) * (1 + progress * 2);
        cumulativeTime += delay;
        schedule.push({
          time: cumulativeTime,
          index: (startIdx + i + 1) % users.length
        });
      }
      
      // Schedule all updates at once
      schedule.forEach(({ time, index }) => {
        const t = setTimeout(() => {
          setDisplayIndex(index);
        }, time);
        timeoutsRef.current.push(t);
      });
      
      // Final: snap to winner and complete
      const finalTimeout = setTimeout(() => {
        setDisplayIndex(winnerIdx);
        setTimeout(() => {
          onSpinComplete();
        }, 100);
      }, cumulativeTime + 200);
      timeoutsRef.current.push(finalTimeout);
    }
    
    // Cleanup on unmount only
    return () => {
      if (!isStopping) {
        clearStopTimeouts();
        setIsAnimatingStop(false);
      }
    };
  }, [isStopping, winner]); // Minimal dependencies!

  // SPINNING: Simple interval
  useEffect(() => {
    if (isSpinning && !isStopping && !isAnimatingStop) {
      clearSpinInterval();
      setIsBlurred(true);
      
      intervalRef.current = setInterval(() => {
        setDisplayIndex(prev => (prev + 1) % users.length);
      }, 100);
      
      return () => clearSpinInterval();
    }
  }, [isSpinning, isStopping, isAnimatingStop, users.length, clearSpinInterval]);

  // IDLE: Slow drift when not spinning and no winner
  useEffect(() => {
    if (!isSpinning && !isStopping && !winner && !isAnimatingStop) {
      clearSpinInterval();
      setIsBlurred(false);
      
      intervalRef.current = setInterval(() => {
        setDisplayIndex(prev => (prev + 1) % users.length);
      }, 600);
      
      return () => clearSpinInterval();
    }
  }, [isSpinning, isStopping, winner, isAnimatingStop, users.length, clearSpinInterval]);

  // WINNER SHOWN: Ensure correct display
  useEffect(() => {
    if (winner && !isSpinning && !isStopping && !isAnimatingStop) {
      clearSpinInterval();
      clearStopTimeouts();
      setIsBlurred(false);
      const winnerIdx = users.findIndex(u => u.id === winner.id);
      if (winnerIdx !== -1) {
        setDisplayIndex(winnerIdx);
      }
    }
  }, [winner, isSpinning, isStopping, isAnimatingStop, users, clearSpinInterval, clearStopTimeouts]);

  // Reset isAnimatingStop when starting new spin
  useEffect(() => {
    if (isSpinning && !isStopping) {
      setIsAnimatingStop(false);
      clearStopTimeouts();
    }
  }, [isSpinning, isStopping, clearStopTimeouts]);

  const { prev, curr, next } = getVisibleItems(displayIndex);
  const showWinner = !isSpinning && !isStopping && winner !== null && !isAnimatingStop;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Gradient masks */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
      
      {/* Center highlight bar */}
      <div className="absolute left-0 right-0 h-[200px] top-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* The roller */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          filter: isBlurred ? "blur(2px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        {prev && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`prev-${prev.id}`}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.05 }}
            >
              <NameItem 
                user={prev} 
                position="top" 
                isWinner={winner?.id === prev.id}
                showWinner={showWinner}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {curr && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`curr-${curr.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <NameItem 
                user={curr} 
                position="center" 
                isWinner={winner?.id === curr.id}
                showWinner={showWinner}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {next && (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`next-${next.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.05 }}
            >
              <NameItem 
                user={next} 
                position="bottom" 
                isWinner={winner?.id === next.id}
                showWinner={showWinner}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Side decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-48 rounded-full bg-gradient-to-b from-violet-500/50 via-fuchsia-500/50 to-violet-500/50 blur-sm" />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-48 rounded-full bg-gradient-to-b from-violet-500/50 via-fuchsia-500/50 to-violet-500/50 blur-sm" />
    </div>
  );
}
