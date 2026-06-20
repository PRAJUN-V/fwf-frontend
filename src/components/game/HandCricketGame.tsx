"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { HandCricketState, Room, User } from "@/types";

interface Props {
  room: Room;
  state: HandCricketState | null;
  user: User;
  send: (
    action: "start" | "reveal" | "begin_innings_2",
    payload?: Record<string, unknown>,
  ) => void;
  messageVersion: number;
}

function FingerPicker({
  onPick,
  disabled,
  loading,
}: {
  onPick: (n: number) => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled || loading}
          onClick={() => onPick(n)}
          className={cn(
            "flex aspect-square items-center justify-center rounded-xl border border-border bg-surface-2 text-2xl font-bold transition-colors",
            "hover:border-primary hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Scoreboard({ state }: { state: HandCricketState }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl bg-surface-2/50 px-4 py-3 text-center">
        <p className="text-xs text-muted">{state.player1_name}</p>
        <p className="font-mono text-3xl font-bold">{state.player1_runs}</p>
      </div>
      <div className="rounded-xl bg-surface-2/50 px-4 py-3 text-center">
        <p className="text-xs text-muted">{state.player2_name}</p>
        <p className="font-mono text-3xl font-bold">{state.player2_runs}</p>
      </div>
    </div>
  );
}

export function HandCricketGame({ room, state, user, send, messageVersion }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isHost = room.host_id === user.id;

  useEffect(() => {
    setPending(false);
  }, [messageVersion]);

  if (!state || state.status === "waiting") {
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <div className="text-5xl">🏏</div>
        <h2 className="text-lg font-semibold">Hand Cricket</h2>
        <p className="text-sm text-muted">
          Both players show 1–6 fingers each ball. Same number = OUT. Different = batsman
          scores their fingers as runs. 6 balls per innings, then roles swap.
        </p>
        {isHost ? (
          <Button
            className="w-full"
            disabled={room.player_count < 2}
            loading={pending}
            onClick={() => {
              setPending(true);
              send("start");
            }}
          >
            {room.player_count < 2 ? "Waiting for opponent…" : "Start match"}
          </Button>
        ) : (
          <p className="text-sm text-muted">Waiting for the host to start…</p>
        )}
      </Card>
    );
  }

  if (state.status === "innings_break") {
    return (
      <Card className="mx-auto max-w-lg space-y-5 text-center">
        <h2 className="text-lg font-semibold">Innings break</h2>
        <Scoreboard state={state} />
        <p className="text-sm text-muted">
          Innings 1: {state.innings1_runs ?? 0} runs. Roles swap —{" "}
          {state.batsman_name} bats now.
        </p>
        {isHost ? (
          <Button
            className="w-full"
            loading={pending}
            onClick={() => {
              setPending(true);
              send("begin_innings_2");
            }}
          >
            Start innings 2
          </Button>
        ) : (
          <p className="text-sm text-muted">Waiting for host to start innings 2…</p>
        )}
      </Card>
    );
  }

  if (state.status === "finished") {
    const youWon = state.winner_id === user.id;
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <div className="text-5xl">{state.is_tie ? "🤝" : youWon ? "🏆" : "😅"}</div>
        <h2 className="text-xl font-bold">
          {state.is_tie
            ? "It's a tie!"
            : youWon
              ? "You win!"
              : `${state.winner_id === state.player1_id ? state.player1_name : state.player2_name} wins!`}
        </h2>
        <Scoreboard state={state} />
        <Button className="w-full" variant="secondary" onClick={() => router.push("/games")}>
          Back to games
        </Button>
      </Card>
    );
  }

  // in_progress
  const roleLabel =
    state.your_role === "bat"
      ? "You are batting — pick your fingers"
      : state.your_role === "bowl"
        ? "You are bowling — pick your fingers"
        : "Pick your fingers";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            Innings {state.innings} · Ball {state.ball_number}/{state.balls_per_innings}
          </h2>
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
            {state.batsman_name} vs {state.bowler_name}
          </span>
        </div>

        <Scoreboard state={state} />

        {state.last_ball && (
          <div
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              state.last_ball.is_wicket ? "bg-danger/10 text-danger" : "bg-success/10 text-success",
            )}
          >
            Ball {state.last_ball.ball_number}: {state.last_ball.batsman_name} showed{" "}
            {state.last_ball.batsman_fingers}, bowler showed {state.last_ball.bowler_fingers}
            {state.last_ball.is_wicket
              ? " — OUT!"
              : ` — +${state.last_ball.runs_scored} runs`}
          </div>
        )}

        <div>
          <p className="mb-3 text-sm font-medium">{roleLabel}</p>
          {state.you_submitted ? (
            <p className="rounded-lg bg-surface-2/50 px-3 py-3 text-center text-sm text-muted">
              You showed {state.your_fingers}.{" "}
              {state.opponent_submitted
                ? "Resolving…"
                : "Waiting for opponent to show fingers…"}
            </p>
          ) : (
            <FingerPicker
              disabled={!state.your_role}
              loading={pending}
              onPick={(n) => {
                setPending(true);
                send("reveal", { value: n });
              }}
            />
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Ball log
        </h3>
        {state.ball_history.length === 0 ? (
          <p className="text-sm text-muted">No balls yet.</p>
        ) : (
          <ul className="max-h-64 space-y-1.5 overflow-y-auto text-xs">
            {[...state.ball_history].reverse().map((b, i) => (
              <li
                key={`${b.innings}-${b.ball_number}-${i}`}
                className="flex justify-between rounded-lg bg-surface-2/50 px-2 py-1.5"
              >
                <span>
                  I{b.innings} B{b.ball_number}: {b.batsman_fingers} vs {b.bowler_fingers}
                </span>
                <span className={b.is_wicket ? "text-danger" : "text-success"}>
                  {b.is_wicket ? "OUT" : `+${b.runs_scored}`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted">
          Same fingers = wicket. Different = batsman scores their number.
        </p>
      </Card>
    </div>
  );
}
