import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell base="/superadmin" roleLabel="Quellflow Superadmin">
      {children}
    </AdminShell>
  );
}
