"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Play, Square, RotateCcw, Users, Crown, Sparkles, Plus, Volume2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useLotteryStore } from "@/store";
import { User } from "@/types";

// Dynamic import for roller component (no SSR)
const LotteryRoller = dynamic(() => import("@/components/LotteryRoller"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/50">加载中...</div>
    </div>
  ),
});

// Sound effect placeholder
const playWinSound = () => {
  // TODO: Add actual sound file
  // const audio = new Audio('/sounds/win.mp3');
  // audio.play();
  console.log("🔊 Winner sound effect triggered!");
};

export default function LotteryPage() {
  const {
    participants,
    winners,
    isRolling,
    selectedWinner,
    isRevealing,
    setParticipants,
    setWinners,
    startRolling,
    stopRolling,
    setSelectedWinner,
    setIsRevealing,
    addWinner,
    reset,
    getEligibleParticipants,
  } = useLotteryStore();

  const [isStopping, setIsStopping] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const spinStartTimeRef = useRef<number>(0);

  // Fetch participants and winners
  const fetchData = useCallback(async () => {
    try {
      const [participantsRes, winnersRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/lottery/winners"),
      ]);

      const participantsData = await participantsRes.json();
      const winnersData = await winnersRes.json();

      if (participantsData.success) {
        setParticipants(participantsData.data.users);
      }
      if (winnersData.success) {
        setWinners(winnersData.data.winners);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setParticipants, setWinners]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Start spinning
  const handleStart = useCallback(() => {
    const eligible = getEligibleParticipants();
    if (eligible.length === 0) return;

    startRolling();
    setIsStopping(false);
    setPendingWinner(null);
    setShowWinnerModal(false);
    spinStartTimeRef.current = Date.now();
  }, [getEligibleParticipants, startRolling]);

  // Stop spinning and select winner
  const handleStop = useCallback(() => {
    if (!isRolling || isStopping) return;

    const eligible = getEligibleParticipants();
    if (eligible.length === 0) return;

    const elapsed = Date.now() - spinStartTimeRef.current;
    const minSpinTime = 2000;
    
    const doStop = () => {
      const winnerIndex = Math.floor(Math.random() * eligible.length);
      const winner = eligible[winnerIndex];
      
      setPendingWinner(winner);
      setIsStopping(true);
    };

    if (elapsed < minSpinTime) {
      setTimeout(doStop, minSpinTime - elapsed);
    } else {
      doStop();
    }
  }, [isRolling, isStopping, getEligibleParticipants]);

  // Called when roller animation completes
  const handleSpinComplete = useCallback(async () => {
    if (!pendingWinner) return;

    stopRolling();
    setIsStopping(false);
    setSelectedWinner(pendingWinner);
    setIsRevealing(true);
    setShowWinnerModal(true);
    
    // Play sound and confetti
    playWinSound();
    triggerConfetti();

    // Save winner to server
    try {
      const res = await fetch("/api/lottery/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingWinner.id }),
      });

      const data = await res.json();
      if (data.success) {
        addWinner(pendingWinner);
      }
    } catch (error) {
      console.error("Failed to save winner:", error);
    }
  }, [pendingWinner, stopRolling, setSelectedWinner, setIsRevealing, addWinner]);

  // Confetti effect
  const triggerConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;
    const colors = ["#6366f1", "#8b5cf6", "#d946ef", "#f59e0b", "#10b981"];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: colors,
    });
  };

  // Reset for next draw
  const handleReset = useCallback(() => {
    reset();
    setIsStopping(false);
    setPendingWinner(null);
    setShowWinnerModal(false);
    fetchData();
  }, [reset, fetchData]);

  // Add test users
  const handleSeedTestData = async () => {
    try {
      const res = await fetch("/api/test/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Reset all states before fetching new data
        reset();
        setIsStopping(false);
        setPendingWinner(null);
        setShowWinnerModal(false);
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to seed test data:", error);
    }
  };

  const eligible = getEligibleParticipants();
  // Fixed: removed isRevealing from canStart condition when there's no winner modal
  const canStart = eligible.length > 0 && !isRolling && !isStopping && !showWinnerModal;
  const canStop = isRolling && !isStopping;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 80% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 40% 80%, rgba(217, 70, 239, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 70% 20%, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #0f0a1e 0%, #1a1035 50%, #0d0618 100%)
          `,
        }}
      />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: ["-20%", "10%", "-20%"],
            y: ["-10%", "20%", "-10%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(217, 70, 239, 0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: ["20%", "-10%", "20%"],
            y: ["10%", "-20%", "10%"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-black text-2xl text-white tracking-wide">
            LUCKYFLOW
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-5 h-5" />
            <span className="font-bold text-xl">{eligible.length}</span>
            <span className="text-sm">待抽奖</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Crown className="w-5 h-5" />
            <span className="font-bold text-xl">{winners.length}</span>
            <span className="text-sm text-white/70">已中奖</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4" style={{ minHeight: "calc(100vh - 180px)" }}>
        {/* Glass morphism container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          <div 
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
            }}
          >
            {/* Top decorative bar */}
            <div className="h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500" />
            
            {/* Roller area */}
            <div className="h-[500px] relative">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : eligible.length > 0 ? (
                <LotteryRoller
                  users={eligible}
                  isSpinning={isRolling}
                  isStopping={isStopping}
                  winner={pendingWinner}
                  onSpinComplete={handleSpinComplete}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="w-12 h-12 text-white/30" />
                    </div>
                    <p className="text-white/50 text-xl mb-2">
                      {participants.length === 0 ? "等待参与者签到..." : "所有参与者已中奖！"}
                    </p>
                    {participants.length === 0 && (
                      <motion.button
                        onClick={handleSeedTestData}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white text-sm flex items-center gap-2 mx-auto transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        添加测试用户
                      </motion.button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom decorative bar */}
            <div className="h-2 bg-gradient-to-r from-amber-500 via-fuchsia-500 to-violet-500" />
          </div>

          {/* Control buttons */}
          <div className="flex justify-center gap-6 mt-8">
            <motion.button
              onClick={handleStart}
              disabled={!canStart}
              whileHover={{ scale: canStart ? 1.05 : 1 }}
              whileTap={{ scale: canStart ? 0.95 : 1 }}
              className={`
                px-16 py-5 rounded-2xl font-bold text-xl
                flex items-center gap-3 transition-all duration-300
                ${canStart 
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50" 
                  : "bg-white/10 text-white/30 cursor-not-allowed"
                }
              `}
            >
              <Play className="w-7 h-7" />
              开始抽奖
            </motion.button>

            <motion.button
              onClick={handleStop}
              disabled={!canStop}
              whileHover={{ scale: canStop ? 1.05 : 1 }}
              whileTap={{ scale: canStop ? 0.95 : 1 }}
              className={`
                px-16 py-5 rounded-2xl font-bold text-xl
                flex items-center gap-3 transition-all duration-300
                ${canStop 
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50" 
                  : "bg-white/10 text-white/30 cursor-not-allowed"
                }
              `}
            >
              <Square className="w-7 h-7" />
              停止
            </motion.button>
          </div>

          {/* Status text */}
          <AnimatePresence>
            {(isRolling || isStopping) && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-white/50 mt-4"
              >
                {isStopping ? "🎯 正在锁定幸运儿..." : "👆 点击「停止」选出幸运儿"}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Winner Modal */}
      <AnimatePresence>
        {showWinnerModal && selectedWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2) 0%, rgba(15, 10, 30, 0.98) 70%)",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-2xl w-full"
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-50"
                style={{
                  background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              
              {/* Modal content */}
              <div 
                className="relative rounded-3xl p-12 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                  backdropFilter: "blur(30px)",
                  border: "2px solid rgba(251, 191, 36, 0.3)",
                  boxShadow: "0 0 60px rgba(251, 191, 36, 0.2)",
                }}
              >
                {/* Trophy */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50"
                >
                  <Trophy className="w-16 h-16 text-white" />
                </motion.div>

                {/* Congratulations */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl text-amber-400 font-medium mb-4 tracking-widest"
                >
                  🎉 恭喜中奖 🎉
                </motion.p>

                {/* Winner name - HUGE */}
                <motion.h1
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent"
                  style={{
                    textShadow: "0 0 60px rgba(251, 191, 36, 0.5)",
                  }}
                >
                  {selectedWinner.name}
                </motion.h1>

                {/* Phone number */}
                {selectedWinner.phone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl text-white/70 font-mono mb-8"
                  >
                    尾号 <span className="text-amber-400 font-bold">{selectedWinner.phone.slice(-4)}</span>
                  </motion.p>
                )}

                {/* Avatar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-4 mb-10"
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-amber-400/50"
                    style={{ backgroundColor: selectedWinner.avatar || "#8b5cf6" }}
                  >
                    {selectedWinner.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-white/50 text-sm">ID</p>
                    <p className="text-white font-mono">{selectedWinner.id.slice(0, 8)}...</p>
                  </div>
                </motion.div>

                {/* Continue button */}
                <motion.button
                  onClick={handleReset}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center gap-3 mx-auto"
                >
                  <RotateCcw className="w-6 h-6" />
                  继续抽奖
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners sidebar */}
      <AnimatePresence>
        {winners.length > 0 && !showWinnerModal && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-80 p-6 overflow-y-auto z-20"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h2 className="font-bold text-xl text-amber-400 flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6" />
              中奖名单
            </h2>

            <div className="space-y-3">
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white text-lg">
                    {index + 1}
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
                    style={{ backgroundColor: winner.avatar || "#8b5cf6" }}
                  >
                    {winner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-white block truncate text-lg">
                      {winner.name}
                    </span>
                    {winner.phone && (
                      <span className="text-sm text-white/50">
                        尾号 {winner.phone.slice(-4)}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants sidebar (left) - Auto scrolling */}
      {!showWinnerModal && eligible.length > 0 && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-0 top-0 bottom-0 w-72 p-6 z-20 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 className="font-bold text-xl text-violet-400 flex items-center gap-3 mb-6">
            <Users className="w-6 h-6" />
            参与者 ({eligible.length})
          </h2>

          {/* Auto-scrolling container */}
          <div className="relative h-[calc(100%-80px)] overflow-hidden">
            {/* Top fade */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0f0a1e] to-transparent z-10 pointer-events-none" />
            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0f0a1e] to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling content - duplicate for seamless loop */}
            <motion.div
              animate={{
                y: [0, -(eligible.length * 52)],
              }}
              transition={{
                y: {
                  duration: eligible.length * 2,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="space-y-2"
            >
              {/* First set */}
              {eligible.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: user.avatar || "#8b5cf6" }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white/80 block truncate">
                      {user.name}
                    </span>
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {eligible.map((user) => (
                <div
                  key={`dup-${user.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                    style={{ backgroundColor: user.avatar || "#8b5cf6" }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white/80 block truncate">
                      {user.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
