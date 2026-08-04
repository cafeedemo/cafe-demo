"use client";

import { clsx } from "clsx";
import { updateOrderStatus, confirmCounterPaymentReceived } from "@/lib/actions/orders";

type OrderDto = {
  id: string;
  customerName: string;
  customerPhone: string;
  tableId: string | null;
  tableLabel: string | null;
  total: string;
  status: string;
  paymentStatus: string;
  paymentMode: string | null;
  createdAt: string;
  items: { name: string; qty: number; price: string }[];
};

const STATUS_OPTIONS = ["PLACED", "PREPARING", "SERVED", "CANCELLED"];

export function OrdersManager({ orders }: { orders: OrderDto[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-ink-dim">No orders yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((o) => (
        <div key={o.id} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold">
              {o.tableLabel ? `Table ${o.tableLabel}` : "Takeaway"}
            </h3>
            <span
              className={clsx(
                "rounded-full px-3 py-1 text-xs",
                o.paymentStatus === "PAID" ? "bg-lime/10 text-lime" : "bg-orange/10 text-orange",
              )}
            >
              {o.paymentStatus}
            </span>
          </div>
          <p className="text-sm text-ink-dim">
            {o.customerName} · {o.customerPhone}
          </p>
          <p className="text-xs text-ink-dim">{new Date(o.createdAt).toLocaleString()}</p>

          <div className="mt-3 flex flex-col divide-y divide-black/10 text-sm">
            {o.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>₹{(Number(item.price) * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2 text-sm font-semibold">
            <span>Total ₹{o.total}</span>
            {o.paymentMode && <span className="text-ink-dim">{o.paymentMode}</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              defaultValue={o.status}
              onChange={(e) => updateOrderStatus(o.id, e.target.value as "PLACED" | "PREPARING" | "SERVED" | "CANCELLED")}
              className="rounded-lg border border-black/10 bg-black/[0.03] px-2 py-1 text-xs"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {o.paymentStatus === "PENDING" && o.tableId && (
              <button
                onClick={() => confirmCounterPaymentReceived(o.tableId!)}
                className="rounded-full bg-lime/10 px-3 py-1 text-xs font-semibold text-lime hover:bg-lime/20"
              >
                Confirm payment received
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
