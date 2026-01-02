"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Sparkles, User, Phone } from "lucide-react";

type CheckinState = "form" | "loading" | "success" | "error";

export default function CheckinPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<CheckinState>("form");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("请输入您的姓名");
      setState("error");
      setTimeout(() => setState("form"), 2000);
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("请输入您的手机号");
      setState("error");
      setTimeout(() => setState("form"), 2000);
      return;
    }

    // Simple phone validation
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      setErrorMessage("请输入有效的手机号");
      setState("error");
      setTimeout(() => setState("form"), 2000);
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setState("success");
      } else {
        setErrorMessage(data.error || "签到失败");
        setState("error");
        setTimeout(() => setState("form"), 3000);
      }
    } catch {
      setErrorMessage("网络错误，请重试");
      setState("error");
      setTimeout(() => setState("form"), 3000);
    }
  };

  return (
    <main className="deep-space-bg flex items-center justify-center p-4 min-h-screen">
      {/* Starfield background */}
      <div className="starfield pointer-events-none" />
      <div className="starfield pointer-events-none" style={{ animationDelay: "-4s", opacity: 0.5 }} />

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <SuccessScreen key="success" />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
            <div className="glass-card p-8 sm:p-10">
              {/* Header */}
              <div className="text-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                  className="relative inline-block"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[var(--nebula-blue)] to-[var(--nebula-pink)] flex items-center justify-center">
                    <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-full pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, var(--nebula-blue), var(--nebula-pink))",
                      opacity: 0.3,
                      filter: "blur(10px)",
                      zIndex: -1,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold text-white mt-4 sm:mt-6 tracking-wide"
                >
                  加入宇宙
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/50 mt-2 text-sm"
                >
                  填写信息，开启星际之旅
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Name input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="您的姓名"
                    className="space-input pl-12 text-base sm:text-lg"
                    disabled={state === "loading"}
                    autoComplete="off"
                  />
                </motion.div>

                {/* Phone input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative"
                >
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none z-10" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="手机号码"
                    className="space-input pl-12 text-base sm:text-lg"
                    disabled={state === "loading"}
                    autoComplete="off"
                    maxLength={11}
                  />
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {state === "error" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[var(--nebula-pink)] text-center py-3 bg-[var(--nebula-pink)]/10 rounded-xl text-sm overflow-hidden"
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={state === "loading"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full space-button py-4 sm:py-5 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-3">
                    {state === "loading" ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        发送信号中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Join Universe
                      </>
                    )}
                  </span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center relative z-10 px-6"
    >
      {/* Animated rings */}
      <div className="relative inline-block mb-6 sm:mb-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-[var(--nebula-blue)] pointer-events-none"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 2 + i * 0.5],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
            style={{
              width: 100,
              height: 100,
              marginLeft: -50,
              marginTop: -50,
              left: "50%",
              top: "50%",
            }}
          />
        ))}
        
        <motion.div
          animate={{
            boxShadow: [
              "0 0 30px rgba(79, 195, 247, 0.5)",
              "0 0 60px rgba(79, 195, 247, 0.8)",
              "0 0 30px rgba(79, 195, 247, 0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[var(--nebula-blue)] to-[var(--nebula-pink)] flex items-center justify-center relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-2 border-dashed border-white/30"
          />
          <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--nebula-blue)] pulse-text mb-4"
      >
        Signal Sent
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-lg sm:text-xl md:text-2xl text-white/70 mb-6 sm:mb-8"
      >
        Look at the Big Screen
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center gap-2"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-[var(--nebula-blue)]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-white/30 mt-8 sm:mt-12 text-xs sm:text-sm tracking-widest uppercase"
      >
        Awaiting cosmic alignment...
      </motion.p>
    </motion.div>
  );
}
