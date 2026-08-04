"use client";

import { useEffect, useState } from "react";
import { Search, Receipt } from "lucide-react";
import { lookupOrdersByPhone } from "@/lib/actions/orders";

type OrderDto = {
  id: string;
  total: string;
  status: string;
  paymentStatus: string;
  tableLabel: string | null;
  createdAt: string;
  items: { name: string; qty: number; price: string }[];
};

export function OrdersLookup({ initialPhone }: { initialPhone?: string }) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(p: string) {
    if (!p.trim()) return;
    setLoading(true);
    try {
      setOrders(await lookupOrdersByPhone(p));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialPhone) search(initialPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPhone]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(phone);
        }}
        className="glass-card flex gap-3 rounded-2xl p-4"
      >
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="Mobile number"
          className="min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
        <button type="submit" disabled={loading} className="gradient-btn flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
          <Search size={16} /> {loading ? "..." : "Find"}
        </button>
      </form>

      {orders && (
        <div className="mt-8 flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="glass-card flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
              <Receipt className="text-ink-dim" size={28} />
              <p className="text-ink-dim">No orders found for this number.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <p className="font-heading font-bold">
                    {o.tableLabel ? `Table ${o.tableLabel}` : "Takeaway"}
                  </p>
                  <span className="rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim">
                    {o.status}
                  </span>
                </div>
                <p className="text-xs text-ink-dim">{new Date(o.createdAt).toLocaleString()}</p>
                <div className="mt-3 flex flex-col divide-y divide-black/10 text-sm">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1.5">
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>₹{(Number(item.price) * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-sm font-semibold">
                  <span>Total ₹{o.total}</span>
                  <span className={o.paymentStatus === "PAID" ? "text-lime" : "text-orange"}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
