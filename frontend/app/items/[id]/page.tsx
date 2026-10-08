"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatusTag from "@/components/StatusTag";
import { api, ApiError, formatPrice } from "@/lib/api";
import { CATEGORY_LABELS, type Item } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .getItem(id)
      .then(setItem)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this item."));
  }, [id]);

  async function handleDelete() {
    if (!item || !confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteItem(item.id);
      router.push("/items");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't delete this item.");
      setDeleting(false);
    }
  }

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
            <StatusTag available={item.available} />
          </div>

          <div className="detail">
            <section className="detail-card">
              <h2>Details</h2>
              <dl className="facts">
                <dt>Category</dt>
                <dd>{CATEGORY_LABELS[item.category]}</dd>
                <dt>Longest rental</dt>
                <dd>{item.maxRentalDays} days</dd>
                <dt>Purchased</dt>
                <dd>{dateFmt.format(new Date(`${item.purchaseDate}T00:00:00`))}</dd>
                <dt>Last updated</dt>
                <dd>{dateFmt.format(new Date(item.updatedAt))}</dd>
                <dt>Description</dt>
                <dd>{item.description ?? "No description"}</dd>
              </dl>
            </section>

            <aside className="detail-card">
              <div className="price-big">{formatPrice(item.dailyPrice)}</div>
              <p className="hint">per day</p>
              <div className="stack">
                <Link href={`/items/${item.id}/edit`} className="btn">
                  Edit item
                </Link>
                <button className="btn btn-danger" onClick={handleDelete} disabled={deleting || !item.available}>
                  {deleting ? "Deleting…" : "Delete item"}
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
