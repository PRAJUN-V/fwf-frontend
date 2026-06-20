"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api";
import { roomsApi } from "@/lib/services";
import type { GameType, Room } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (room: Room) => void;
  gameType: GameType;
}

export function CreateRoomModal({ open, onClose, onCreated, gameType }: Props) {
  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const lockTwoPlayers = gameType === "number_prediction";

  useEffect(() => {
    if (open) {
      setName("");
      setMaxPlayers(2);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const room = await roomsApi.create({
        name: name.trim(),
        game_type: gameType,
        max_players: maxPlayers,
      });
      onCreated(room);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Friday night game"
          required
          minLength={2}
        />

        {lockTwoPlayers ? (
          <p className="rounded-lg bg-surface-2/50 px-3 py-2 text-sm text-muted">
            Number Prediction is a 2-player duel.
          </p>
        ) : (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-muted">
              Max players
            </span>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxPlayers(n)}
                  className={
                    "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                    (maxPlayers === n
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-surface text-muted hover:text-foreground")
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
