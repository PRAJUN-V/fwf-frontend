"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import type { NumberGuessEntry, NumberState, Room, User } from "@/types";

interface Props {
  room: Room;
  state: NumberState | null;
  user: User;
  send: (action: "set_secret" | "start" | "guess", payload?: Record<string, unknown>) => void;
}

function resultLabel(result: NumberGuessEntry["result"]): string {
  if (result === "low") return "Too low — go higher ⬆";
  if (result === "high") return "Too high — go lower ⬇";
  return "Correct! 🎯";
}

function resultClass(result: NumberGuessEntry["result"]): string {
  if (result === "low") return "text-accent";
  if (result === "high") return "text-danger";
  return "text-success";
}

function GuessList({
  title,
  guesses,
  empty,
}: {
  title: string;
  guesses: NumberGuessEntry[];
  empty: string;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      {guesses.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {[...guesses].reverse().map((g, i) => (
            <li
              key={`${g.value}-${i}`}
              className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2"
            >
              <span className="font-mono text-lg font-bold">{g.value}</span>
              <span className={cn("text-xs font-medium", resultClass(g.result))}>
                {resultLabel(g.result)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NumberPredictionGame({ room, state, user, send }: Props) {
  const [secret, setSecret] = useState("");
  const [guess, setGuess] = useState("");

  if (!state) return null;

  const isHost = room.host_id === user.id;
  const min = state.min;
  const max = state.max;

  const submitSecret = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(secret);
    if (!Number.isInteger(value) || value < min || value > max) return;
    send("set_secret", { value });
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(guess);
    if (!Number.isInteger(value) || value < min || value > max) return;
    send("guess", { value });
    setGuess("");
  };

  // ----- Setup phase -----
  if (state.status === "setup") {
    const bothReady = state.you_ready && state.opponent?.ready;
    return (
      <Card className="mx-auto max-w-lg space-y-5">
        <div className="text-center">
          <div className="text-4xl">🔢</div>
          <h2 className="mt-2 text-lg font-semibold">Pick your secret number</h2>
          <p className="mt-1 text-sm text-muted">
            Choose a number between {min} and {max}. Your rival will try to guess it.
          </p>
        </div>

        {state.you_ready ? (
          <p className="rounded-lg bg-success/10 px-3 py-2 text-center text-sm text-success">
            Your secret number is set{state.your_secret !== null ? ` (${state.your_secret})` : ""}.
          </p>
        ) : (
          <form onSubmit={submitSecret} className="space-y-3">
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={`${min} - ${max}`}
              className="text-center text-xl font-bold"
              required
            />
            <Button type="submit" className="w-full">
              Lock in my number
            </Button>
          </form>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2">
            <span>{user.username} (you)</span>
            <span className={state.you_ready ? "text-success" : "text-muted"}>
              {state.you_ready ? "Ready" : "Choosing…"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2">
            <span>{state.opponent ? state.opponent.username : "Waiting for opponent…"}</span>
            <span className={state.opponent?.ready ? "text-success" : "text-muted"}>
              {state.opponent ? (state.opponent.ready ? "Ready" : "Choosing…") : "—"}
            </span>
          </div>
        </div>

        {isHost ? (
          <Button className="w-full" disabled={!bothReady} onClick={() => send("start")}>
            {bothReady ? "Start game" : "Waiting for both players…"}
          </Button>
        ) : (
          <p className="text-center text-sm text-muted">
            {bothReady ? "Waiting for the host to start…" : "Waiting for both players to be ready…"}
          </p>
        )}
      </Card>
    );
  }

  // ----- Finished phase -----
  if (state.status === "finished") {
    const youWon = state.winner_id === user.id;
    return (
      <Card className="mx-auto max-w-lg space-y-4 text-center">
        <div className="text-5xl">{youWon ? "🏆" : "😅"}</div>
        <h2 className="text-xl font-bold">
          {youWon ? "You guessed it — you win!" : `${state.opponent?.username ?? "Opponent"} wins!`}
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-surface-2/50 px-3 py-3">
            <p className="text-muted">Your number</p>
            <p className="font-mono text-2xl font-bold">{state.your_secret}</p>
          </div>
          <div className="rounded-lg bg-surface-2/50 px-3 py-3">
            <p className="text-muted">{state.opponent?.username ?? "Opponent"}&apos;s number</p>
            <p className="font-mono text-2xl font-bold">{state.opponent_secret}</p>
          </div>
        </div>
        <div className="grid gap-4 text-left sm:grid-cols-2">
          <GuessList title="Your guesses" guesses={state.your_guesses} empty="No guesses." />
          <GuessList
            title="Their guesses"
            guesses={state.opponent_guesses}
            empty="No guesses."
          />
        </div>
      </Card>
    );
  }

  // ----- In-progress phase -----
  const isYourTurn = state.current_turn_user_id === user.id;

  // Derive the narrowing range from your guesses to convey closeness.
  let lo = min;
  let hi = max;
  for (const g of state.your_guesses) {
    if (g.result === "low") lo = Math.max(lo, g.value + 1);
    if (g.result === "high") hi = Math.min(hi, g.value - 1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Guess {state.opponent?.username ?? "opponent"}&apos;s number
          </h2>
          <span className="text-xs text-muted">
            {min}–{max}
          </span>
        </div>

        <div className="rounded-xl bg-surface-2/50 px-4 py-3 text-center">
          <p className="text-sm text-muted">Based on your guesses, it&apos;s between</p>
          <p className="font-mono text-2xl font-bold">
            {lo} <span className="text-muted">and</span> {hi}
          </p>
        </div>

        {isYourTurn ? (
          <form onSubmit={submitGuess} className="space-y-3">
            <Input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Your guess"
              className="text-center text-xl font-bold"
              autoFocus
              required
            />
            <Button type="submit" className="w-full">
              Guess
            </Button>
          </form>
        ) : (
          <p className="rounded-lg bg-surface-2/50 px-3 py-3 text-center text-sm text-muted">
            Waiting for {state.opponent?.username ?? "opponent"} to guess…
          </p>
        )}

        <GuessList
          title="Your guesses"
          guesses={state.your_guesses}
          empty="Make your first guess!"
        />
      </Card>

      <div className="space-y-6">
        <Card>
          <p className="text-sm text-muted">Your secret number</p>
          <p className="font-mono text-3xl font-bold">{state.your_secret}</p>
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              isYourTurn ? "text-foreground" : "text-muted",
            )}
          >
            {isYourTurn ? "Your turn — make a guess!" : "Opponent's turn"}
          </p>
        </Card>

        <Card>
          <GuessList
            title={`${state.opponent?.username ?? "Their"} guesses at you`}
            guesses={state.opponent_guesses}
            empty="They haven't guessed yet."
          />
        </Card>
      </div>
    </div>
  );
}
