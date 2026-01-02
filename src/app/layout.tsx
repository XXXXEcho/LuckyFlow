import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuckyFlow - 幸运抽奖系统",
  description: "实时二维码签到与动画抽奖系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cyber-darker text-white antialiased">
        {children}
      </body>
    </html>
  );
}

