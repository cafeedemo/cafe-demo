"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, QrCode, Hand, CheckCircle2, StickyNote, Receipt } from "lucide-react";
import { startOrJoinSession, placeOrder } from "@/lib/actions/sessions";

type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
};

type TableDto = { id: string; number: number; seats: number };

type Line = { qty: number; notes: string };

const CATEGORIES = [
  "ALL",
  "SOUP",
  "STARTERS",
  "CONTINENTAL",
  "CHINESE",
  "INDIAN_MAIN",
  "BREADS_RICE",
  "BEVERAGES",
  "SALADS",
  "DESSERTS",
  "SPECIALS",
];
const LABELS: Record<string, string> = {
  ALL: "All",
  SOUP: "Soups",
  STARTERS: "Starters",
  CONTINENTAL: "Continental & Pasta",
  CHINESE: "Chinese & Noodles",
  INDIAN_MAIN: "Indian Main Course",
  BREADS_RICE: "Breads & Biryani",
  BEVERAGES: "Beverages",
  SALADS: "Salads",
  DESSERTS: "Desserts",
  SPECIALS: "Specials",
};

/**
 * Both entry points land here:
 *  - `scannedTable` set  → guest scanned the QR fixed to their table
 *  - `scannedTable` null → guest (or a waiter) picks the table number by hand
 */
export function OrderFlow({
  menuItems,
  tables,
  scannedTable,
  knownName,
  asWaiter = false,
}: {
  menuItems: MenuItemDto[];
  tables: TableDto[];
  scannedTable?: TableDto | null;
  /** Name remembered from a previous visit's cookie, if any. */
  knownName?: string | null;
  asWaiter?: boolean;
}) {
  const [tableId, setTableId] = useState(scannedTable?.id ?? "");
  const [name, setName] = useState(knownName ?? "");
  const [identified, setIdentified] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [lines, setLines] = useState<Record<string, Line>>({});
  const [category, setCategory] = useState("ALL");
  const [orderNote, setOrderNote] = useState("");
  const [openNoteFor, setOpenNoteFor] = useState<string | null>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const total = useMemo(
    () =>
      menuItems.reduce(
        (sum, m) => sum + (lines[m.id]?.qty ?? 0) * Number(m.price),
        0,
      ),
    [menuItems, lines],
  );

  const filtered = category === "ALL" ? menuItems : menuItems.filter((m) => m.category === category);
  const selectedTable = tables.find((t) => t.id === tableId) ?? scannedTable ?? null;

  function bump(id: string, delta: number) {
    setLines((prev) => {
      const current = prev[id] ?? { qty: 0, notes: "" };
      const qty = Math.max(0, current.qty + delta);
      return { ...prev, [id]: { ...current, qty } };
    });
  }

  function setNotes(id: string, notes: string) {
    setLines((prev) => ({ ...prev, [id]: { qty: prev[id]?.qty ?? 1, notes } }));
  }

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!tableId) return setError("Please pick your table number.");
    if (name.trim().length < 2) return setError("Please enter your name.");

    setPending(true);
    try {
      const id = await startOrJoinSession({
        tableId,
        customerName: name.trim(),
        channel: asWaiter ? "WAITER" : scannedTable ? "QR" : "MANUAL",
      });
      setSessionId(id);
      setIdentified(true);
    } catch {
      setError("Couldn't open a tab for that table. Please ask a server.");
    } finally {
      setPending(false);
    }
  }

  async function handlePlaceOrder() {
    setError("");
    const items = Object.entries(lines)
      .filter(([, l]) => l.qty > 0)
      .map(([menuItemId, l]) => ({
        menuItemId,
        qty: l.qty,
        notes: l.notes.trim() || undefined,
      }));

    if (items.length === 0) return setError("Add at least one dish.");

    setPending(true);
    try {
      const orderId = await placeOrder({
        sessionId: sessionId!,
        placedBy: asWaiter ? "WAITER" : "CUSTOMER",
        note: orderNote.trim() || undefined,
        items,
      });
      setPlacedOrderId(orderId);
      setLines({});
      setOrderNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  // ---- Step 1: who & where ----
  if (!identified) {
    return (
      <form onSubmit={handleIdentify} className="glass-card glow-pink flex flex-col gap-5 rounded-3xl p-6">
        <div className="flex items-center gap-2 rounded-xl bg-black/[0.03] px-4 py-3 text-sm">
          {scannedTable ? (
            <>
              <QrCode size={16} className="text-pink" />
              <span>
                Scanned <strong>Table {scannedTable.number}</strong>
              </span>
            </>
          ) : (
            <>
              <Hand size={16} className="text-pink" />
              <span>Ordering manually — pick your table</span>
            </>
          )}
        </div>

        {!scannedTable && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-dim" htmlFor="tableId">
              Table number
            </label>
            <select
              id="tableId"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
            >
              <option value="">Select your table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.number} ({t.seats} seats)
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-ink-dim">
            {knownName
              ? "Welcome back — we remembered you, so there's nothing else to fill in."
              : "That's all we need. No sign-up, no phone number — we'll remember you on this device."}
          </p>
        </div>

        {error && <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="gradient-btn rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Opening tab…" : "Start Ordering"}
        </button>
      </form>
    );
  }

  // ---- Step 2: order (repeatable within the same session) ----
  return (
    <div className="flex flex-col gap-5">
      <div className="glass-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm">
        <span>
          <strong>Table {selectedTable?.number}</strong> · {name}
        </span>
        <Link
          href={`/bill/${sessionId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-pink hover:underline"
        >
          <Receipt size={14} /> View bill
        </Link>
      </div>

      <AnimatePresence>
        {placedOrderId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card flex items-center gap-3 rounded-2xl border-2 border-lime p-4"
          >
            <CheckCircle2 className="shrink-0 text-lime" size={20} />
            <div className="text-sm">
              <p className="font-semibold">Order sent to the kitchen!</p>
              <p className="text-xs text-ink-dim">
                Order ID <span className="font-mono">{placedOrderId.slice(-6).toUpperCase()}</span> ·
                add more anytime, we&apos;ll bill it all together.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={clsx(
              "rounded-full px-4 py-1.5 text-xs font-semibold",
              category === c ? "gradient-btn" : "border border-black/10 text-ink-dim hover:text-ink",
            )}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((m) => {
          const line = lines[m.id];
          return (
            <div key={m.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-4">
                {m.imageUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <Image src={m.imageUrl} alt={m.name} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-bold">{m.name}</p>
                  {m.description && (
                    <p className="truncate text-xs text-ink-dim">{m.description}</p>
                  )}
                  <p className="mt-0.5 text-sm font-semibold text-pink">₹{m.price}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => bump(m.id, -1)}
                    className="rounded-full border border-black/10 p-1.5 hover:border-pink"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{line?.qty ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => bump(m.id, 1)}
                    className="rounded-full border border-black/10 p-1.5 hover:border-pink"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {(line?.qty ?? 0) > 0 && (
                <div className="mt-3">
                  {openNoteFor === m.id || line?.notes ? (
                    <input
                      value={line?.notes ?? ""}
                      onChange={(e) => setNotes(m.id, e.target.value)}
                      placeholder="Customise — e.g. less spicy, no onions"
                      className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-xs focus:border-pink focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenNoteFor(m.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-ink-dim hover:text-pink"
                    >
                      <StickyNote size={12} /> Add a note
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <input
        value={orderNote}
        onChange={(e) => setOrderNote(e.target.value)}
        placeholder="Anything for the whole order? (optional)"
        className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
      />

      <div className="glass-card sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl p-4">
        <div>
          <p className="text-xs text-ink-dim">This order</p>
          <p className="font-heading text-xl font-bold text-pink">₹{total.toFixed(2)}</p>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={pending || total === 0}
          className="gradient-btn rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send to Kitchen"}
        </button>
      </div>

      {error && <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>}
    </div>
  );
}
