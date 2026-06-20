"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api";
import { roomsApi } from "@/lib/services";
import type { Room } from "@/types";

const GAME_TYPE = "snakes_and_ladders" as const;

export default function RoomsLobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await roomsApi.list();
      setRooms(all.filter((r) => r.game_type === GAME_TYPE));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load rooms");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  const handleJoin = async (room: Room) => {
    setJoiningId(room.id);
    setError(null);
    try {
      await roomsApi.join(room.id);
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to join room");
      setJoiningId(null);
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Snake &amp; Ladder rooms</h1>
          <p className="text-sm text-muted">Join an open room or create your own.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Create room</Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {rooms === null ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-7 w-7" />
        </div>
      ) : rooms.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-sm text-muted">
            No open rooms yet. Create one to get started!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const full = room.player_count >= room.max_players;
            const started = room.status !== "waiting";
            const disabled = full || started || joiningId !== null;
            return (
              <Card key={room.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold">{room.name}</h2>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " +
                        (started
                          ? "bg-accent/15 text-accent"
                          : full
                            ? "bg-danger/15 text-danger"
                            : "bg-success/15 text-success")
                      }
                    >
                      {started ? "In game" : full ? "Full" : "Open"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {room.player_count}/{room.max_players} players
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {room.players.map((p) => (
                      <span
                        key={p.user_id}
                        className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted"
                      >
                        {p.username}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  disabled={disabled}
                  onClick={() => handleJoin(room)}
                >
                  {joiningId === room.id
                    ? "Joining…"
                    : started
                      ? "In progress"
                      : full
                        ? "Room full"
                        : "Join room"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <CreateRoomModal
        open={modalOpen}
        gameType={GAME_TYPE}
        onClose={() => setModalOpen(false)}
        onCreated={(room) => {
          setModalOpen(false);
          router.push(`/rooms/${room.id}`);
        }}
      />
    </div>
  );
}
