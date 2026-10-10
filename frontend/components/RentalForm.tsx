"use client";

import { useState } from "react";
import { addDays, ApiError, formatDate, formatPrice, todayIso } from "@/lib/api";
import type { Item, Rental, RentalInput } from "@/lib/types";

/** Must match RentalService.MAX_DAYS_AHEAD in the backend. */
const MAX_DAYS_AHEAD = 14;

interface Props {
  item: Pick<Item, "name" | "dailyPrice" | "maxRentalDays">;
  initial?: Rental;
  submitLabel: string;
  onSubmit: (input: RentalInput) => Promise<void>;
  onCancel?: () => void;
}

type FormState = { renterName: string; renterEmail: string; startDate: string; rentalDays: string; agreedToTerms: boolean };

export default function RentalForm({ item, initial, submitLabel, onSubmit, onCancel }: Props) {
  const today = todayIso();
  const [form, setForm] = useState<FormState>({
    renterName: initial?.renterName ?? "",
    renterEmail: initial?.renterEmail ?? "",
    startDate: initial?.startDate ?? today,
    rentalDays: String(initial?.rentalDays ?? Math.min(3, item.maxRentalDays)),
    agreedToTerms: Boolean(initial),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors(({ [key]: _removed, ...rest }) => rest);
  };

  // An existing rental may keep a start date that is now in the past
  const minStart = initial && initial.startDate < today ? initial.startDate : today;
  const maxStart = addDays(today, MAX_DAYS_AHEAD);

  const days = Number(form.rentalDays);
  const validDays = Number.isInteger(days) && days >= 1 && days <= item.maxRentalDays;
  const dueDate = form.startDate && validDays ? addDays(form.startDate, days) : null;
  const latestReturn = form.startDate ? addDays(form.startDate, item.maxRentalDays) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    const input: RentalInput = {
      renterName: form.renterName.trim(),
      renterEmail: form.renterEmail.trim(),
      startDate: form.startDate || null,
      rentalDays: form.rentalDays === "" ? null : Number(form.rentalDays),
      agreedToTerms: form.agreedToTerms,
    };
    try {
      await onSubmit(input);
      setSaving(false);
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

  const name = field("renterName");
  const email = field("renterEmail");
  const start = field("startDate");
  const length = field("rentalDays");
  const terms = field("agreedToTerms");

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert" role="alert">
          {formError}
        </div>
      )}
      <div className="form-grid">
        <div className={name.className}>
          <label htmlFor="renterName">Your name</label>
          <input id="renterName" value={form.renterName} onChange={set("renterName")} maxLength={100}
            autoComplete="name" {...name.aria} />
          {name.error}
        </div>

        <div className={email.className}>
          <label htmlFor="renterEmail">Email</label>
          <input id="renterEmail" type="email" value={form.renterEmail} onChange={set("renterEmail")}
            maxLength={254} autoComplete="email" {...email.aria} />
          {email.error}
        </div>

        <div className={start.className}>
          <label htmlFor="startDate">Pick-up date</label>
          <input id="startDate" type="date" min={minStart} max={maxStart} value={form.startDate}
            onChange={set("startDate")} {...start.aria} />
          {start.error ?? <div className="hint">Today or up to {MAX_DAYS_AHEAD} days ahead</div>}
        </div>

        <div className={length.className}>
          <label htmlFor="rentalDays">Number of days</label>
          <input id="rentalDays" type="number" inputMode="numeric" step="1" min="1" max={item.maxRentalDays}
            value={form.rentalDays} onChange={set("rentalDays")} {...length.aria} />
          {length.error ?? (
            <div className="hint">
              Up to {item.maxRentalDays} days{latestReturn && `, so back by ${formatDate(latestReturn)} at the latest`}
            </div>
          )}
        </div>

        <div className={`span-2 ${terms.className ?? ""}`}>
          <label className="checkbox">
            <input type="checkbox" checked={form.agreedToTerms} onChange={set("agreedToTerms")} {...terms.aria} />
            I&apos;ll return the {item.name.toLowerCase()} on time and in the same condition
          </label>
          {terms.error}
        </div>
      </div>

      <div className="summary" aria-live="polite">
        {dueDate ? (
          <>
            <span>
              Return by <strong>{formatDate(dueDate)}</strong>
            </span>
            <span>
              Total <strong>{formatPrice(item.dailyPrice * days)}</strong>
            </span>
          </>
        ) : (
          <span>Choose 1 to {item.maxRentalDays} days to see the return date.</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
