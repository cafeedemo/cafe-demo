"use client";

import { useRef, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { createAdminUser, deleteUser } from "@/lib/actions/users";

type UserDto = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserDto[];
  currentUserId: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setError("");
    try {
      await createAdminUser(formData);
      formRef.current?.reset();
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await deleteUser(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="gradient-btn flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "Add admin"}
        </button>
      </div>

      {showForm && (
        <form
          ref={formRef}
          action={handleSubmit}
          className="glass-card mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-3"
        >
          <input
            name="name"
            placeholder="Full name"
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Temporary password"
            required
            minLength={6}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <button type="submit" className="gradient-btn rounded-full px-5 py-2.5 text-sm sm:col-span-3">
            Create admin account
          </button>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>
      )}

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-ink-dim">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-3 font-medium">{u.name ?? "—"}</td>
                <td className="px-6 py-3 text-ink-dim">{u.email}</td>
                <td className="px-6 py-3">
                  <span className="rounded-full bg-purple/10 px-3 py-1 text-xs text-purple">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-ink-dim hover:text-pink"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
