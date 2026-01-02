# LuckyFlow - 幸运抽奖系统

实时二维码签到与动画抽奖系统，基于 Next.js 14 构建。

## ✨ 功能特性

- 📱 **移动端签到** - 扫码即可参与活动
- 🖥️ **管理后台** - 实时查看签到用户，生成二维码
- 🎰 **超级老虎机抽奖** - 2D垂直滚动老虎机，流畅且可读性极高
- 🎨 **现代玻璃态UI** - 紫蓝渐变背景 + 毛玻璃面板
- 🎉 **彩带特效** - 中奖时的炫酷庆祝效果
- 🔊 **音效支持** - 中奖音效占位符（可自定义）

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 🌐 自定义公网地址（IPv4/IPv6）

在局域网或公网环境中使用时，需要配置自定义 IP 地址，以便其他设备扫码访问。

#### 方法一：启动时指定 Host

```bash
# 监听所有网络接口（推荐）
npm run dev -- -H 0.0.0.0

# 或指定具体 IPv4 地址
npm run dev -- -H 192.168.1.100

# 或指定 IPv6 地址
npm run dev -- -H ::
```

#### 方法二：修改 package.json

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0 -p 3000"
  }
}
```

#### 方法三：创建 .env.local 文件

```bash
# .env.local
HOSTNAME=0.0.0.0
PORT=3000
```

#### 配置二维码显示地址

管理后台生成的二维码默认使用 `window.location.origin`。如需自定义二维码中的地址，可以：

1. **使用环境变量**（推荐）

在 `.env.local` 中添加：

```bash
# IPv4 公网地址
NEXT_PUBLIC_BASE_URL=http://你的公网IP:3000

# 或 IPv6 地址（注意方括号）
NEXT_PUBLIC_BASE_URL=http://[2001:db8::1]:3000

# 或使用域名
NEXT_PUBLIC_BASE_URL=https://lottery.example.com
```

2. **查看本机 IP 地址**

```bash
# Windows
ipconfig

# macOS / Linux
ifconfig
# 或
ip addr
```

#### 常见场景配置

| 场景 | 配置 |
|------|------|
| 本地开发 | `localhost:3000` |
| 局域网访问 | `192.168.x.x:3000` |
| IPv6 局域网 | `[fe80::xxx]:3000` |
| 公网 IPv4 | `公网IP:3000`（需端口映射） |
| 公网 IPv6 | `[IPv6地址]:3000` |
| 域名访问 | `https://your-domain.com` |

#### 防火墙设置

确保防火墙允许 3000 端口的入站连接：

```bash
# Windows PowerShell (管理员)
New-NetFirewallRule -DisplayName "LuckyFlow" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow

# Linux (ufw)
sudo ufw allow 3000/tcp

# Linux (firewalld)
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

## 📁 项目结构

```
src/
├── app/
│   ├── api/              # API 路由
│   │   ├── checkin/      # 签到接口
│   │   ├── users/        # 用户列表接口
│   │   └── lottery/      # 抽奖相关接口
│   ├── checkin/          # 移动端签到页面
│   ├── admin/            # 管理后台页面
│   ├── lottery/          # 抽奖大屏页面
│   └── page.tsx          # 首页
├── components/
│   └── LotteryRoller.tsx # 2D老虎机滚动组件
├── lib/
│   ├── store.ts          # 内存数据存储
│   └── utils.ts          # 工具函数
├── store/
│   └── lottery.ts        # Zustand 状态管理
└── types/
    └── index.ts          # TypeScript 类型定义
```

## 🎯 使用流程

1. **管理员** 打开 `/admin` 页面，展示二维码
2. **参与者** 扫描二维码，进入 `/checkin` 页面签到
3. **管理员** 点击"进入抽奖"，跳转到 `/lottery` 页面
4. **抽奖** 点击"开始"滚动，点击"停止"抽取幸运儿

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: Zustand
- **二维码**: qrcode.react
- **彩带效果**: canvas-confetti

## 🎰 超级老虎机特性

全新2D老虎机设计，专注于可读性和流畅度：

### 视觉设计
- **现代渐变背景** - 紫蓝色网格渐变，动态光晕效果
- **玻璃态面板** - 毛玻璃容器，高端质感
- **超大字体** - 中心名字使用 `text-8xl`，后排也能清晰看见
- **三行窗口** - 同时显示上一个、当前、下一个名字

### 动画系统
- **闲置漂移** - 缓慢自动滚动，展示所有参与者
- **高速滚动** - 点击开始后加速至模糊效果
- **物理减速** - 停止时使用 ease-out 物理衰减
- **精准锁定** - 最终 SNAP 到中奖者位置
- **无限循环** - 12倍重复列表实现无缝滚动

### 中奖效果
- **金色高亮** - 中奖者卡片变为金色渐变
- **弹窗展示** - 大型模态框显示中奖者信息
- **彩带庆祝** - 全屏彩带特效
- **音效触发** - 预留音效接口

### 添加自定义音效

在 `public/sounds/` 目录下添加 `win.mp3` 文件，然后取消 `playWinSound` 函数中的注释：

```typescript
const playWinSound = () => {
  const audio = new Audio('/sounds/win.mp3');
  audio.play();
};
```

## 📝 注意事项

- 数据存储在内存中，服务器重启后数据会清空
- 适合小型活动使用，大型活动建议接入数据库

