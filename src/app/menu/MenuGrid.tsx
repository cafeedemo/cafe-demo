"use client";

import { useMemo, useState } from "react";
import { Coffee } from "lucide-react";
import { clsx } from "clsx";

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string;
  isFeatured: boolean;
};

const CATEGORIES = ["ALL", "COFFEE", "TEA", "PASTRY", "FOOD", "SPECIALS"] as const;

const LABELS: Record<string, string> = {
  ALL: "All",
  COFFEE: "Coffee",
  TEA: "Tea",
  PASTRY: "Pastries",
  FOOD: "Food",
  SPECIALS: "Specials",
};

export function MenuGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("ALL");

  const filtered = useMemo(
    () => (active === "ALL" ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  return (
    <div className="mt-12">
      <div className="flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={clsx(
              "rounded-full px-5 py-2 text-sm font-semibold transition-all",
              active === cat
                ? "gradient-btn"
                : "glass-card text-ink-dim hover:text-ink",
            )}
          >
            {LABELS[cat]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-ink-dim">No items in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card group relative rounded-3xl p-6 transition-transform hover:-translate-y-1"
            >
              {item.isFeatured && (
                <span className="gradient-btn absolute -top-2 -right-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase">
                  Popular
                </span>
              )}
              <div className="mb-4 flex h-36 items-center justify-center rounded-2xl bg-gradient-to-br from-pink/20 via-orange/20 to-purple/20">
                <Coffee className="text-ink-dim/50" size={40} />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                <span className="whitespace-nowrap font-heading font-bold text-lime">
                  ${item.price}
                </span>
              </div>
              {item.description && (
                <p className="mt-2 text-sm text-ink-dim">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
