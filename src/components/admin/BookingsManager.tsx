"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { startSeating, markBookingDone, cancelBooking } from "@/lib/actions/bookings";

type BookingDto = {
  id: string;
  tableId: string;
  tableLabel: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  bookedFor: string;
  status: string;
  seatedAt: string | null;
};

export function BookingsManager({ bookings }: { bookings: BookingDto[] }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (bookings.length === 0) {
    return <p className="text-sm text-ink-dim">No active bookings right now.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bookings.map((b) => {
        const minutes = b.seatedAt ? Math.floor((now - new Date(b.seatedAt).getTime()) / 60000) : null;
        const wrappingUp = minutes !== null && minutes >= 40;

        return (
          <div
            key={b.id}
            className={clsx(
              "glass-card rounded-2xl p-5",
              wrappingUp && "border-2 border-pink",
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold">Table {b.tableLabel}</h3>
              <span className="rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim">
                {b.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-dim">
              {b.customerName} · {b.customerPhone} · Party of {b.partySize}
            </p>
            <p className="text-xs text-ink-dim">{new Date(b.bookedFor).toLocaleString()}</p>

            {minutes !== null && (
              <p className={clsx("mt-2 flex items-center gap-1 text-sm font-semibold", wrappingUp ? "text-pink" : "text-purple")}>
                <Clock size={14} /> Seated {minutes} min ago
                {wrappingUp && " — wrapping up soon"}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {b.status === "BOOKED" && (
                <button
                  onClick={() => startSeating(b.id)}
                  className="gradient-btn flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold"
                >
                  <Play size={12} /> Start seating
                </button>
              )}
              {b.status === "SEATED" && (
                <button
                  onClick={async () => {
                    await markBookingDone(b.id);
                    router.push(`/pay/${b.tableId}`);
                  }}
                  className="gradient-btn flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold"
                >
                  <CheckCircle2 size={12} /> Done — settle bill
                </button>
              )}
              <button
                onClick={() => cancelBooking(b.id)}
                className="flex items-center gap-1 rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-ink-dim hover:border-pink hover:text-pink"
              >
                <XCircle size={12} /> Cancel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
