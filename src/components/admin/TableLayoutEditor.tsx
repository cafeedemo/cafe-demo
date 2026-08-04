"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Plus, Trash2, Users } from "lucide-react";
import { createTable, updateTablePosition, deleteTable } from "@/lib/actions/tables";

type TableDto = { id: string; label: string; seats: number; shape: string; x: number; y: number };

export function TableLayoutEditor({ tables }: { tables: TableDto[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);

  function handleDragEnd(id: string, x: number, y: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    updateTablePosition(id, x, y);
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="gradient-btn flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
        >
          <Plus size={16} /> Add table
        </button>
      </div>

      {showForm && (
        <form
          action={async (formData) => {
            await createTable(formData);
            setShowForm(false);
          }}
          className="glass-card mb-6 grid gap-4 rounded-2xl p-6 sm:grid-cols-4"
        >
          <input
            name="label"
            placeholder="Table label (e.g. T9)"
            required
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm sm:col-span-2"
          />
          <input
            name="seats"
            type="number"
            min={1}
            max={20}
            defaultValue={4}
            required
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm"
          />
          <select name="shape" defaultValue="square" className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm">
            <option value="square">Square</option>
            <option value="round">Round</option>
          </select>
          <button type="submit" className="gradient-btn rounded-full px-5 py-2.5 text-sm sm:col-span-4">
            Add
          </button>
        </form>
      )}

      <p className="mb-3 text-xs text-ink-dim">Drag tables to arrange your floor plan.</p>

      <div
        ref={containerRef}
        className="glass-card relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-black/[0.02] p-4"
      >
        {tables.map((t) => (
          <motion.div
            key={t.id}
            drag
            dragMomentum={false}
            dragConstraints={containerRef}
            onDragEnd={(_, info) => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const x = ((info.point.x - rect.left) / rect.width) * 100;
              const y = ((info.point.y - rect.top) / rect.height) * 100;
              handleDragEnd(t.id, x, y);
            }}
            style={{ left: `${t.x}%`, top: `${t.y}%` }}
            className={clsx(
              "group absolute flex h-20 w-20 cursor-grab flex-col items-center justify-center gap-0.5 border-2 border-purple bg-purple/15 text-xs font-semibold active:cursor-grabbing",
              t.shape === "round" ? "rounded-full" : "rounded-xl",
            )}
          >
            <span className="font-heading text-sm font-bold">{t.label}</span>
            <span className="flex items-center gap-0.5 text-[10px]">
              <Users size={10} /> {t.seats}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTable(t.id);
              }}
              className="absolute -top-2 -right-2 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Trash2 size={10} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
