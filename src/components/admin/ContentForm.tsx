"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { updateSiteContent } from "@/lib/actions/content";

type SiteContentDto = {
  cafeName: string;
  tagline: string;
  heroText: string;
  aboutText: string;
  address: string;
  phone: string;
  instagram: string | null;
};

export function ContentForm({ content }: { content: SiteContentDto }) {
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formData: FormData) {
    await updateSiteContent(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form action={handleSubmit} className="glass-card flex max-w-2xl flex-col gap-5 rounded-2xl p-6">
      <FieldGroup label="Cafe name" name="cafeName" defaultValue={content.cafeName} />
      <FieldGroup label="Tagline" name="tagline" defaultValue={content.tagline} />
      <FieldGroup label="Hero headline" name="heroText" defaultValue={content.heroText} />
      <FieldGroup label="About text" name="aboutText" defaultValue={content.aboutText} textarea />
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldGroup label="Address" name="address" defaultValue={content.address} />
        <FieldGroup label="Phone" name="phone" defaultValue={content.phone} />
      </div>
      <FieldGroup
        label="Instagram handle (optional)"
        name="instagram"
        defaultValue={content.instagram ?? ""}
      />

      <button type="submit" className="gradient-btn flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
        {saved ? <Check size={16} /> : null}
        {saved ? "Saved!" : "Save changes"}
      </button>
    </form>
  );
}

function FieldGroup({
  label,
  name,
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue: string;
  textarea?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-dim" htmlFor={name}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          rows={4}
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
        />
      )}
    </div>
  );
}
