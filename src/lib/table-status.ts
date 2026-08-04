export type TableStatus = "AVAILABLE" | "BOOKED" | "SEATED" | "WRAPPING_UP";

const WRAP_UP_MINUTES = 40;

export function computeTableStatus(activeBooking: {
  status: string;
  seatedAt: Date | null;
} | null): TableStatus {
  if (!activeBooking) return "AVAILABLE";
  if (activeBooking.status === "BOOKED") return "BOOKED";
  if (activeBooking.status === "SEATED" && activeBooking.seatedAt) {
    const minutesElapsed = (Date.now() - activeBooking.seatedAt.getTime()) / 60000;
    return minutesElapsed >= WRAP_UP_MINUTES ? "WRAPPING_UP" : "SEATED";
  }
  return "AVAILABLE";
}

export const STATUS_COLORS: Record<TableStatus, string> = {
  AVAILABLE: "bg-lime/20 border-lime text-ink",
  BOOKED: "bg-orange/20 border-orange text-ink",
  SEATED: "bg-purple/20 border-purple text-ink",
  WRAPPING_UP: "bg-pink/20 border-pink text-ink",
};

export const STATUS_LABELS: Record<TableStatus, string> = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  SEATED: "Occupied",
  WRAPPING_UP: "Wrapping up soon",
};
