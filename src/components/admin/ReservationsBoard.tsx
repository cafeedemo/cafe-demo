"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Play, XCircle, UserX, Users, Clock } from "lucide-react";
import { seatReservation, cancelReservation, markNoShow } from "@/lib/actions/reservations";
import { isAnonymousPhone } from "@/lib/booking-slots";

type ReservationDto = {
  id: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  partySize: number;
  startAt: string;
  endAt: string;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  RESERVED: "bg-orange/15 text-orange",
  SEATED: "bg-purple/15 text-purple",
  COMPLETED: "bg-lime/15 text-lime",
  CANCELLED: "bg-pink/15 text-pink",
  NO_SHOW: "bg-black/[0.06] text-ink-dim",
};

const FILTERS = ["UPCOMING", "SEATED", "ALL"] as const;

export function ReservationsBoard({ reservations }: { reservations: ReservationDto[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("UPCOMING");
  const [busy, setBusy] = useState<string | null>(null);

  const visible = reservations.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return r.status === "RESERVED";
    return r.status === "SEATED";
  });

  async function run(id: string, fn: (id: string) => Promise<void>) {
    setBusy(id);
    try {
      await fn(id);
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
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-ink-dim">No reservations here.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <div key={r.id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading text-lg font-bold">Table {r.tableNumber}</h3>
                  <p className="text-sm text-ink-dim">
                    {r.customerName}
                    {!isAnonymousPhone(r.customerPhone) && ` · ${r.customerPhone}`}
                  </p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    STATUS_STYLES[r.status],
                  )}
                >
                  {r.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-dim">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(r.startAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {r.partySize}
                </span>
              </div>
              <p className="mt-1 text-[10px] text-ink-dim">
                Held until{" "}
                {new Date(r.endAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>

              {r.status === "RESERVED" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => run(r.id, seatReservation)}
                    disabled={busy === r.id}
                    className="gradient-btn flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60"
                  >
                    <Play size={12} /> Seat guest
                  </button>
                  <button
                    onClick={() => run(r.id, markNoShow)}
                    disabled={busy === r.id}
                    className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink disabled:opacity-60"
                  >
                    <UserX size={12} /> No show
                  </button>
                  <button
                    onClick={() => run(r.id, cancelReservation)}
                    disabled={busy === r.id}
                    className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-ink-dim hover:border-pink hover:text-pink disabled:opacity-60"
                  >
                    <XCircle size={12} /> Cancel
                  </button>
                </div>
              )}

              {r.status === "SEATED" && (
                <p className="mt-4 text-xs text-ink-dim">
                  Tab is open — settle it from Live Floor.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
