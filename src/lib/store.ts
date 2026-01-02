import { User } from "@/types";

// In-memory storage for MVP
// This will reset when the server restarts

interface DataStore {
  users: User[];
  winners: User[];
}

// Global store (persists across API calls but not server restarts)
const globalStore: DataStore = {
  users: [],
  winners: [],
};

// User operations
export function getAllUsers(): User[] {
  return [...globalStore.users];
}

export function addUser(user: User): User {
  globalStore.users.push(user);
  return user;
}

export function getUserById(id: string): User | undefined {
  return globalStore.users.find((u) => u.id === id);
}

export function getUserByName(name: string): User | undefined {
  return globalStore.users.find((u) => u.name.toLowerCase() === name.toLowerCase());
}

export function getUserByPhone(phone: string): User | undefined {
  return globalStore.users.find((u) => u.phone === phone);
}

export function getUserCount(): number {
  return globalStore.users.length;
}

// Winner operations
export function getAllWinners(): User[] {
  return [...globalStore.winners];
}

export function addWinner(userId: string): User | null {
  const user = getUserById(userId);
  if (!user) return null;
  
  // Check if already a winner
  const isAlreadyWinner = globalStore.winners.some((w) => w.id === userId);
  if (isAlreadyWinner) return null;
  
  globalStore.winners.push(user);
  return user;
}

export function isWinner(userId: string): boolean {
  return globalStore.winners.some((w) => w.id === userId);
}

export function getEligibleParticipants(): User[] {
  const winnerIds = new Set(globalStore.winners.map((w) => w.id));
  return globalStore.users.filter((u) => !winnerIds.has(u.id));
}

// Reset functions (useful for testing/admin)
export function resetUsers(): void {
  globalStore.users = [];
}

export function resetWinners(): void {
  globalStore.winners = [];
}

export function resetAll(): void {
  globalStore.users = [];
  globalStore.winners = [];
}

