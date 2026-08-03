"use client";

import { useActionState } from "react";
import { PartyPopper } from "lucide-react";
import { createReservation, type ReservationState } from "./actions";

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

const initialState: ReservationState = {};

export function ReservationForm() {
  const [state, formAction, pending] = useActionState(createReservation, initialState);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <PartyPopper className="text-lime" size={40} />
        <h3 className="font-heading text-2xl font-bold">You&apos;re booked!</h3>
        <p className="text-ink-dim">
          We&apos;ve got your table request — we&apos;ll confirm by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="Jane Doe" required />
        <Field label="Email" name="email" type="email" placeholder="jane@example.com" required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" placeholder="+1 555 000 0000" required />
        <Field label="Party size" name="partySize" type="number" min={1} max={20} defaultValue={2} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" name="date" type="date" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-dim" htmlFor="timeSlot">
            Time
          </label>
          <select
            id="timeSlot"
            name="timeSlot"
            required
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink focus:border-pink focus:outline-none"
          >
            <option value="">Select a time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink-dim" htmlFor="notes">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Birthday, allergies, seating preference..."
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink focus:border-pink focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="gradient-btn mt-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60">
        {pending ? "Booking..." : "Confirm Reservation"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: string | number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-dim" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        {...rest}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink placeholder:text-ink-dim/50 focus:border-pink focus:outline-none"
      />
    </div>
  );
}
