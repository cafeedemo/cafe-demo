"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, X } from "lucide-react";
import { TableLayoutView, type LayoutTable } from "@/components/TableLayoutView";
import { createBooking, type BookingState } from "@/lib/actions/bookings";

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

const initialState: BookingState = {};

export function BookingView({ tables }: { tables: LayoutTable[] }) {
  const [selected, setSelected] = useState<LayoutTable | null>(null);
  const [state, formAction, pending] = useActionState(createBooking, initialState);

  return (
    <div>
      <TableLayoutView tables={tables} onTableClick={setSelected} />

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-md rounded-3xl bg-base p-6"
            >
              {state.success ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <PartyPopper className="text-pink" size={40} />
                  <h3 className="font-heading text-2xl font-bold">Table {selected.label} is yours!</h3>
                  <p className="text-ink-dim">We&apos;ll have it ready for you.</p>
                  <button
                    onClick={() => setSelected(null)}
                    className="gradient-btn mt-2 rounded-full px-6 py-2.5 text-sm"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold">
                      Book Table {selected.label} ({selected.seats} seats)
                    </h3>
                    <button onClick={() => setSelected(null)} className="text-ink-dim hover:text-ink">
                      <X size={20} />
                    </button>
                  </div>
                  <form action={formAction} className="flex flex-col gap-4">
                    <input type="hidden" name="tableId" value={selected.id} />
                    <input
                      name="customerName"
                      placeholder="Your name"
                      required
                      className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
                    />
                    <input
                      name="customerPhone"
                      type="tel"
                      placeholder="Mobile number"
                      required
                      className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="partySize"
                        type="number"
                        min={1}
                        max={selected.seats}
                        defaultValue={2}
                        required
                        className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
                      />
                      <select
                        name="timeSlot"
                        required
                        className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
                        onChange={(e) => {
                          const form = e.currentTarget.closest("form");
                          const hidden = form?.querySelector<HTMLInputElement>('input[name="bookedFor"]');
                          if (hidden) {
                            const today = new Date().toISOString().split("T")[0];
                            hidden.value = `${today}T${to24h(e.target.value)}`;
                          }
                        }}
                      >
                        <option value="">Time</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input type="hidden" name="bookedFor" />

                    {state.error && (
                      <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{state.error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={pending}
                      className="gradient-btn rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
                    >
                      {pending ? "Booking..." : "Confirm Booking"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function to24h(label: string) {
  const [time, meridiem] = label.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let h = hours % 12;
  if (meridiem === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
