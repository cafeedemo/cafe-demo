"use client";

import { useState } from "react";
import Script from "next/script";
import { CheckCircle2, Receipt, Wallet, CreditCard } from "lucide-react";
import { createRazorpayOrder, verifyAndMarkPaid } from "@/lib/actions/payment";
import { setCounterPaymentIntent } from "@/lib/actions/orders";

type OrderDto = {
  id: string;
  total: string;
  items: { name: string; qty: number; price: string }[];
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function PayView({
  tableLabel,
  tableId,
  orders,
  total,
  paymentGatewayEnabled,
}: {
  tableLabel: string;
  tableId: string;
  orders: OrderDto[];
  total: number;
  paymentGatewayEnabled: boolean;
}) {
  const [mode, setMode] = useState<"counter" | "online" | null>(null);
  const [paying, setPaying] = useState(false);

  const allItems = orders.flatMap((o) => o.items);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Receipt className="text-ink-dim" size={32} />
        <h3 className="font-heading text-xl font-bold">Table {tableLabel}</h3>
        <p className="text-ink-dim">No pending bill for this table right now.</p>
      </div>
    );
  }

  if (mode === "counter") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-lime" size={40} />
        <h3 className="font-heading text-xl font-bold">Noted!</h3>
        <p className="text-ink-dim">Please pay ₹{total.toFixed(2)} at the counter. Thanks!</p>
      </div>
    );
  }

  async function handleOnlinePayment() {
    setPaying(true);
    try {
      const order = await createRazorpayOrder(total);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Brew & Bloom",
        description: `Table ${tableLabel} bill`,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await verifyAndMarkPaid(
            tableId,
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          setMode("online");
        },
        theme: { color: "#b0632b" },
      });
      rzp.open();
    } finally {
      setPaying(false);
    }
  }

  if (mode === "online") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="text-lime" size={40} />
        <h3 className="font-heading text-xl font-bold">Payment received!</h3>
        <p className="text-ink-dim">Thanks for dining with us.</p>
      </div>
    );
  }

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h3 className="font-heading text-xl font-bold">Table {tableLabel} — Your Bill</h3>
      <div className="mt-4 flex flex-col divide-y divide-black/10 text-sm">
        {allItems.map((item, i) => (
          <div key={i} className="flex justify-between py-2">
            <span>
              {item.name} × {item.qty}
            </span>
            <span>₹{(Number(item.price) * item.qty).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-heading text-lg font-bold">
        <span>Total</span>
        <span className="text-pink">₹{total.toFixed(2)}</span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={async () => {
            await setCounterPaymentIntent(tableId);
            setMode("counter");
          }}
          className="flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold hover:border-pink"
        >
          <Wallet size={16} /> Pay at Counter
        </button>
        {paymentGatewayEnabled && (
          <button
            onClick={handleOnlinePayment}
            disabled={paying}
            className="gradient-btn flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <CreditCard size={16} /> {paying ? "Opening..." : "Pay Here"}
          </button>
        )}
      </div>
    </div>
  );
}
