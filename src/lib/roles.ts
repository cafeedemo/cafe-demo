export type StaffRole = "MANAGER" | "WAITER" | "CHEF";

export const ROLES: { value: StaffRole; label: string; blurb: string }[] = [
  { value: "MANAGER", label: "Manager", blurb: "Everything — setup, menu, money" },
  { value: "WAITER", label: "Waiter", blurb: "Floor, bookings, taking orders" },
  { value: "CHEF", label: "Chef", blurb: "The kitchen queue" },
];

/**
 * Which admin sections each role sees. This is a *view filter* to keep each
 * job focused — every signed-in staff member still has full access, so the
 * fields can be tightened per role later without reworking auth.
 */
export const ROLE_SECTIONS: Record<StaffRole, string[]> = {
  MANAGER: ["overview", "floor", "orders", "reservations", "menu", "media", "setup"],
  WAITER: ["overview", "floor", "orders", "reservations", "menu"],
  CHEF: ["overview", "orders", "menu"],
};

export function canSee(role: StaffRole, section: string): boolean {
  return ROLE_SECTIONS[role].includes(section);
}
