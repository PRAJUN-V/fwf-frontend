"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { UserFormModal } from "@/components/admin/UserFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner, Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/services";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    if (user && !user.is_admin) router.replace("/games");
  }, [user, router]);

  const load = useCallback(async () => {
    try {
      setUsers(await usersApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaved = async () => {
    await load();
    // If the current admin edited themselves, refresh their session.
    await refresh().catch(() => undefined);
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setModalOpen(true);
  };

  if (!user?.is_admin) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted">
            Create player accounts and manage admin access.
          </p>
        </div>
        <Button onClick={openAdd}>+ Add user</Button>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Card className="overflow-hidden p-0">
        {users === null ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-7 w-7" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No users yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Username</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-2/40"
                >
                  <td className="px-5 py-3 font-medium">
                    {u.username}
                    {u.id === user.id && (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.is_admin ? (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Player</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {u.is_active ? (
                      <span className="text-xs text-success">Active</span>
                    ) : (
                      <span className="text-xs text-danger">Disabled</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <UserFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
