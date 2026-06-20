"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError } from "@/lib/api";
import { usersApi } from "@/lib/services";
import type { User } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (user: User) => void;
  editing: User | null;
}

export function UserFormModal({ open, onClose, onSaved, editing }: Props) {
  const isEdit = editing !== null;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPassword("");
    if (editing) {
      setUsername(editing.username);
      setEmail(editing.email);
      setIsAdmin(editing.is_admin);
    } else {
      setUsername("");
      setEmail("");
      setIsAdmin(false);
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      let saved: User;
      if (isEdit && editing) {
        saved = await usersApi.update(editing.id, {
          username,
          email,
          is_admin: isAdmin,
          ...(password ? { password } : {}),
        });
      } else {
        saved = await usersApi.create({ username, email, password, is_admin: isAdmin });
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit user" : "Add user"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label={isEdit ? "New password (leave blank to keep)" : "Password"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!isEdit}
          minLength={isEdit && !password ? undefined : 4}
          placeholder={isEdit ? "••••••" : ""}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          Grant admin privileges
        </label>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
