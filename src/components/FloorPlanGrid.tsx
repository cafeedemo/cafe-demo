"use client";

import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS, type TableStatus } from "@/lib/table-status";

export type GridTable = {
  id: string;
  number: number;
  seats: number;
  shape: string;
  gridRow: number;
  gridCol: number;
  status?: TableStatus;
};

export function FloorPlanGrid({
  rows,
  cols,
  tables,
  selectedId,
  onSelect,
  onEmptyCellClick,
  showLegend = true,
}: {
  rows: number;
  cols: number;
  tables: GridTable[];
  selectedId?: string | null;
  onSelect?: (table: GridTable) => void;
  onEmptyCellClick?: (row: number, col: number) => void;
  showLegend?: boolean;
}) {
  const cells = Array.from({ length: rows * cols }, (_, i) => ({
    row: Math.floor(i / cols) + 1,
    col: (i % cols) + 1,
  }));

  return (
    <div>
      <div
        className="glass-card grid gap-2 rounded-3xl bg-black/[0.02] p-3 sm:gap-3 sm:p-5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map(({ row, col }) => {
          const table = tables.find((t) => t.gridRow === row && t.gridCol === col);

          if (!table) {
            return (
              <button
                key={`${row}-${col}`}
                type="button"
                disabled={!onEmptyCellClick}
                onClick={() => onEmptyCellClick?.(row, col)}
                className={clsx(
                  "aspect-square rounded-xl border border-dashed border-black/10 transition-colors",
                  onEmptyCellClick
                    ? "cursor-pointer hover:border-pink hover:bg-pink/5"
                    : "cursor-default",
                )}
                aria-label={onEmptyCellClick ? `Add table at row ${row}, column ${col}` : undefined}
              />
            );
          }

          const status = table.status ?? "AVAILABLE";
          const selectable = Boolean(onSelect) && status === "AVAILABLE";
          const isSelected = selectedId === table.id;

          return (
            <motion.button
              key={table.id}
              type="button"
              whileHover={selectable ? { scale: 1.05 } : undefined}
              whileTap={selectable ? { scale: 0.97 } : undefined}
              disabled={!onSelect || !selectable}
              onClick={() => onSelect?.(table)}
              className={clsx(
                "flex aspect-square flex-col items-center justify-center gap-0.5 border-2 text-xs font-semibold transition-shadow disabled:cursor-default",
                table.shape === "ROUND" ? "rounded-full" : "rounded-xl",
                STATUS_COLORS[status],
                selectable && "cursor-pointer",
                isSelected && "ring-2 ring-pink ring-offset-2 ring-offset-base",
              )}
              title={`Table ${table.number} · ${table.seats} seats · ${STATUS_LABELS[status]}`}
            >
              <span className="font-heading text-sm font-bold sm:text-base">{table.number}</span>
              <span className="flex items-center gap-0.5 text-[10px] opacity-70">
                <Users size={9} /> {table.seats}
              </span>
            </motion.button>
          );
        })}
      </div>

      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-dim">
          {(["AVAILABLE", "RESERVED", "OCCUPIED", "WRAPPING_UP"] as TableStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={clsx("h-3 w-3 rounded-full border", STATUS_COLORS[s])} />
              {STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
