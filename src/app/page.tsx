import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen cyber-grid flex flex-col items-center justify-center p-8">
      <div className="scanline" />
      
      <div className="text-center space-y-8">
        <h1 className="font-cyber text-6xl md:text-8xl font-bold neon-text-cyan">
          LUCKYFLOW
        </h1>
        <p className="font-display text-xl md:text-2xl text-gray-400">
          实时签到 · 幸运抽奖
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 mt-12">
          <Link href="/checkin" className="cyber-button text-center">
            签到入口
          </Link>
          <Link href="/admin" className="cyber-button cyber-button-pink text-center">
            管理后台
          </Link>
          <Link href="/lottery" className="cyber-button text-center">
            抽奖大屏
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-gray-600 text-sm">
        Powered by Next.js & Zustand
      </footer>
    </main>
  );
}

