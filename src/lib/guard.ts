import { auth } from "@/auth";

export async function requireStaff() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "SUPERADMIN") {
    throw new Error("Not authorized");
  }
  return session!;
}

export async function requireSuperadmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    throw new Error("Not authorized");
  }
  return session;
}
