export type GameType = "snakes_and_ladders" | "ludo" | "number_prediction" | "hand_cricket";
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

export type GuessResult = "low" | "high" | "correct";

export interface NumberGuessEntry {
  value: number;
  result: GuessResult;
}

export interface NumberOpponent {
  user_id: number;
  username: string;
  ready: boolean;
}

export interface NumberState {
  status: "setup" | "in_progress" | "finished";
  min: number;
  max: number;
  current_turn_user_id: number | null;
  winner_id: number | null;
  your_secret: number | null;
  you_ready: boolean;
  opponent: NumberOpponent | null;
  opponent_secret: number | null;
  your_guesses: NumberGuessEntry[];
  opponent_guesses: NumberGuessEntry[];
}

export interface HandCricketBallEntry {
  innings: number;
  ball_number: number;
  batsman_fingers: number;
  bowler_fingers: number;
  runs_scored: number;
  is_wicket: boolean;
}

export interface HandCricketLastBall extends HandCricketBallEntry {
  batsman_name: string;
}

export interface HandCricketState {
  status: "waiting" | "in_progress" | "innings_break" | "finished";
  innings: number;
  balls_per_innings: number;
  ball_number: number;
  batsman_id: number;
  bowler_id: number;
  batsman_name: string;
  bowler_name: string;
  your_role: "bat" | "bowl" | null;
  player1_id: number;
  player2_id: number;
  player1_name: string;
  player2_name: string;
  player1_runs: number;
  player2_runs: number;
  innings1_runs: number | null;
  you_submitted: boolean;
  opponent_submitted: boolean;
  your_fingers: number | null;
  last_ball: HandCricketLastBall | null;
  winner_id: number | null;
  is_tie: boolean;
  ball_history: HandCricketBallEntry[];
}

export interface RoomSocketMessage {
  type: "state" | "error";
  room?: Room;
  game?: GameState | null;
  number?: NumberState | null;
  hand_cricket?: HandCricketState | null;
  detail?: string;
}
