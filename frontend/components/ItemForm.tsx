"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABELS, type Item, type ItemInput } from "@/lib/types";

interface Props {
  initial?: Item;
  submitLabel: string;
  onSubmit: (input: ItemInput) => Promise<void>;
  onCancel: () => void;
}

type FormState = Record<"name" | "description" | "category" | "dailyPrice" | "maxRentalDays" | "purchaseDate", string>;

const today = () => new Date().toISOString().slice(0, 10);

export default function ItemForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    dailyPrice: initial ? String(initial.dailyPrice) : "",
    maxRentalDays: initial ? String(initial.maxRentalDays) : "7",
    purchaseDate: initial?.purchaseDate ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors(({ [key]: _removed, ...rest }) => rest);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    // Convert form strings into the types the API expects. Empty fields become null so the
    // backend's @NotNull checks report them, rather than the frontend guessing a value.
    const input: ItemInput = {
      name: form.name,
      description: form.description.trim() || null,
      category: (form.category || null) as ItemInput["category"],
      dailyPrice: form.dailyPrice === "" ? null : Number(form.dailyPrice),
      maxRentalDays: form.maxRentalDays === "" ? null : Number(form.maxRentalDays),
      purchaseDate: form.purchaseDate || null,
    };
    try {
      await onSubmit(input);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? "Fix the highlighted fields and try again." : err.message);
      } else {
        setFormError("Something went wrong while saving. Try again.");
      }
      setSaving(false);
    }
  }

  const field = (key: keyof FormState) => ({
    className: fieldErrors[key] ? "has-error" : undefined,
    error: fieldErrors[key] ? (
      <div className="field-error" id={`${key}-error`}>
        {fieldErrors[key]}
      </div>
    ) : null,
    aria: { "aria-invalid": !!fieldErrors[key], "aria-describedby": fieldErrors[key] ? `${key}-error` : undefined },
  });

  const name = field("name");
  const category = field("category");
  const price = field("dailyPrice");
  const days = field("maxRentalDays");
  const date = field("purchaseDate");
  const desc = field("description");

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert" role="alert">
          {formError}
        </div>
      )}
      <div className="form-grid">
        <div className={`span-2 ${name.className ?? ""}`}>
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={set("name")} maxLength={100} {...name.aria} />
          {name.error}
        </div>

        <div className={category.className}>
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={set("category")} {...category.aria}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          {category.error}
        </div>

        <div className={price.className}>
          <label htmlFor="dailyPrice">Price per day (€)</label>
          <input id="dailyPrice" type="number" inputMode="decimal" step="0.01" min="0" max="10000"
            value={form.dailyPrice} onChange={set("dailyPrice")} {...price.aria} />
          {price.error}
        </div>

        <div className={days.className}>
          <label htmlFor="maxRentalDays">Longest rental (days)</label>
          <input id="maxRentalDays" type="number" inputMode="numeric" step="1" min="1" max="90"
            value={form.maxRentalDays} onChange={set("maxRentalDays")} {...days.aria} />
          {days.error ?? <div className="hint">Between 1 and 90 days</div>}
        </div>

        <div className={date.className}>
          <label htmlFor="purchaseDate">Purchase date</label>
          <input id="purchaseDate" type="date" max={today()} value={form.purchaseDate}
            onChange={set("purchaseDate")} {...date.aria} />
          {date.error}
        </div>

        <div className={`span-2 ${desc.className ?? ""}`}>
          <label htmlFor="description">Description (optional)</label>
          <textarea id="description" value={form.description} onChange={set("description")} maxLength={500} {...desc.aria} />
          {desc.error ?? <div className="hint">Condition, accessories included, anything a renter should know</div>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}
