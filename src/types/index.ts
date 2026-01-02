// User type for check-in participants
export interface User {
  id: string;
  name: string;
  phone?: string;
  department?: string;
  avatar?: string; // Random color or initial
  joinedAt: number; // Timestamp
}

// Lottery state for Zustand store
export interface LotteryState {
  participants: User[];
  winners: User[];
  isRolling: boolean;
  currentDisplay: string; // The name currently showing on the roller
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CheckinRequest {
  name: string;
  phone?: string;
  department?: string;
}

export interface CheckinResponse {
  user: User;
  message: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface WinnersResponse {
  winners: User[];
}

export interface AddWinnerRequest {
  oderId: string;
}

