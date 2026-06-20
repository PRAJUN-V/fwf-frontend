"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api";
import { roomsApi } from "@/lib/services";
import type { GameType, Room } from "@/types";

const GAME_META: Record<string, { title: string }> = {
  snakes_and_ladders: { title: "Snake & Ladder" },
  number_prediction: { title: "Number Prediction" },
};

function RoomsLobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get("game");
  const gameType: GameType =
    gameParam === "number_prediction" ? "number_prediction" : "snakes_and_ladders";
  const meta = GAME_META[gameType] ?? GAME_META.snakes_and_ladders;

  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await roomsApi.list();
      setRooms(all.filter((r) => r.game_type === gameType));
    } catch {
      setRooms([]);
    }
  }, [gameType]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setJoining(true);
    setJoinError(null);
    try {
      const room = await roomsApi.joinByCode(trimmed);
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : "Failed to join room");
      setJoining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{meta.title}</h1>
        <p className="text-sm text-muted">
          Create a private room and share the code, or enter a friend&apos;s code to join.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Create a room</h2>
            <p className="mt-1 text-sm text-muted">
              You&apos;ll get a code to share with your friends.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>+ Create room</Button>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Join with a code</h2>
          <p className="mt-1 text-sm text-muted">Enter the code your friend shared.</p>
          <form onSubmit={handleJoin} className="mt-4 space-y-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 7KQ2M9"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="text-center text-lg font-semibold tracking-[0.3em] uppercase"
              maxLength={12}
            />
            {joinError && (
              <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
                {joinError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={!code.trim()} loading={joining}>
              {joining ? "Joining…" : "Join room"}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Your rooms
        </h2>
        {rooms === null ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rooms.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-muted">
              You&apos;re not in any rooms yet. Create one or join with a code.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const started = room.status !== "waiting";
              return (
                <Card key={room.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs " +
                          (started
                            ? "bg-accent/15 text-accent"
                            : "bg-success/15 text-success")
                        }
                      >
                        {started ? "In game" : "Waiting"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      Code{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {room.code}
                      </span>{" "}
                      · {room.player_count}/{room.max_players} players
                    </p>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    variant="secondary"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                  >
                    Open
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CreateRoomModal
        open={modalOpen}
        gameType={gameType}
        onClose={() => setModalOpen(false)}
        onCreated={(room) => {
          setModalOpen(false);
          router.push(`/rooms/${room.id}`);
        }}
      />
    </div>
  );
}

export default function RoomsLobbyPage() {
  return (
    <Suspense fallback={<Spinner className="h-7 w-7" />}>
      <RoomsLobby />
    </Suspense>
  );
}
