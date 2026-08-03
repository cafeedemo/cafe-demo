"use client";

import { clsx } from "clsx";
import { updateReservationStatus } from "@/lib/actions/reservations";

type ReservationDto = {
  id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  timeSlot: string;
  notes: string | null;
  status: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange/10 text-orange",
  CONFIRMED: "bg-lime/10 text-lime",
  CANCELLED: "bg-pink/10 text-pink",
};

export function ReservationsTable({ reservations }: { reservations: ReservationDto[] }) {
  if (reservations.length === 0) {
    return <p className="text-sm text-ink-dim">No reservations yet.</p>;
  }

  return (
    <div className="glass-card overflow-x-auto rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 text-ink-dim">
          <tr>
            <th className="px-6 py-3">Guest</th>
            <th className="px-6 py-3">Contact</th>
            <th className="px-6 py-3">Date &amp; time</th>
            <th className="px-6 py-3">Party</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {reservations.map((r) => (
            <tr key={r.id}>
              <td className="px-6 py-3">
                <p className="font-medium">{r.name}</p>
                {r.notes && <p className="text-xs text-ink-dim">{r.notes}</p>}
              </td>
              <td className="px-6 py-3 text-ink-dim">
                <p>{r.email}</p>
                <p>{r.phone}</p>
              </td>
              <td className="px-6 py-3 text-ink-dim">
                {new Date(r.date).toLocaleDateString()} · {r.timeSlot}
              </td>
              <td className="px-6 py-3">{r.partySize}</td>
              <td className="px-6 py-3">
                <span className={clsx("rounded-full px-3 py-1 text-xs", STATUS_STYLES[r.status])}>
                  {r.status}
                </span>
              </td>
              <td className="px-6 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {r.status !== "CONFIRMED" && (
                    <button
                      onClick={() => updateReservationStatus(r.id, "CONFIRMED")}
                      className="rounded-full bg-lime/10 px-3 py-1 text-xs text-lime hover:bg-lime/20"
                    >
                      Confirm
                    </button>
                  )}
                  {r.status !== "CANCELLED" && (
                    <button
                      onClick={() => updateReservationStatus(r.id, "CANCELLED")}
                      className="rounded-full bg-pink/10 px-3 py-1 text-xs text-pink hover:bg-pink/20"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
