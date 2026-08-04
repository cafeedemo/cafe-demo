"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { clsx } from "clsx";
import { CheckCircle2, Wallet, CreditCard, Receipt, XCircle, Plus } from "lucide-react";
import { createRazorpayOrder, verifyOnlinePayment } from "@/lib/actions/payment";
import { setSessionPaymentIntent, cancelOwnOrder } from "@/lib/actions/sessions";

type OrderDto = {
  id: string;
  status: string;
  createdAt: string;
  placedBy: string;
  note: string | null;
  items: { name: string; qty: number; price: string; notes: string | null }[];
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function BillView({
  sessionId,
  tableNumber,
  customerName,
  status,
  paymentStatus,
  paymentGatewayEnabled,
  total,
  orders,
}: {
  sessionId: string;
  tableNumber: number;
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentGatewayEnabled: boolean;
  total: number;
  orders: OrderDto[];
}) {
  const [mode, setMode] = useState<"counter" | "paid" | null>(
    paymentStatus === "PAID" ? "paid" : null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleOnline() {
    setBusy(true);
    setError("");
    try {
      const order = await createRazorpayOrder(sessionId, total);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: `Table ${tableNumber}`,
        description: "Dine-in bill",
        prefill: { name: customerName },
        handler: async (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyOnlinePayment(
            sessionId,
            res.razorpay_order_id,
            res.razorpay_payment_id,
            res.razorpay_signature,
          );
          setMode("paid");
        },
        theme: { color: "#b0632b" },
      });
      rzp.open();
    } catch {
      setError("Couldn't open checkout. Please pay at the counter.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "paid") {
    return (
      <div className="glass-card glow-pink flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <CheckCircle2 className="text-lime" size={44} />
        <h3 className="font-heading text-2xl font-bold">Payment received</h3>
        <p className="text-ink-dim">Thanks for dining with us — see you again soon!</p>
      </div>
    );
  }

  if (mode === "counter") {
    return (
      <div className="glass-card glow-pink flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <Wallet className="text-orange" size={44} />
        <h3 className="font-heading text-2xl font-bold">See you at the counter</h3>
        <p className="text-ink-dim">
          Please pay <strong>₹{total.toFixed(2)}</strong> at the counter. Our team has been notified.
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <Receipt className="text-ink-dim" size={32} />
        <h3 className="font-heading text-xl font-bold">Table {tableNumber}</h3>
        <p className="text-ink-dim">Nothing ordered yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card glow-pink rounded-3xl p-6 sm:p-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold">Table {tableNumber}</h3>
          <p className="text-sm text-ink-dim">{customerName}</p>
        </div>
        <span className="rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim">
          {orders.length} order{orders.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Each round shown separately, then summed — the way a real tab works. */}
      <div className="mt-5 flex flex-col gap-4">
        {orders.map((o, idx) => (
          <div key={o.id} className="rounded-2xl border border-black/10 p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-ink-dim">
              <span>
                Round {idx + 1} ·{" "}
                <span className="font-mono">{o.id.slice(-6).toUpperCase()}</span>
                {o.placedBy === "WAITER" && " · added by staff"}
              </span>
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5",
                  o.status === "SERVED" && "bg-lime/15 text-lime",
                  o.status === "PREPARING" && "bg-orange/15 text-orange",
                  o.status === "PLACED" && "bg-black/[0.04]",
                )}
              >
                {o.status}
              </span>
            </div>

            {o.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1 text-sm">
                <span>
                  {item.name} × {item.qty}
                  {item.notes && (
                    <span className="block text-xs italic text-ink-dim">“{item.notes}”</span>
                  )}
                </span>
                <span className="shrink-0">₹{(Number(item.price) * item.qty).toFixed(2)}</span>
              </div>
            ))}

            {o.note && <p className="mt-1 text-xs italic text-ink-dim">Note: {o.note}</p>}

            {o.status === "PLACED" && (
              <button
                onClick={() => cancelOwnOrder(o.id).catch((e) => setError(e.message))}
                className="mt-2 flex items-center gap-1 text-xs font-semibold text-ink-dim hover:text-pink"
              >
                <XCircle size={12} /> Cancel this round
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-between border-t border-black/10 pt-4 font-heading text-lg font-bold">
        <span>Total</span>
        <span className="text-pink">₹{total.toFixed(2)}</span>
      </div>

      {error && <p className="mt-4 rounded-xl bg-pink/10 px-4 py-3 text-sm text-pink">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={async () => {
            await setSessionPaymentIntent(sessionId, "COUNTER");
            setMode("counter");
          }}
          className="flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold hover:border-pink"
        >
          <Wallet size={16} /> Pay at Counter
        </button>

        {paymentGatewayEnabled && (
          <button
            onClick={handleOnline}
            disabled={busy}
            className="gradient-btn flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <CreditCard size={16} /> {busy ? "Opening…" : "Pay Here"}
          </button>
        )}

        {status === "OPEN" && (
          <Link
            href="/order"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-dim hover:text-pink"
          >
            <Plus size={12} /> Order something more
          </Link>
        )}
      </div>
    </div>
  );
}
