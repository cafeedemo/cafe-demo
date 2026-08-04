"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Images, X } from "lucide-react";

type MediaAssetDto = { id: string; url: string; category: string; label: string | null };

const CATEGORIES = ["ALL", "DISH", "AMBIENCE", "HERO", "ABOUT", "GALLERY", "LOGO", "OTHER"];

export function MediaPicker({
  assets,
  onSelect,
  triggerLabel = "Choose from library",
}: {
  assets: MediaAssetDto[];
  onSelect: (url: string) => void;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? assets : assets.filter((a) => a.category === filter);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-4 py-2 text-xs font-semibold text-ink-dim hover:text-ink"
      >
        <Images size={14} /> {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="glass-card max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-base p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold">Media Library</h3>
              <button onClick={() => setOpen(false)} className="text-ink-dim hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    filter === c ? "gradient-btn" : "bg-black/[0.03] text-ink-dim",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-ink-dim">No images in this category yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {filtered.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelect(asset.url);
                      setOpen(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-black/10"
                  >
                    <Image src={asset.url} alt={asset.label ?? ""} fill className="object-cover transition-transform group-hover:scale-110" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
