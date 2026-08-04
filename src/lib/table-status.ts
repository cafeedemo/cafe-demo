export type TableStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "WRAPPING_UP";

/** A table is flagged as "freeing up soon" once its hold is nearly spent. */
export const WRAP_UP_THRESHOLD_MINUTES = 40;

export function computeTableStatus(
  active: { status: string; startAt: Date; endAt: Date } | null,
  hasOpenSession: boolean,
  now = new Date(),
): TableStatus {
  if (hasOpenSession) {
    // Someone is physically at the table. If the hold is nearly up, surface that
    // so other guests can see a table is about to turn over.
    if (active) {
      const minutesElapsed = (now.getTime() - active.startAt.getTime()) / 60000;
      if (minutesElapsed >= WRAP_UP_THRESHOLD_MINUTES) return "WRAPPING_UP";
    }
    return "OCCUPIED";
  }
  if (active && now < active.endAt) return "RESERVED";
  return "AVAILABLE";
}

export const STATUS_COLORS: Record<TableStatus, string> = {
  AVAILABLE: "bg-lime/25 border-lime",
  RESERVED: "bg-orange/25 border-orange",
  OCCUPIED: "bg-pink/25 border-pink",
  WRAPPING_UP: "bg-purple/25 border-purple",
};

export const STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  OCCUPIED: "Occupied",
  WRAPPING_UP: "Free soon",
};
