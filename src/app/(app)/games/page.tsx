"use client";

import Link from "next/link";

import { Card } from "@/components/ui/Card";

interface GameDef {
  key: string;
  title: string;
  description: string;
  players: string;
  href: string | null;
  emoji: string;
}

const GAMES: GameDef[] = [
  {
    key: "snakes_and_ladders",
    title: "Snake & Ladder",
    description: "Classic race to 100. Climb ladders, dodge snakes.",
    players: "2-4 players",
    href: "/rooms?game=snakes_and_ladders",
    emoji: "🐍",
  },
  {
    key: "number_prediction",
    title: "Number Prediction",
    description: "Pick a secret number, then race to guess your rival's.",
    players: "2 players",
    href: "/rooms?game=number_prediction",
    emoji: "🔢",
  },
  {
    key: "ludo",
    title: "Ludo",
    description: "Move all your tokens home before everyone else.",
    players: "2-4 players",
    href: null,
    emoji: "🎲",
  },
];

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Choose a game</h1>
        <p className="text-sm text-muted">Pick a game to create or join a room.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((game) => {
          const content = (
            <Card className="group h-full transition-transform hover:-translate-y-1">
              <div className="mb-4 text-4xl">{game.emoji}</div>
              <h2 className="text-lg font-semibold">{game.title}</h2>
              <p className="mt-1 text-sm text-muted">{game.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">{game.players}</span>
                {game.href ? (
                  <span className="text-sm font-medium text-primary group-hover:underline">
                    Play →
                  </span>
                ) : (
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                    Coming soon
                  </span>
                )}
              </div>
            </Card>
          );

          return game.href ? (
            <Link key={game.key} href={game.href}>
              {content}
            </Link>
          ) : (
            <div key={game.key} className="cursor-not-allowed opacity-70">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
