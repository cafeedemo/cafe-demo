"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Users, Trash2, Circle, Square, EyeOff, Eye } from "lucide-react";
import { placeTable, updateTable, removeTable } from "@/lib/actions/tables";

type TableDto = {
  id: string;
  number: number;
  seats: number;
  shape: string;
  gridRow: number;
  gridCol: number;
  isActive: boolean;
};

export function TableLayoutBuilder({
  tables,
  gridRows,
  gridCols,
}: {
  tables: TableDto[];
  gridRows: number;
  gridCols: number;
}) {
  const [seats, setSeats] = useState(4);
  const [shape, setShape] = useState<"SQUARE" | "ROUND">("SQUARE");
  const [selected, setSelected] = useState<TableDto | null>(null);
  const [error, setError] = useState("");

  const cells = Array.from({ length: gridRows * gridCols }, (_, i) => ({
    row: Math.floor(i / gridCols) + 1,
    col: (i % gridCols) + 1,
  }));

  async function handleEmptyCell(row: number, col: number) {
    setError("");
    try {
      await placeTable({ gridRow: row, gridCol: col, seats, shape });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that table");
    }
  }

  async function handleRemove(id: string) {
    setError("");
    try {
      await removeTable(id);
      setSelected(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't remove that table");
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="glass-card mb-4 flex flex-wrap items-end gap-4 rounded-2xl p-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-dim">Seats</label>
            <input
              type="number"
              min={1}
              max={30}
              value={seats}
              onChange={(e) => setSeats(Math.max(1, Number(e.target.value)))}
              className="w-20 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-ink-dim">Shape</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShape("SQUARE")}
                className={clsx(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                  shape === "SQUARE" ? "gradient-btn" : "border border-black/10 text-ink-dim",
                )}
              >
                <Square size={12} /> Square
              </button>
              <button
                onClick={() => setShape("ROUND")}
                className={clsx(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                  shape === "ROUND" ? "gradient-btn" : "border border-black/10 text-ink-dim",
                )}
              >
                <Circle size={12} /> Round
              </button>
            </div>
          </div>
          <p className="flex-1 text-xs text-ink-dim">
            Click any empty square to drop a {seats}-seat {shape.toLowerCase()} table there.
            Grid size is set under Rules &amp; Features.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>
        )}

        <div
          className="glass-card grid gap-2 rounded-3xl bg-black/[0.02] p-4"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
        >
          {cells.map(({ row, col }) => {
            const table = tables.find((t) => t.gridRow === row && t.gridCol === col);

            if (!table) {
              return (
                <button
                  key={`${row}-${col}`}
                  onClick={() => handleEmptyCell(row, col)}
                  className="aspect-square rounded-xl border border-dashed border-black/15 text-[10px] text-ink-dim/40 transition-colors hover:border-pink hover:bg-pink/5 hover:text-pink"
                  title={`Add a table at row ${row}, column ${col}`}
                >
                  +
                </button>
              );
            }

            return (
              <button
                key={table.id}
                onClick={() => setSelected(table)}
                className={clsx(
                  "flex aspect-square flex-col items-center justify-center gap-0.5 border-2 text-xs font-semibold transition-all",
                  table.shape === "ROUND" ? "rounded-full" : "rounded-xl",
                  table.isActive
                    ? "border-purple bg-purple/15"
                    : "border-black/15 bg-black/[0.04] opacity-50",
                  selected?.id === table.id && "ring-2 ring-pink ring-offset-2 ring-offset-base",
                )}
              >
                <span className="font-heading text-sm font-bold">{table.number}</span>
                <span className="flex items-center gap-0.5 text-[10px] opacity-70">
                  <Users size={9} /> {table.seats}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:w-72">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-heading font-bold">
            {selected ? `Table ${selected.number}` : "Table details"}
          </h3>

          {!selected ? (
            <p className="mt-2 text-sm text-ink-dim">
              Pick a table on the grid to change its seats, shape, or remove it.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-dim">Seats</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  defaultValue={selected.seats}
                  onBlur={(e) => updateTable(selected.id, { seats: Number(e.target.value) })}
                  className="rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => updateTable(selected.id, { shape: "SQUARE" })}
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                    selected.shape === "SQUARE" ? "gradient-btn" : "border border-black/10 text-ink-dim",
                  )}
                >
                  <Square size={12} /> Square
                </button>
                <button
                  onClick={() => updateTable(selected.id, { shape: "ROUND" })}
                  className={clsx(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold",
                    selected.shape === "ROUND" ? "gradient-btn" : "border border-black/10 text-ink-dim",
                  )}
                >
                  <Circle size={12} /> Round
                </button>
              </div>

              <button
                onClick={() => updateTable(selected.id, { isActive: !selected.isActive })}
                className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-ink-dim hover:text-ink"
              >
                {selected.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                {selected.isActive ? "Take out of service" : "Put back in service"}
              </button>

              <button
                onClick={() => handleRemove(selected.id)}
                className="flex items-center justify-center gap-2 rounded-xl bg-pink/10 px-3 py-2 text-xs font-semibold text-pink hover:bg-pink/20"
              >
                <Trash2 size={12} /> Remove table
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
