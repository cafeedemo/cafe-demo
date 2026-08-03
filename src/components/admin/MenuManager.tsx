"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/actions/menu";

type MenuItemDto = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
};

const CATEGORIES = ["COFFEE", "TEA", "PASTRY", "FOOD", "SPECIALS"];

export function MenuManager({ items }: { items: MenuItemDto[] }) {
  const [editing, setEditing] = useState<MenuItemDto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (editing) {
      await updateMenuItem(editing.id, formData);
    } else {
      await createMenuItem(formData);
    }
    setEditing(null);
    setShowForm(false);
    formRef.current?.reset();
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm((s) => !s);
          }}
          className="gradient-btn flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "Add item"}
        </button>
      </div>

      {showForm && (
        <form
          ref={formRef}
          action={handleSubmit}
          className="glass-card mb-8 grid gap-4 rounded-2xl p-6 sm:grid-cols-2"
        >
          <input
            name="name"
            placeholder="Item name"
            defaultValue={editing?.name}
            required
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            defaultValue={editing?.price}
            required
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <select
            name="category"
            defaultValue={editing?.category ?? "COFFEE"}
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            name="imageUrl"
            placeholder="Image URL (optional)"
            defaultValue={editing?.imageUrl ?? ""}
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none"
          />
          <textarea
            name="description"
            placeholder="Description"
            defaultValue={editing?.description ?? ""}
            className="rounded-xl border border-black/10 bg-black/[0.03] px-4 py-2.5 text-sm focus:border-pink focus:outline-none sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={editing?.isAvailable ?? true}
            />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={editing?.isFeatured ?? false}
            />
            Featured on homepage
          </label>
          <button type="submit" className="gradient-btn rounded-full px-5 py-2.5 text-sm sm:col-span-2">
            {editing ? "Save changes" : "Create item"}
          </button>
        </form>
      )}

      <div className="glass-card overflow-hidden rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-ink-dim">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3 font-medium">{item.name}</td>
                <td className="px-6 py-3 text-ink-dim">{item.category}</td>
                <td className="px-6 py-3 text-lime">${item.price}</td>
                <td className="px-6 py-3">
                  <span
                    className={
                      item.isAvailable
                        ? "rounded-full bg-lime/10 px-3 py-1 text-xs text-lime"
                        : "rounded-full bg-black/[0.03] px-3 py-1 text-xs text-ink-dim"
                    }
                  >
                    {item.isAvailable ? "Available" : "Hidden"}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => {
                      setEditing(item);
                      setShowForm(true);
                    }}
                    className="mr-3 text-ink-dim hover:text-pink"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="text-ink-dim hover:text-pink"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-ink-dim">
                  No menu items yet — add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
