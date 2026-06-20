"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getToken } from "./api";
import { wsBaseUrl } from "./config";
import type { GameState, HandCricketState, NumberState, Room, RoomSocketMessage } from "@/types";

export type ConnectionStatus = "connecting" | "open" | "closed";

export type RoomAction =
  | "start"
  | "roll"
  | "sync"
  | "set_secret"
  | "guess"
  | "reveal"
  | "begin_innings_2";

interface UseRoomSocketResult {
  status: ConnectionStatus;
  room: Room | null;
  game: GameState | null;
  numberState: NumberState | null;
  handCricketState: HandCricketState | null;
  error: string | null;
  /** Increments on every server message (state or error); used to clear pending UI. */
  messageVersion: number;
  clearError: () => void;
  send: (action: RoomAction, payload?: Record<string, unknown>) => void;
}

export function useRoomSocket(roomId: number): UseRoomSocketResult {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [numberState, setNumberState] = useState<NumberState | null>(null);
  const [handCricketState, setHandCricketState] = useState<HandCricketState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageVersion, setMessageVersion] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("closed");
      setError("You are not signed in");
      return;
    }

    let closedByUs = false;
    const url = `${wsBaseUrl()}/ws/rooms/${roomId}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => setStatus("open");

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as RoomSocketMessage;
        if (msg.type === "state") {
          if (msg.room) setRoom(msg.room);
          setGame(msg.game ?? null);
          setNumberState(msg.number ?? null);
          setHandCricketState(msg.hand_cricket ?? null);
        } else if (msg.type === "error") {
          setError(msg.detail ?? "Something went wrong");
        }
        setMessageVersion((v) => v + 1);
      } catch {
        // ignore malformed messages
      }
    };

    socket.onclose = () => {
      setStatus("closed");
      if (!closedByUs) {
        // Connection dropped unexpectedly.
      }
    };

    socket.onerror = () => setStatus("closed");

    return () => {
      closedByUs = true;
      socket.close();
      socketRef.current = null;
    };
  }, [roomId]);

  const send = useCallback(
    (action: RoomAction, payload?: Record<string, unknown>) => {
      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action, ...payload }));
      }
    },
    [],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    room,
    game,
    numberState,
    handCricketState,
    error,
    messageVersion,
    clearError,
    send,
  };
}
