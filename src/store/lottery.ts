import { create } from "zustand";
import { User } from "@/types";

interface LotteryStore {
  // State
  participants: User[];
  winners: User[];
  isRolling: boolean;
  currentDisplay: string;
  selectedWinner: User | null;
  isRevealing: boolean;

  // Actions
  setParticipants: (participants: User[]) => void;
  setWinners: (winners: User[]) => void;
  addWinner: (winner: User) => void;
  startRolling: () => void;
  stopRolling: () => void;
  setCurrentDisplay: (name: string) => void;
  setSelectedWinner: (winner: User | null) => void;
  setIsRevealing: (isRevealing: boolean) => void;
  reset: () => void;

  // Computed helpers
  getEligibleParticipants: () => User[];
}

export const useLotteryStore = create<LotteryStore>((set, get) => ({
  // Initial state
  participants: [],
  winners: [],
  isRolling: false,
  currentDisplay: "?",
  selectedWinner: null,
  isRevealing: false,

  // Actions
  setParticipants: (participants) => set({ participants }),

  setWinners: (winners) => set({ winners }),

  addWinner: (winner) =>
    set((state) => ({
      winners: [...state.winners, winner],
      selectedWinner: winner,
    })),

  startRolling: () =>
    set({
      isRolling: true,
      selectedWinner: null,
      isRevealing: false,
    }),

  stopRolling: () => set({ isRolling: false }),

  setCurrentDisplay: (name) => set({ currentDisplay: name }),

  setSelectedWinner: (winner) => set({ selectedWinner: winner }),

  setIsRevealing: (isRevealing) => set({ isRevealing }),

  reset: () =>
    set({
      isRolling: false,
      currentDisplay: "?",
      selectedWinner: null,
      isRevealing: false,
    }),

  // Computed helpers
  getEligibleParticipants: () => {
    const { participants, winners } = get();
    const winnerIds = new Set(winners.map((w) => w.id));
    return participants.filter((p) => !winnerIds.has(p.id));
  },
}));

