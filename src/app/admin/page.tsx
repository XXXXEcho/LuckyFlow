"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Users, RefreshCw, Trophy, Clock, Building2, Globe, Settings, X } from "lucide-react";
import Link from "next/link";
import { User } from "@/types";

// Helper to format time consistently (avoid hydration mismatch)
function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatTimeShort(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateStr, setLastUpdateStr] = useState("");
  const [origin, setOrigin] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setTotal(data.data.total);
        setLastUpdateStr(formatTime(new Date()));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    setOrigin(window.location.origin);
    // Load saved public URL from localStorage
    const savedUrl = localStorage.getItem("luckyflow_public_url");
    if (savedUrl) {
      setPublicUrl(savedUrl);
      setTempUrl(savedUrl);
    }
    fetchUsers();

    // Auto refresh every 3 seconds
    const interval = setInterval(fetchUsers, 3000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Use public URL if set, otherwise use origin
  const baseUrl = publicUrl || origin;
  const checkinUrl = `${baseUrl}/checkin`;

  const handleSaveUrl = () => {
    const cleanUrl = tempUrl.trim().replace(/\/$/, ""); // Remove trailing slash
    setPublicUrl(cleanUrl);
    if (cleanUrl) {
      localStorage.setItem("luckyflow_public_url", cleanUrl);
    } else {
      localStorage.removeItem("luckyflow_public_url");
    }
    setShowSettings(false);
  };

  const handleResetUrl = () => {
    setTempUrl("");
    setPublicUrl("");
    localStorage.removeItem("luckyflow_public_url");
    setShowSettings(false);
  };

  return (
    <main className="min-h-screen cyber-grid p-6">
      <div className="scanline" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-cyber text-4xl font-bold neon-text-cyan">
              管理后台
            </h1>
            <p className="text-gray-400 mt-1">实时签到管理与抽奖控制</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setTempUrl(publicUrl);
                setShowSettings(true);
              }}
              className="cyber-button px-4 py-2 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
            <button
              onClick={fetchUsers}
              className="cyber-button px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新
            </button>
            <Link
              href="/lottery"
              className="cyber-button cyber-button-pink px-4 py-2 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              进入抽奖
            </Link>
          </div>
        </header>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="cyber-card p-6 neon-border sticky top-6">
              <h2 className="font-cyber text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                扫码签到
              </h2>

              <div className="bg-white p-4 rounded-lg">
                {origin && (
                  <QRCodeSVG
                    value={checkinUrl}
                    size={250}
                    level="H"
                    className="w-full h-auto"
                    imageSettings={{
                      src: "",
                      height: 0,
                      width: 0,
                      excavate: false,
                    }}
                  />
                )}
              </div>

              <p className="text-center text-gray-400 mt-4 text-sm break-all">
                {checkinUrl}
              </p>

              {/* URL type indicator */}
              {publicUrl && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neon-green">
                  <Globe className="w-3 h-3" />
                  <span>使用公网 URL</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-cyber-dark/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">已签到人数</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.5, color: "#00f0ff" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    className="font-cyber text-3xl font-bold"
                  >
                    {total}
                  </motion.span>
                </div>
              </div>
            </div>
          </div>

          {/* Users List Section */}
          <div className="lg:col-span-2">
            <div className="cyber-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-cyber text-xl font-bold text-neon-pink flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  签到列表
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {lastUpdateStr || "--:--:--"}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full"
                  />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>暂无签到用户</p>
                  <p className="text-sm mt-2">扫描二维码开始签到</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2">
                  <AnimatePresence mode="popLayout">
                    {users.map((user, index) => (
                      <UserCard key={user.id} user={user} index={index} isMounted={isMounted} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="cyber-card p-6 w-full max-w-md neon-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-cyber text-xl font-bold text-neon-cyan flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  公网 URL 设置
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    公网/隧道 URL（用于 4G 用户扫码）
                  </label>
                  <input
                    type="url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://your-tunnel.loca.lt"
                    className="cyber-input"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    留空则使用本地地址: {origin}
                  </p>
                </div>

                <div className="p-3 bg-cyber-dark/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">当前二维码指向:</p>
                  <p className="text-sm text-neon-cyan break-all">
                    {(tempUrl || origin) + "/checkin"}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleResetUrl}
                    className="flex-1 py-3 border border-gray-600 text-gray-400 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    重置为本地
                  </button>
                  <button
                    onClick={handleSaveUrl}
                    className="flex-1 cyber-button py-3"
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function UserCard({ user, index, isMounted }: { user: User; index: number; isMounted: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 bg-cyber-dark/50 rounded-lg border border-cyber-border hover:border-neon-cyan/30 transition-colors"
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-cyber font-bold text-sm"
        style={{ backgroundColor: user.avatar || "#00f0ff" }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-white truncate">
          {user.name}
        </p>
        {user.department && (
          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
            <Building2 className="w-3 h-3" />
            {user.department}
          </p>
        )}
      </div>

      {/* Time */}
      <div className="text-xs text-gray-600">
        {isMounted ? formatTimeShort(new Date(user.joinedAt)) : "--:--"}
      </div>
    </motion.div>
  );
}

