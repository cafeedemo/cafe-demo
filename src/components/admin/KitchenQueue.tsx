"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { ChefHat, Check, XCircle, StickyNote, Clock } from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/sessions";

type OrderDto = {
  id: string;
  status: string;
  placedBy: string;
  note: string | null;
  createdAt: string;
  tableNumber: number;
  customerName: string;
  sessionId: string;
  items: { name: string; qty: number; price: string; notes: string | null }[];
};

const FILTERS = ["ACTIVE", "PLACED", "PREPARING", "SERVED", "CANCELLED", "ALL"] as const;

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-black/[0.05] text-ink",
  PREPARING: "bg-orange/15 text-orange",
  SERVED: "bg-lime/15 text-lime",
  CANCELLED: "bg-pink/15 text-pink",
};

export function KitchenQueue({ orders }: { orders: OrderDto[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ACTIVE");
  const [busy, setBusy] = useState<string | null>(null);

  const visible = orders.filter((o) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return o.status === "PLACED" || o.status === "PREPARING";
    return o.status === filter;
  });

  async function move(id: string, status: "PREPARING" | "SERVED" | "CANCELLED") {
    setBusy(id);
    try {
      await updateOrderStatus(id, status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-xs font-semibold",
              filter === f ? "gradient-btn" : "border border-black/10 text-ink-dim hover:text-ink",
            )}
          >
            {f === "ACTIVE" ? "Needs action" : f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-ink-dim">Nothing here right now.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((o) => (
            <div
              key={o.id}
              className={clsx(
                "glass-card rounded-2xl p-5",
                o.status === "PLACED" && "border-2 border-pink/40",
                o.status === "CANCELLED" && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-lg font-bold">Table {o.tableNumber}</h3>
                  <p className="text-xs text-ink-dim">
                    {o.customerName} ·{" "}
                    <span className="font-mono">{o.id.slice(-6).toUpperCase()}</span>
                  </p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    STATUS_STYLES[o.status],
                  )}
                >
                  {o.status}
                </span>
              </div>

              <p className="mt-1 flex items-center gap-1 text-[10px] text-ink-dim">
                <Clock size={10} />
                {new Date(o.createdAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {o.placedBy === "WAITER" && " · by staff"}
              </p>

              <div className="mt-3 flex flex-col gap-1.5 text-sm">
                {o.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.qty}× {item.name}
                      </span>
                      <span className="text-ink-dim">
                        ₹{(Number(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="flex items-start gap-1 text-xs italic text-pink">
                        <StickyNote size={11} className="mt-0.5 shrink-0" /> {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {o.note && (
                <p className="mt-2 rounded-lg bg-orange/10 px-3 py-2 text-xs italic text-orange">
                  {o.note}
                </p>
              )}

              {o.status !== "CANCELLED" && o.status !== "SERVED" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.status === "PLACED" && (
                    <button
                      onClick={() => move(o.id, "PREPARING")}
                      disabled={busy === o.id}
                      className="flex items-center gap-1 rounded-full bg-orange/15 px-3 py-1.5 text-xs font-semibold text-orange hover:bg-orange/25 disabled:opacity-50"
                    >
                      <ChefHat size={12} /> Start cooking
                    </button>
                  )}
                  <button
                    onClick={() => move(o.id, "SERVED")}
                    disabled={busy === o.id}
                    className="flex items-center gap-1 rounded-full bg-lime/15 px-3 py-1.5 text-xs font-semibold text-lime hover:bg-lime/25 disabled:opacity-50"
                  >
                    <Check size={12} /> Served
                  </button>
                  <button
                    onClick={() => move(o.id, "CANCELLED")}
                    disabled={busy === o.id}
                    className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink-dim hover:border-pink hover:text-pink disabled:opacity-50"
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              )}

              <Link
                href={`/bill/${o.sessionId}`}
                className="mt-3 inline-block text-xs font-semibold text-pink hover:underline"
              >
                See full tab →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
