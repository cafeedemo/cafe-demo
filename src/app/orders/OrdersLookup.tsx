"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { Search, Receipt, QrCode } from "lucide-react";
import type { GuestSession } from "@/lib/actions/sessions";

export function OrdersLookup({
  sessions,
  recognised,
  searchedPhone,
}: {
  sessions: GuestSession[];
  recognised: boolean;
  searchedPhone?: string;
}) {
  const [showLookup, setShowLookup] = useState(Boolean(searchedPhone));

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
          <Receipt className="text-ink-dim" size={30} />
          <p className="text-ink-dim">
            {searchedPhone
              ? "No visits found for that number."
              : recognised
                ? "You haven't ordered anything yet."
                : "Nothing here yet."}
          </p>
          <Link
            href="/order"
            className="gradient-btn mt-1 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <QrCode size={14} /> Start an order
          </Link>
        </div>
        <PhoneFallback show={showLookup} onShow={() => setShowLookup(true)} defaultValue={searchedPhone} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((s) => (
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
                s.paymentStatus === "PAID" ? "bg-lime/15 text-lime" : "bg-orange/15 text-orange",
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
      ))}

      <PhoneFallback show={showLookup} onShow={() => setShowLookup(true)} defaultValue={searchedPhone} />
    </div>
  );
}

/**
 * Guests are matched by cookie, so this is only for the edge case of booking on
 * one device and wanting to see it on another.
 */
function PhoneFallback({
  show,
  onShow,
  defaultValue,
}: {
  show: boolean;
  onShow: () => void;
  defaultValue?: string;
}) {
  if (!show) {
    return (
      <button
        onClick={onShow}
        className="mx-auto text-xs font-semibold text-ink-dim hover:text-pink"
      >
        Booked on another device? Look up by mobile number
      </button>
    );
  }

  return (
    <form method="get" className="glass-card flex gap-3 rounded-2xl p-4">
      <input
        name="phone"
        type="tel"
        defaultValue={defaultValue}
        placeholder="Mobile number used for the booking"
        className="min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
      />
      <button
        type="submit"
        className="gradient-btn flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
      >
        <Search size={16} /> Find
      </button>
    </form>
  );
}
