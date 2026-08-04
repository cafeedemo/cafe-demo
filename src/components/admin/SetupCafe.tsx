"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Check, Palette, LayoutGrid, SlidersHorizontal, QrCode } from "lucide-react";
import { updateBranding, updateRules, toggleFeature } from "@/lib/actions/settings";
import { MediaPicker } from "./MediaPicker";
import { TableLayoutBuilder } from "./TableLayoutBuilder";

type Settings = {
  cafeName: string;
  tagline: string;
  heroText: string;
  aboutText: string;
  address: string;
  phone: string;
  instagram: string | null;
  openingHours: string;
  mapEmbedUrl: string | null;
  logoUrl: string | null;
  reservationHoldMinutes: number;
  bookingLeadMinutes: number;
  slotIntervalMinutes: number;
  serviceOpenHour: number;
  serviceCloseHour: number;
  gridRows: number;
  gridCols: number;
  showLayoutToCustomers: boolean;
  paymentGatewayEnabled: boolean;
};

type TableDto = {
  id: string;
  number: number;
  seats: number;
  shape: string;
  gridRow: number;
  gridCol: number;
  qrToken: string;
  isActive: boolean;
};

type MediaAssetDto = { id: string; url: string; category: string; label: string | null };

const TABS = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "layout", label: "Table Layout", icon: LayoutGrid },
  { id: "rules", label: "Rules & Features", icon: SlidersHorizontal },
  { id: "qr", label: "Table QR Codes", icon: QrCode },
] as const;

export function SetupCafe({
  settings,
  tables,
  mediaAssets,
}: {
  settings: Settings;
  tables: TableDto[];
  mediaAssets: MediaAssetDto[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("branding");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id ? "gradient-btn" : "border border-black/10 text-ink-dim hover:text-ink",
              )}
            >
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "branding" && <BrandingTab settings={settings} mediaAssets={mediaAssets} />}
      {tab === "layout" && (
        <TableLayoutBuilder
          tables={tables}
          gridRows={settings.gridRows}
          gridCols={settings.gridCols}
        />
      )}
      {tab === "rules" && <RulesTab settings={settings} />}
      {tab === "qr" && <QrTab tables={tables} />}
    </div>
  );
}

function BrandingTab({
  settings,
  mediaAssets,
}: {
  settings: Settings;
  mediaAssets: MediaAssetDto[];
}) {
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl ?? "");

  return (
    <form
      action={async (fd) => {
        await updateBranding(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
      className="glass-card flex max-w-2xl flex-col gap-5 rounded-2xl p-6"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03]">
          {logoUrl && <Image src={logoUrl} alt="Logo" fill className="object-cover" />}
        </div>
        <input type="hidden" name="logoUrl" value={logoUrl} />
        <MediaPicker assets={mediaAssets} onSelect={setLogoUrl} triggerLabel="Choose logo" />
      </div>

      <Field label="Cafe name" name="cafeName" defaultValue={settings.cafeName} />
      <Field label="Tagline" name="tagline" defaultValue={settings.tagline} />
      <Field label="Hero headline" name="heroText" defaultValue={settings.heroText} />
      <Field label="About text" name="aboutText" defaultValue={settings.aboutText} textarea />
      <Field label="Address" name="address" defaultValue={settings.address} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" defaultValue={settings.phone} />
        <Field label="Opening hours" name="openingHours" defaultValue={settings.openingHours} />
      </div>
      <Field
        label="Google Maps embed URL (optional)"
        name="mapEmbedUrl"
        defaultValue={settings.mapEmbedUrl ?? ""}
      />
      <Field
        label="Instagram handle (optional)"
        name="instagram"
        defaultValue={settings.instagram ?? ""}
      />

      <button
        type="submit"
        className="gradient-btn flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
      >
        {saved && <Check size={16} />}
        {saved ? "Saved!" : "Save branding"}
      </button>
    </form>
  );
}

function RulesTab({ settings }: { settings: Settings }) {
  const [saved, setSaved] = useState(false);
  const [showLayout, setShowLayout] = useState(settings.showLayoutToCustomers);
  const [gateway, setGateway] = useState(settings.paymentGatewayEnabled);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <form
        action={async (fd) => {
          await updateRules(fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
        className="glass-card flex flex-col gap-5 rounded-2xl p-6"
      >
        <h3 className="font-heading font-bold">Booking rules</h3>

        <NumField
          label="Hold a reserved table for (minutes)"
          hint="Once someone books 6:00 PM, the table stays theirs for this long. Other guests can book it again after that."
          name="reservationHoldMinutes"
          defaultValue={settings.reservationHoldMinutes}
          min={15}
          max={360}
        />
        <NumField
          label="Minimum notice before a booking (minutes)"
          hint="At 6:00 PM with 30 minutes' notice, the earliest bookable slot is 6:30 PM."
          name="bookingLeadMinutes"
          defaultValue={settings.bookingLeadMinutes}
          min={0}
          max={1440}
        />
        <NumField
          label="Slot size (minutes)"
          hint="Booking times step in this size — 15 gives 6:00, 6:15, 6:30…"
          name="slotIntervalMinutes"
          defaultValue={settings.slotIntervalMinutes}
          min={5}
          max={120}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <NumField label="Opens at (hour, 0–23)" name="serviceOpenHour" defaultValue={settings.serviceOpenHour} min={0} max={23} />
          <NumField label="Closes at (hour, 1–24)" name="serviceCloseHour" defaultValue={settings.serviceCloseHour} min={1} max={24} />
        </div>

        <h3 className="mt-2 font-heading font-bold">Floor plan size</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <NumField label="Rows" name="gridRows" defaultValue={settings.gridRows} min={1} max={12} />
          <NumField label="Columns" name="gridCols" defaultValue={settings.gridCols} min={1} max={12} />
        </div>

        <button
          type="submit"
          className="gradient-btn flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          {saved && <Check size={16} />}
          {saved ? "Saved!" : "Save rules"}
        </button>
      </form>

      <Toggle
        title="Let customers pick their own table"
        blurb="On: guests see your floor plan and choose a table. Off: we auto-assign the best free table for their party size."
        enabled={showLayout}
        onChange={async (next) => {
          setShowLayout(next);
          await toggleFeature("showLayoutToCustomers", next);
        }}
      />

      <Toggle
        title="Online payments (Razorpay)"
        blurb="Off: the bill only offers 'Pay at Counter'. On: guests can also pay from their phone."
        enabled={gateway}
        onChange={async (next) => {
          setGateway(next);
          await toggleFeature("paymentGatewayEnabled", next);
        }}
      />
    </div>
  );
}

function QrTab({ tables }: { tables: TableDto[] }) {
  return (
    <div>
      <p className="mb-6 max-w-2xl text-sm text-ink-dim">
        Print one QR per table and stick it on the table. Scanning it opens the menu with
        that table already identified, so guests only enter their name.
      </p>
      <TableQrGrid tables={tables} />
    </div>
  );
}

function Field({
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

function NumField({
  label,
  hint,
  name,
  defaultValue,
  min,
  max,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue: number;
  min: number;
  max: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-dim" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={min}
        max={max}
        defaultValue={defaultValue}
        className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm focus:border-pink focus:outline-none"
      />
      {hint && <p className="text-xs text-ink-dim">{hint}</p>}
    </div>
  );
}

function Toggle({
  title,
  blurb,
  enabled,
  onChange,
}: {
  title: string;
  blurb: string;
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="glass-card flex items-start justify-between gap-4 rounded-2xl p-6">
      <div>
        <p className="font-heading font-bold">{title}</p>
        <p className="mt-1 text-sm text-ink-dim">{blurb}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={clsx(
          "relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors",
          enabled ? "bg-pink" : "bg-black/15",
        )}
        aria-pressed={enabled}
      >
        <span
          className={clsx(
            "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
            enabled ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

// Rendered client-side so the QR encodes whatever origin the admin is on.
function TableQrGrid({ tables }: { tables: TableDto[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tables.map((t) => (
        <TableQrCard key={t.id} table={t} />
      ))}
    </div>
  );
}

function TableQrCard({ table }: { table: TableDto }) {
  // Both values land together from the async callback, so nothing is set
  // synchronously during the effect.
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${window.location.origin}/t/${table.qrToken}`;

    import("qrcode")
      .then((QR) => QR.toDataURL(url, { width: 400, margin: 1 }))
      .then((dataUrl) => {
        if (!cancelled) setQr({ url, dataUrl });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [table.qrToken]);

  return (
    <div className="glass-card flex flex-col items-center gap-2 rounded-2xl p-4 text-center">
      <p className="font-heading font-bold">Table {table.number}</p>
      {qr ? (
        <Image
          src={qr.dataUrl}
          alt={`QR code for table ${table.number}`}
          width={140}
          height={140}
          unoptimized
        />
      ) : (
        <div className="flex h-[140px] w-[140px] items-center justify-center rounded-xl bg-black/[0.03] text-xs text-ink-dim">
          Generating…
        </div>
      )}
      {qr && (
        <>
          <p className="break-all text-[10px] text-ink-dim">{qr.url}</p>
          <a
            href={qr.dataUrl}
            download={`table-${table.number}-qr.png`}
            className="text-xs font-semibold text-pink hover:underline"
          >
            Download PNG
          </a>
        </>
      )}
    </div>
  );
}
