import type { StaffRole } from "./roles";
import { ROLES } from "./roles";

const STORAGE_KEY = "cafe-admin-role";
const DEFAULT_ROLE: StaffRole = "MANAGER";

let cached: StaffRole | null = null;
const listeners = new Set<() => void>();

/**
 * localStorage-backed store for the admin's chosen role view, read through
 * useSyncExternalStore so the server and client agree on the first render.
 */
export function subscribeRole(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getRoleSnapshot(): StaffRole {
  if (cached === null) {
    const saved = localStorage.getItem(STORAGE_KEY) as StaffRole | null;
    cached = saved && ROLES.some((r) => r.value === saved) ? saved : DEFAULT_ROLE;
  }
  return cached;
}

export function getRoleServerSnapshot(): StaffRole {
  return DEFAULT_ROLE;
}

export function setRole(role: StaffRole) {
  cached = role;
  localStorage.setItem(STORAGE_KEY, role);
  listeners.forEach((l) => l());
}
