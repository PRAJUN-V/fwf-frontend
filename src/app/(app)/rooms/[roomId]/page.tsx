"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Dice } from "@/components/game/Dice";
import { NumberPredictionGame } from "@/components/game/NumberPredictionGame";
import { SnakeLadderBoard } from "@/components/game/SnakeLadderBoard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { colorHex } from "@/lib/snakesAndLadders";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { roomsApi } from "@/lib/services";
import { useRoomSocket } from "@/lib/ws";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);
  const router = useRouter();
  const { user } = useAuth();
  const { status, room, game, numberState, error, clearError, send } =
    useRoomSocket(roomId);

  const [rolling, setRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastDiceRef = useRef<number | null>(null);

  const copyCode = async () => {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  useEffect(() => {
    if (!game) return;
    if (game.last_dice !== lastDiceRef.current) {
      lastDiceRef.current = game.last_dice;
      setRolling(false);
    }
  }, [game]);

  const leave = async () => {
    try {
      await roomsApi.leave(roomId);
    } catch {
      // ignore
    }
    router.push("/rooms");
  };

  if (status === "connecting" && !room) return <FullPageSpinner />;

  if (status === "closed" && !room) {
    return (
      <Card className="text-center">
        <p className="text-sm text-danger">
          Could not connect to this room. It may no longer exist.
        </p>
        <Button className="mt-4" onClick={() => router.push("/rooms")}>
          Back to rooms
        </Button>
      </Card>
    );
  }

  if (!room || !user) return <FullPageSpinner />;

  const isHost = room.host_id === user.id;
  const isMyTurn = game?.current_turn_user_id === user.id;
  const playing = room.status === "playing" && game?.status === "in_progress";
  const finished = game?.status === "finished";
  const winner = game?.players.find((p) => p.user_id === game.winner_id);

  const usernameById = (id: number | null) =>
    game?.players.find((p) => p.user_id === id)?.username ?? "—";

  const handleRoll = () => {
    setRolling(true);
    send("roll");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/rooms")}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Rooms
          </button>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-sm text-muted">
            Snake &amp; Ladder · {room.player_count}/{room.max_players} players ·{" "}
            <span
              className={cn(
                status === "open" ? "text-success" : "text-muted",
              )}
            >
              {status === "open" ? "connected" : status}
            </span>
          </p>
        </div>
        <Button variant="secondary" onClick={leave}>
          Leave
        </Button>
      </div>

      {room.code && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface-2/50 px-4 py-3">
          <span className="text-sm text-muted">Share this code to invite friends:</span>
          <span className="font-mono text-xl font-bold tracking-[0.3em] text-foreground">
            {room.code}
          </span>
          <Button size="sm" variant="secondary" onClick={copyCode}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          <span>{error}</span>
          <button onClick={clearError} className="text-danger/70 hover:text-danger">
            ✕
          </button>
        </div>
      )}

      {room.game_type === "number_prediction" ? (
        <NumberPredictionGame
          room={room}
          state={numberState}
          user={user}
          send={send}
        />
      ) : (
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-2 sm:p-4">
          {playing || finished ? (
            <SnakeLadderBoard
              players={game!.players}
              currentTurnUserId={game!.current_turn_user_id}
            />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="text-5xl">🐍🪜</div>
              <p className="mt-4 text-lg font-semibold">Waiting to start</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                {isHost
                  ? "Start the game once at least 2 players have joined."
                  : "Waiting for the host to start the game."}
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="order-2 lg:order-1">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              Players
            </h2>
            <ul className="space-y-2">
              {room.players.map((p) => {
                const state = game?.players.find((g) => g.user_id === p.user_id);
                const isTurn = game?.current_turn_user_id === p.user_id;
                return (
                  <li
                    key={p.user_id}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2",
                      isTurn ? "bg-primary/15" : "bg-surface-2/50",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: colorHex(p.color) }}
                      />
                      <span className="text-sm font-medium">{p.username}</span>
                      {p.user_id === room.host_id && (
                        <span className="text-xs text-muted">host</span>
                      )}
                      {p.user_id === user.id && (
                        <span className="text-xs text-accent">you</span>
                      )}
                    </span>
                    {state && (
                      <span className="text-xs text-muted">▦ {state.position}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="order-1 text-center lg:order-2">
            {finished ? (
              <div className="space-y-3">
                <div className="text-4xl">🏆</div>
                <p className="text-lg font-bold">
                  {winner?.user_id === user.id ? "You win!" : `${winner?.username} wins!`}
                </p>
                <Button className="w-full" onClick={() => router.push("/rooms")}>
                  Back to rooms
                </Button>
              </div>
            ) : playing ? (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  {isMyTurn ? (
                    <span className="font-semibold text-foreground">Your turn</span>
                  ) : (
                    <>
                      Turn:{" "}
                      <span className="font-semibold text-foreground">
                        {usernameById(game!.current_turn_user_id)}
                      </span>
                    </>
                  )}
                </p>
                <div className="flex justify-center">
                  <Dice value={game!.last_dice} rolling={rolling} />
                </div>
                <Button
                  className="w-full"
                  disabled={!isMyTurn || rolling}
                  onClick={handleRoll}
                >
                  {isMyTurn ? (rolling ? "Rolling…" : "Roll dice") : "Waiting…"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  {room.player_count < 2
                    ? "Need at least 2 players to start."
                    : "Ready when you are."}
                </p>
                {isHost && (
                  <Button
                    className="w-full"
                    disabled={room.player_count < 2}
                    onClick={() => send("start")}
                  >
                    Start game
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}
