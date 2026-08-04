"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Script from "next/script";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { PartyPopper, CalendarDays, Clock, Info, CreditCard } from "lucide-react";
import { FloorPlanGrid, type GridTable } from "@/components/FloorPlanGrid";
import {
  createReservation,
  getAvailability,
  startAdvanceBooking,
  confirmAdvanceBooking,
  type ReservationState,
  type SlotAvailability,
} from "@/lib/actions/reservations";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Availability = Awaited<ReturnType<typeof getAvailability>>;

const initialState: ReservationState = {};

export function BookingView({
  initialDate,
  initialData,
}: {
  initialDate: string;
  initialData: Availability;
}) {
  const [date, setDate] = useState(initialDate);
  const [partySize, setPartySize] = useState(2);
  const [data, setData] = useState(initialData);
  const [slot, setSlot] = useState<SlotAvailability | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(createReservation, initialState);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paidResult, setPaidResult] = useState<ReservationState | null>(null);

  /**
   * Deposit bookings pay first, then the reservation is created — so an
   * abandoned checkout never leaves a table blocked.
   */
  async function handleAdvanceSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPayError("");

    const fd = new FormData(e.currentTarget);
    const request = {
      customerName: String(fd.get("customerName") ?? ""),
      customerPhone: String(fd.get("customerPhone") ?? ""),
      partySize,
      startISO: slot!.startISO,
      tableId: tableId ?? undefined,
    };

    setPaying(true);
    try {
      const order = await startAdvanceBooking(request);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Table reservation",
        description: `Advance for ${slot!.label}`,
        prefill: { name: request.customerName, contact: request.customerPhone },
        handler: async (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const result = await confirmAdvanceBooking(request, {
            razorpayOrderId: res.razorpay_order_id,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpaySignature: res.razorpay_signature,
          });
          if (result.error) setPayError(result.error);
          else setPaidResult(result);
        },
        theme: { color: "#b0632b" },
      });
      rzp.open();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Couldn't start the payment.");
    } finally {
      setPaying(false);
    }
  }

  // Availability depends on both the date and the party size (a 2-seater can't
  // take a party of 6), so refetch whenever either changes.
  useEffect(() => {
    startTransition(async () => {
      const fresh = await getAvailability(date, partySize);
      setData(fresh);
      setSlot(null);
      setTableId(null);
    });
  }, [date, partySize]);

  const showLayout = data.settings.showLayoutToCustomers;
  const confirmed = paidResult?.success ? paidResult : state.success ? state : null;

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card glow-pink flex flex-col items-center gap-3 rounded-3xl p-10 text-center"
      >
        <PartyPopper className="text-pink" size={44} />
        <h3 className="font-heading text-2xl font-bold">
          Table {confirmed.tableNumber} is booked!
        </h3>
        <p className="text-ink-dim">
          {confirmed.startLabel} · held for {data.settings.reservationHoldMinutes} minutes
        </p>
        {paidResult?.success && data.settings.advanceAmount > 0 && (
          <p className="rounded-full bg-lime/15 px-4 py-1.5 text-xs font-semibold text-lime">
            Advance of ₹{data.settings.advanceAmount.toFixed(2)} paid
          </p>
        )}
        <p className="mt-1 text-sm text-ink-dim">
          Show up and scan the QR on your table to start ordering.
        </p>
      </motion.div>
    );
  }

  const availableForSlot: GridTable[] = data.tables.map((t) => ({
    ...t,
    status: slot
      ? slot.availableTableIds.includes(t.id)
        ? ("AVAILABLE" as const)
        : ("RESERVED" as const)
      : ("AVAILABLE" as const),
  }));

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Step 1 — date & party size */}
      <div className="glass-card rounded-3xl p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-dim" htmlFor="date">
              <CalendarDays size={14} /> Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-dim" htmlFor="party">
              Guests
            </label>
            <input
              id="party"
              type="number"
              min={1}
              max={30}
              value={partySize}
              onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
              className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-4 flex items-start gap-2 rounded-xl bg-black/[0.03] px-4 py-3 text-xs text-ink-dim">
          <Info size={14} className="mt-0.5 shrink-0 text-pink" />
          Bookings open {data.settings.bookingLeadMinutes} minutes from now, in{" "}
          {data.tables.length > 0 ? "15" : "15"}-minute slots.
        </p>
      </div>

      {/* Step 2 — time slot */}
      <div className="glass-card rounded-3xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-heading font-bold">
          <Clock size={16} className="text-pink" /> Pick a time
        </h3>

        {loading ? (
          <p className="text-sm text-ink-dim">Checking availability…</p>
        ) : data.slots.length === 0 ? (
          <p className="text-sm text-ink-dim">
            No slots left today — try tomorrow.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.slots.map((s) => {
              const full = s.availableTableIds.length === 0;
              return (
                <button
                  key={s.startISO}
                  type="button"
                  disabled={full}
                  onClick={() => {
                    setSlot(s);
                    setTableId(null);
                  }}
                  className={clsx(
                    "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    full && "cursor-not-allowed bg-black/[0.03] text-ink-dim/40 line-through",
                    !full && slot?.startISO === s.startISO && "gradient-btn",
                    !full &&
                      slot?.startISO !== s.startISO &&
                      "border border-black/10 text-ink-dim hover:border-pink hover:text-ink",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 3 — table (only when the admin exposes the floor plan) */}
      {slot && showLayout && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="mb-4 font-heading font-bold">Choose your table</h3>
          <FloorPlanGrid
            rows={data.settings.gridRows}
            cols={data.settings.gridCols}
            tables={availableForSlot}
            selectedId={tableId}
            onSelect={(t) => setTableId(t.id)}
          />
        </div>
      )}

      {/* Step 4 — details */}
      {slot && (showLayout ? tableId : true) && (
        <div className="glass-card glow-pink rounded-3xl p-6">
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

          <h3 className="font-heading font-bold">
            {tableId
              ? `Table ${data.tables.find((t) => t.id === tableId)?.number} · ${slot.label}`
              : `${slot.label} · we'll assign the best free table`}
          </h3>

          {data.settings.advanceRequired && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-orange/10 px-4 py-3 text-xs text-orange">
              <CreditCard size={14} className="mt-0.5 shrink-0" />
              This booking needs an advance of ₹{data.settings.advanceAmount.toFixed(2)}, paid
              now to hold your table. It&apos;s adjusted against your final bill.
            </p>
          )}

          <form
            action={data.settings.advanceRequired ? undefined : formAction}
            onSubmit={data.settings.advanceRequired ? handleAdvanceSubmit : undefined}
            className="mt-4 flex flex-col gap-4"
          >
            <input type="hidden" name="startISO" value={slot.startISO} />
            <input type="hidden" name="partySize" value={partySize} />
            {tableId && <input type="hidden" name="tableId" value={tableId} />}

            <input
              name="customerName"
              placeholder="Your name"
              required
              minLength={2}
              className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
            />
            <div>
              <input
                name="customerPhone"
                type="tel"
                inputMode="tel"
                placeholder="Mobile number"
                required
                minLength={7}
                className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-ink-dim">
                Required for reservations — we&apos;ll call if anything changes.
              </p>
            </div>

            {(state.error || payError) && (
              <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">
                {payError || state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending || paying}
              className="gradient-btn rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {data.settings.advanceRequired
                ? paying
                  ? "Opening payment…"
                  : `Pay ₹${data.settings.advanceAmount.toFixed(2)} & Confirm`
                : pending
                  ? "Booking…"
                  : "Confirm Booking"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
