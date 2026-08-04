import { auth } from "@/auth";

export async function requireStaff() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authorized");
  }
  return session;
}
