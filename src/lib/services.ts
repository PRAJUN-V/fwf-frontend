import { apiFetch } from "./api";
import type { GameType, Room, User } from "@/types";

export interface UserCreatePayload {
  username: string;
  email: string;
  password: string;
  is_admin: boolean;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  is_admin?: boolean;
  is_active?: boolean;
  password?: string;
}

export const usersApi = {
  list: () => apiFetch<User[]>("/users"),
  create: (payload: UserCreatePayload) =>
    apiFetch<User>("/users", { method: "POST", body: payload }),
  update: (id: number, payload: UserUpdatePayload) =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body: payload }),
};

export interface RoomCreatePayload {
  name: string;
  game_type: GameType;
  max_players: number;
}

export const roomsApi = {
  // Returns only the rooms the current user is a member of (private rooms).
  list: () => apiFetch<Room[]>("/rooms"),
  create: (payload: RoomCreatePayload) =>
    apiFetch<Room>("/rooms", { method: "POST", body: payload }),
  get: (id: number) => apiFetch<Room>(`/rooms/${id}`),
  joinByCode: (code: string) =>
    apiFetch<Room>("/rooms/join", { method: "POST", body: { code } }),
  leave: (id: number) =>
    apiFetch<{ deleted: boolean }>(`/rooms/${id}/leave`, { method: "POST" }),
};
