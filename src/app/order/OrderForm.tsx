"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, PartyPopper } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";

type MenuItemDto = { id: string; name: string; price: string; category: string };
type TableDto = { id: string; label: string };

export function OrderForm({
  menuItems,
  tables,
  defaultTableId,
}: {
  menuItems: MenuItemDto[];
  tables: TableDto[];
  defaultTableId?: string;
}) {
  const router = useRouter();
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableId, setTableId] = useState(defaultTableId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const total = useMemo(
    () =>
      menuItems.reduce((sum, m) => sum + (qtys[m.id] ?? 0) * Number(m.price), 0),
    [menuItems, qtys],
  );

  function setQty(id: string, delta: number) {
    setQtys((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const items = Object.entries(qtys)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, qty]) => ({ menuItemId, qty }));

    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (name.trim().length < 2 || phone.trim().length < 7) {
      setError("Enter your name and a valid mobile number.");
      return;
    }

    setPending(true);
    try {
      await createOrder({ customerName: name, customerPhone: phone, tableId: tableId || undefined, items });
      setDone(true);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <PartyPopper className="text-pink" size={40} />
        <h3 className="font-heading text-2xl font-bold">Order placed!</h3>
        <p className="text-ink-dim">We&apos;re on it — track it anytime under My Orders.</p>
        <button onClick={() => router.push(`/orders?phone=${encodeURIComponent(phone)}`)} className="gradient-btn mt-2 rounded-full px-6 py-2.5 text-sm">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Mobile number"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
      </div>
      <select
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
        className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
      >
        <option value="">Takeaway / no table</option>
        {tables.map((t) => (
          <option key={t.id} value={t.id}>
            Table {t.label}
          </option>
        ))}
      </select>

      <div className="flex flex-col divide-y divide-black/10 rounded-xl border border-black/10">
        {menuItems.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{m.name}</p>
              <p className="text-xs text-ink-dim">₹{m.price}</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQty(m.id, -1)} className="rounded-full border border-black/10 p-1">
                <Minus size={14} />
              </button>
              <span className="w-4 text-center">{qtys[m.id] ?? 0}</span>
              <button type="button" onClick={() => setQty(m.id, 1)} className="rounded-full border border-black/10 p-1">
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between font-heading text-lg font-bold">
        <span>Total</span>
        <span className="text-pink">₹{total.toFixed(2)}</span>
      </div>

      {error && <p className="rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>}

      <button type="submit" disabled={pending} className="gradient-btn rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60">
        {pending ? "Placing order..." : "Place Order"}
      </button>
    </form>
  );
}
