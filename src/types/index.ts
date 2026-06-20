export type GameType = "snakes_and_ladders" | "ludo";
export type RoomStatus = "waiting" | "playing" | "finished";
export type GameStatus = "in_progress" | "finished";

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RoomPlayer {
  user_id: number;
  username: string;
  seat_order: number;
  color: string;
}

export interface Room {
  id: number;
  code: string | null;
  name: string;
  game_type: GameType;
  max_players: number;
  status: RoomStatus;
  host_id: number;
  created_at: string;
  player_count: number;
  players: RoomPlayer[];
}

export interface GamePlayerState {
  user_id: number;
  username: string;
  color: string;
  seat_order: number;
  position: number;
}

export interface GameState {
  room_id: number;
  game_id: number;
  status: GameStatus;
  current_turn_user_id: number | null;
  last_dice: number | null;
  winner_id: number | null;
  players: GamePlayerState[];
}

export interface RoomSocketMessage {
  type: "state" | "error";
  room?: Room;
  game?: GameState | null;
  detail?: string;
}
