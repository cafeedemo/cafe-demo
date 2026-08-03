import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell base="/admin" roleLabel="Cafe Admin">
      {children}
    </AdminShell>
  );
}
