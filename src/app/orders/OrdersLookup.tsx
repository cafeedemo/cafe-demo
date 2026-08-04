"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Search, Receipt } from "lucide-react";
import { lookupSessionsByPhone } from "@/lib/actions/sessions";

type SessionDto = Awaited<ReturnType<typeof lookupSessionsByPhone>>[number];

export function OrdersLookup({
  initialPhone,
  initialSessions,
}: {
  initialPhone?: string;
  initialSessions?: SessionDto[] | null;
}) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [sessions, setSessions] = useState<SessionDto[] | null>(initialSessions ?? null);
  const [loading, setLoading] = useState(false);

  async function search(value: string) {
    if (!value.trim()) return;
    setLoading(true);
    try {
      setSessions(await lookupSessionsByPhone(value));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(phone);
        }}
        className="glass-card flex gap-3 rounded-2xl p-4"
      >
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Mobile number"
          className="min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="gradient-btn flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          <Search size={16} /> {loading ? "…" : "Find"}
        </button>
      </form>

      {sessions && (
        <div className="mt-8 flex flex-col gap-4">
          {sessions.length === 0 ? (
            <div className="glass-card flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
              <Receipt className="text-ink-dim" size={28} />
              <p className="text-ink-dim">No visits found for that number.</p>
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-heading font-bold">Table {s.tableNumber}</p>
                    <p className="text-xs text-ink-dim">
                      {new Date(s.openedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      s.paymentStatus === "PAID"
                        ? "bg-lime/15 text-lime"
                        : "bg-orange/15 text-orange",
                    )}
                  >
                    {s.paymentStatus}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {s.orders
                    .filter((o) => o.status !== "CANCELLED")
                    .map((o, idx) => (
                      <div key={o.id} className="rounded-xl bg-black/[0.02] p-3">
                        <p className="mb-1 text-xs text-ink-dim">
                          Round {idx + 1} · Order ID{" "}
                          <span className="font-mono font-semibold">
                            {o.id.slice(-6).toUpperCase()}
                          </span>{" "}
                          · {o.status}
                        </p>
                        {o.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>
                              {item.name} × {item.qty}
                              {item.notes && (
                                <span className="block text-xs italic text-ink-dim">
                                  “{item.notes}”
                                </span>
                              )}
                            </span>
                            <span>₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 text-sm font-semibold">
                  <span>Total ₹{s.total.toFixed(2)}</span>
                  {s.status !== "CLOSED" && (
                    <Link href={`/bill/${s.id}`} className="text-pink hover:underline">
                      View bill →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
