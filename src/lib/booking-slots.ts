export type SlotSettings = {
  slotIntervalMinutes: number;
  bookingLeadMinutes: number;
  reservationHoldMinutes: number;
  serviceOpenHour: number;
  serviceCloseHour: number;
};

/**
 * Build the bookable slots for a given day.
 *
 * Two admin-controlled rules apply:
 *  - `bookingLeadMinutes` — nothing sooner than now + lead (so the kitchen and
 *    floor have notice). At 6:00 PM with a 30 min lead, 6:30 PM is the earliest.
 *  - `reservationHoldMinutes` — how long a table is held once booked, which
 *    determines whether a later slot collides with an existing reservation.
 */
export function buildSlots(dateISO: string, settings: SlotSettings, now = new Date()): Date[] {
  const { slotIntervalMinutes, bookingLeadMinutes, serviceOpenHour, serviceCloseHour } = settings;

  const [y, m, d] = dateISO.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d, serviceOpenHour, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d, serviceCloseHour, 0, 0, 0);

  const earliest = new Date(now.getTime() + bookingLeadMinutes * 60000);

  const slots: Date[] = [];
  for (let t = dayStart.getTime(); t < dayEnd.getTime(); t += slotIntervalMinutes * 60000) {
    const slot = new Date(t);
    if (slot >= earliest) slots.push(slot);
  }
  return slots;
}

/** Two windows collide when each starts before the other ends. */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function slotEnd(start: Date, reservationHoldMinutes: number): Date {
  return new Date(start.getTime() + reservationHoldMinutes * 60000);
}

export function formatSlot(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function toDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Anonymous customers still need a stable key; they just don't get rewards. */
export function generateAnonymousPhone(): string {
  return `ANON-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function isAnonymousPhone(phone: string): boolean {
  return phone.startsWith("ANON-");
}
