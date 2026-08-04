"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, IndianRupee, Receipt, UserPlus, BadgeCheck } from "lucide-react";
import { FloorPlanGrid, type GridTable } from "@/components/FloorPlanGrid";
import { collectPayment } from "@/lib/actions/sessions";

type SessionDto = {
  id: string;
  tableId: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string | null;
  isAnonymous: boolean;
  status: string;
  paymentMode: string | null;
  openedAt: string;
  orderCount: number;
  total: number;
};

export function FloorView({
  gridRows,
  gridCols,
  tables,
  sessions,
}: {
  gridRows: number;
  gridCols: number;
  tables: GridTable[];
  sessions: SessionDto[];
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);

  // Keep the "seated for N min" counters honest without a manual refresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  async function handleCollect(sessionId: string) {
    setBusy(sessionId);
    try {
      await collectPayment(sessionId);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <FloorPlanGrid rows={gridRows} cols={gridCols} tables={tables} />

      <div>
        <h2 className="mb-4 font-heading text-xl font-bold">
          Open tabs{" "}
          <span className="text-sm font-normal text-ink-dim">({sessions.length})</span>
        </h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-ink-dim">
            Nobody seated right now. Tabs open when a guest scans a table QR or a waiter
            starts an order.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => {
              const minutes = Math.max(
                0,
                Math.floor((now - new Date(s.openedAt).getTime()) / 60000),
              );
              return (
                <div key={s.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-heading text-lg font-bold">Table {s.tableNumber}</h3>
                      <p className="text-sm text-ink-dim">
                        {s.customerName}
                        {s.customerPhone && ` · ${s.customerPhone}`}
                      </p>
                      {!s.customerPhone && (
                        <span className="mt-1 inline-block rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] text-ink-dim">
                          walk-in
                        </span>
                      )}
                    </div>
                    {s.status === "BILLED" && (
                      <span className="rounded-full bg-orange/15 px-2 py-1 text-[10px] font-semibold text-orange">
                        asked for bill
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-dim">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Receipt size={12} /> {s.orderCount} round
                      {s.orderCount === 1 ? "" : "s"}
                    </span>
                    {s.paymentMode && (
                      <span className="flex items-center gap-1">
                        <BadgeCheck size={12} /> {s.paymentMode}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 flex items-center gap-1 font-heading text-2xl font-bold text-pink">
                    <IndianRupee size={18} />
                    {s.total.toFixed(2)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCollect(s.id)}
                      disabled={busy === s.id}
                      className="gradient-btn rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-60"
                    >
                      {busy === s.id ? "Closing…" : "Collect payment & free table"}
                    </button>
                    <Link
                      href={`/bill/${s.id}`}
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-ink-dim hover:border-pink hover:text-ink"
                    >
                      View bill
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card flex flex-wrap items-center gap-3 rounded-2xl p-5 text-sm text-ink-dim">
        <UserPlus size={16} className="text-pink" />
        Taking an order at the table yourself?
        <Link href="/order" className="font-semibold text-pink hover:underline">
          Open the order pad →
        </Link>
      </div>
    </div>
  );
}
