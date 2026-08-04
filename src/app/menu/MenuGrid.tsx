"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { DEMO_IMAGES } from "@/lib/demo-images";

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
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
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass-card group relative rounded-3xl p-6"
              >
                {item.isFeatured && (
                  <span className="gradient-btn absolute -top-2 -right-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase">
                    Popular
                  </span>
                )}
                <div className="relative mb-4 h-36 overflow-hidden rounded-2xl">
                  <Image
                    src={item.imageUrl || DEMO_IMAGES.menu[i % DEMO_IMAGES.menu.length]}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-bold">{item.name}</h3>
                  <span className="whitespace-nowrap font-heading font-bold text-pink">
                    ₹{item.price}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-ink-dim">{item.description}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
