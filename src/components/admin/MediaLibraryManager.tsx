"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Trash2, Upload, Copy } from "lucide-react";
import { uploadMediaAsset, deleteMediaAsset } from "@/lib/actions/media";

type MediaAssetDto = {
  id: string;
  url: string;
  source: string;
  category: string;
  label: string | null;
};

const CATEGORIES = ["ALL", "DISH", "AMBIENCE", "HERO", "ABOUT", "GALLERY", "LOGO", "OTHER"];

export function MediaLibraryManager({ assets }: { assets: MediaAssetDto[] }) {
  const [filter, setFilter] = useState("ALL");
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = filter === "ALL" ? assets : assets.filter((a) => a.category === filter);

  async function handleUpload(formData: FormData) {
    setUploading(true);
    try {
      await uploadMediaAsset(formData);
      formRef.current?.reset();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleUpload}
        className="glass-card mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-3"
      >
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pink file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white sm:col-span-2"
        />
        <select
          name="category"
          defaultValue="OTHER"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm"
        >
          {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          name="label"
          placeholder="Label (optional)"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm sm:col-span-2"
        />
        <button
          type="submit"
          disabled={uploading}
          className="gradient-btn flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm disabled:opacity-60"
        >
          <Upload size={14} /> {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === c ? "gradient-btn" : "bg-black/[0.03] text-ink-dim",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-dim">No images in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="glass-card group relative overflow-hidden rounded-2xl">
              <div className="relative aspect-square w-full">
                <Image src={asset.url} alt={asset.label ?? ""} fill className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-[10px] text-ink-dim">
                  {asset.label || asset.category}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(asset.url)}
                    className="text-ink-dim hover:text-pink"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMediaAsset(asset.id)}
                    className="text-ink-dim hover:text-pink"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
