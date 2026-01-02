# Project Name: LuckyFlow
# Description: A real-time QR code check-in and animated lottery system.

## 1. Project Goal
Build a web application where users scan a QR code to check in via their mobile phones. An administrator screen displays the joined users and performs a high-energy, animated lottery draw to select winners.

## 2. Tech Stack & Requirements
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Focus on Dark Mode, Neon/Cyberpunk aesthetic)
- **UI Components:** Shadcn/UI (Button, Card, Input, Dialog)
- **Animations:** - `framer-motion` (Critical for UI transitions and the lottery rolling effect)
  - `canvas-confetti` (For the winning moment)
- **Icons:** Lucide React
- **QR Code:** `qrcode.react`
- **State Management:** Zustand (for managing the global list of users)
- **Data Storage (MVP):** Use Next.js API Routes (`/api/checkin`) with a global in-memory array or a local JSON file to store users. (No external DB needed for this prototype).

## 3. Page Structure
### A. Mobile Check-in Page (`/checkin`)
- **Target Device:** Mobile.
- **UI:** Clean, simple, welcoming.
- **Functionality:**
  - Input field for "Name" (and optional "Department").
  - "Join Event" button.
  - Validation: Name cannot be empty.
  - Success State: Full-screen success animation saying "You are in! Watch the big screen."

### B. Admin/Display Page (`/admin`)
- **Target Device:** Desktop / Projector Screen.
- **UI:** Split screen or Grid.
- **Functionality:**
  - **Left/Top:** Large QR Code generating the URL for `window.location.origin/checkin`.
  - **Right/Bottom:** Real-time list of users who joined (Auto-refresh every 2-3 seconds or use polling).
  - **Counter:** Show total participant count.
  - **Action:** A big "Go to Lottery" button.

### C. Lottery Page (`/lottery`)
- **Target Device:** Large Projector Screen.
- **Style:** "Cyberpunk" / "High Energy". Dark background, neon borders.
- **Core Feature (The "Cool" Factor):**
  - **The Roller:** A central slot-machine style text roller.
  - **Animation:** When "Start" is clicked, names cycle rapidly.
  - **Stop:** When "Stop" is clicked (or after 3 seconds), it decelerates and snaps to a winner.
  - **The Reveal:**
    - The winner's name scales up (Zoom effect).
    - Background dims.
    - Massive confetti explosion (`canvas-confetti`).
    - Sound effect trigger (optional placeholder).
  - **History:** Sidebar showing "Winners List" so duplicate winners are avoided.

## 4. Data Structure (TypeScript Interface)
```typescript
interface User {
  id: string;       // UUID
  name: string;
  avatar?: string;  // Optional: Random color or initial
  joinedAt: number; // Timestamp
}

interface LotteryState {
  participants: User[];
  winners: User[];
  isRolling: boolean;
  currentDisplay: string; // The name currently showing on the roller
}