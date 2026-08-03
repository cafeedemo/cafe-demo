"use client";

import { useRef } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { createGalleryImage, deleteGalleryImage } from "@/lib/actions/gallery";

type GalleryImageDto = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function GalleryManager({ images }: { images: GalleryImageDto[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createGalleryImage(formData);
    formRef.current?.reset();
  }

  return (
    <div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="glass-card mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-3"
      >
        <input
          name="imageUrl"
          placeholder="Image URL (https://...)"
          required
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-pink focus:outline-none sm:col-span-2"
        />
        <input
          name="caption"
          placeholder="Caption (optional)"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
        />
        <button type="submit" className="gradient-btn rounded-full px-5 py-2.5 text-sm sm:col-span-3">
          Add photo
        </button>
      </form>

      {images.length === 0 ? (
        <p className="text-sm text-ink-dim">
          No photos yet. Paste an image URL above to add your first one.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="glass-card group relative overflow-hidden rounded-2xl">
              <Image
                src={img.imageUrl}
                alt={img.caption ?? "Gallery photo"}
                width={300}
                height={300}
                className="aspect-square w-full object-cover"
              />
              <button
                onClick={() => deleteGalleryImage(img.id)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
              {img.caption && (
                <p className="p-2 text-xs text-ink-dim">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
