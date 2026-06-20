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
  list: () => apiFetch<Room[]>("/rooms"),
  create: (payload: RoomCreatePayload) =>
    apiFetch<Room>("/rooms", { method: "POST", body: payload }),
  get: (id: number) => apiFetch<Room>(`/rooms/${id}`),
  join: (id: number) => apiFetch<Room>(`/rooms/${id}/join`, { method: "POST" }),
  leave: (id: number) =>
    apiFetch<{ deleted: boolean }>(`/rooms/${id}/leave`, { method: "POST" }),
};
