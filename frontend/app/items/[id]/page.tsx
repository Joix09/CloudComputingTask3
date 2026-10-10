"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import RentalForm from "@/components/RentalForm";
import StatusTag from "@/components/StatusTag";
import { api, ApiError, formatDate, formatPrice } from "@/lib/api";
import { CATEGORY_LABELS, type Item } from "@/lib/types";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () =>
      api
        .getItem(id)
        .then(setItem)
        .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this item.")),
    [id],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!item || !confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await api.deleteItem(item.id);
      router.push("/items");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this item.");
      setBusy(false);
    }
  }

  async function handleReturn() {
    if (!item?.currentRental) return;
    setBusy(true);
    setError(null);
    try {
      await api.returnRental(item.currentRental.id);
      setNotice(`${item.name} is back on the shelf.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't mark this item as returned.");
    }
    setBusy(false);
  }

  const rental = item?.currentRental;

  return (
    <>
      <Link href="/items" className="back">
        Back to equipment
      </Link>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      {!item && !error && <p className="code">Loading…</p>}

      {item && (
        <>
          <div className="page-head">
            <div>
              <h1>{item.name}</h1>
              <p>
                #{item.id} in {CATEGORY_LABELS[item.category]}
              </p>
            </div>
            <StatusTag available={item.available} rental={rental} />
          </div>

          <div className="detail">
            <div className="stack-lg">
              <section className="detail-card" aria-labelledby="rent-heading">
                {rental ? (
                  <>
                    <h2 id="rent-heading">{rental.status === "OVERDUE" ? "Overdue" : "Rented out"}</h2>
                    <dl className="facts">
                      <dt>Rented by</dt>
                      <dd>{rental.renterName}</dd>
                      <dt>Picked up</dt>
                      <dd>{formatDate(rental.startDate)}</dd>
                      <dt>Due back</dt>
                      <dd className={rental.status === "OVERDUE" ? "late-text" : undefined}>
                        {formatDate(rental.dueDate)}
                      </dd>
                    </dl>
                    <div className="form-actions">
                      <button className="btn" onClick={handleReturn} disabled={busy}>
                        {busy ? "Saving…" : "Mark as returned"}
                      </button>
                      <Link href={`/rentals/${rental.id}/edit`} className="btn btn-ghost">
                        Change rental
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 id="rent-heading">Rent this item</h2>
                    <RentalForm
                      key={item.updatedAt}
                      item={item}
                      submitLabel="Rent it"
                      onSubmit={async (input) => {
                        const created = await api.createRental(item.id, input);
                        setNotice(`Rented! Bring it back by ${formatDate(created.dueDate)}.`);
                        await load();
                      }}
                    />
                  </>
                )}
              </section>

              <section className="detail-card">
                <h2>Details</h2>
                <dl className="facts">
                  <dt>Category</dt>
                  <dd>{CATEGORY_LABELS[item.category]}</dd>
                  <dt>Longest rental</dt>
                  <dd>{item.maxRentalDays} days</dd>
                  <dt>Purchased</dt>
                  <dd>{formatDate(item.purchaseDate)}</dd>
                  <dt>Last updated</dt>
                  <dd>{formatDate(item.updatedAt)}</dd>
                  <dt>Description</dt>
                  <dd>{item.description ?? "No description"}</dd>
                </dl>
              </section>
            </div>

            <aside className="detail-card">
              <div className="price-big">{formatPrice(item.dailyPrice)}</div>
              <p className="hint">per day, for up to {item.maxRentalDays} days</p>
              <div className="stack">
                <Link href={`/items/${item.id}/edit`} className="btn btn-ghost">
                  Edit item
                </Link>
                <button className="btn btn-danger" onClick={handleDelete} disabled={busy || !item.available}>
                  Delete item
                </button>
                {!item.available && <p className="hint">Rented-out items can be deleted once they're returned.</p>}
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
