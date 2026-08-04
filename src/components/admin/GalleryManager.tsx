"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createGalleryImage, deleteGalleryImage, updateGalleryPlacement } from "@/lib/actions/gallery";
import { MediaPicker } from "./MediaPicker";

type GalleryImageDto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  placement: string;
};

type MediaAssetDto = { id: string; url: string; category: string; label: string | null };

const PLACEMENTS = [
  { value: "GALLERY", label: "Gallery page" },
  { value: "HERO", label: "Homepage hero" },
  { value: "ABOUT", label: "About section" },
];

export function GalleryManager({ images, mediaAssets }: { images: GalleryImageDto[]; mediaAssets: MediaAssetDto[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(formData: FormData) {
    await createGalleryImage(formData);
    formRef.current?.reset();
    setImageUrl("");
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="glass-card mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-4"
      >
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            name="imageUrl"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <MediaPicker assets={mediaAssets} onSelect={setImageUrl} triggerLabel="Pick" />
        </div>
        <input
          name="caption"
          placeholder="Caption (optional)"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
        />
        <select
          name="placement"
          defaultValue="GALLERY"
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
        >
          {PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button type="submit" className="gradient-btn rounded-full px-5 py-2.5 text-sm sm:col-span-4">
          Add photo
        </button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-ink-dim">
          No photos yet. Pick or paste an image URL above to add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="glass-card group relative overflow-hidden rounded-2xl">
              <div className="relative aspect-square w-full">
                <Image
                  src={img.imageUrl}
                  alt={img.caption ?? "Gallery photo"}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={() => deleteGalleryImage(img.id)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
              <div className="p-2">
                <select
                  defaultValue={img.placement}
                  onChange={(e) =>
                    updateGalleryPlacement(img.id, e.target.value as "GALLERY" | "HERO" | "ABOUT")
                  }
                  className="w-full rounded-lg border border-black/10 bg-black/[0.03] px-2 py-1 text-xs"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                {img.caption && <p className="mt-1 text-xs text-ink-dim">{img.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
