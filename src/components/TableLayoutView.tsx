"use client";

import { clsx } from "clsx";
import { Users } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS, type TableStatus } from "@/lib/table-status";

export type LayoutTable = {
  id: string;
  label: string;
  seats: number;
  shape: string;
  x: number;
  y: number;
  status: TableStatus;
};

export function TableLayoutView({
  tables,
  onTableClick,
}: {
  tables: LayoutTable[];
  onTableClick?: (table: LayoutTable) => void;
}) {
  return (
    <div className="glass-card relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-black/[0.02] p-4">
      {tables.map((t) => (
        <button
          key={t.id}
          type="button"
          disabled={!onTableClick || t.status !== "AVAILABLE"}
          onClick={() => onTableClick?.(t)}
          style={{ left: `${t.x}%`, top: `${t.y}%` }}
          className={clsx(
            "absolute flex h-20 w-20 flex-col items-center justify-center gap-0.5 border-2 text-xs font-semibold shadow-sm transition-transform disabled:cursor-default",
            t.shape === "round" ? "rounded-full" : "rounded-xl",
            STATUS_COLORS[t.status],
            onTableClick && t.status === "AVAILABLE" && "cursor-pointer hover:scale-105",
          )}
        >
          <span className="font-heading text-sm font-bold">{t.label}</span>
          <span className="flex items-center gap-0.5 text-[10px]">
            <Users size={10} /> {t.seats}
          </span>
        </button>
      ))}

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 text-[10px] text-ink-dim">
        {(["AVAILABLE", "BOOKED", "SEATED", "WRAPPING_UP"] as TableStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={clsx("h-2.5 w-2.5 rounded-full border", STATUS_COLORS[s])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>
    </div>
  );
}
