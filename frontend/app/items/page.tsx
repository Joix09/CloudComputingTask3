"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusTag from "@/components/StatusTag";
import { api, ApiError, formatPrice, type ItemFilters } from "@/lib/api";
import { CATEGORIES, CATEGORY_LABELS, type Item, type Page } from "@/lib/types";

export default function ItemsPage() {
  const [filters, setFilters] = useState<ItemFilters>({ category: "", available: "", page: 0 });
  const [data, setData] = useState<Page<Item> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listItems(filters)
      .then((res) => !cancelled && (setData(res), setError(null)))
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Couldn't load equipment."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const items = data?.content ?? [];
  const pageInfo = data?.page;
  const filtered = Boolean(filters.category || filters.available);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Equipment</h1>
          <p>Pick something to rent. Click an item to see until when you can have it.</p>
        </div>
        <Link href="/items/new" className="btn">
          Add item
        </Link>
      </div>

      <div className="filters">
        <div>
          <label htmlFor="f-category">Category</label>
          <select
            id="f-category"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as ItemFilters["category"], page: 0 }))}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-available">Status</label>
          <select
            id="f-available"
            value={filters.available}
            onChange={(e) => setFilters((f) => ({ ...f, available: e.target.value as ItemFilters["available"], page: 0 }))}
          >
            <option value="">Any status</option>
            <option value="true">Available</option>
            <option value="false">Rented out</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div className="ledger-wrap" aria-busy={loading}>
        {!loading && !error && items.length === 0 ? (
          <div className="empty">
            {filtered ? (
              <p>No equipment matches these filters.</p>
            ) : (
              <>
                <p>No equipment yet. Add the first item to start renting it out.</p>
                <Link href="/items/new" className="btn">
                  Add item
                </Link>
              </>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Item</th>
                <th scope="col">Category</th>
                <th scope="col" className="num">Per day</th>
                <th scope="col" className="num">Max days</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="code">#{item.id}</td>
                  <td>
                    <Link href={`/items/${item.id}`} className="item-link">
                      {item.name}
                    </Link>
                  </td>
                  <td>{CATEGORY_LABELS[item.category]}</td>
                  <td className="num">{formatPrice(item.dailyPrice)}</td>
                  <td className="num">{item.maxRentalDays}</td>
                  <td>
                    <StatusTag available={item.available} rental={item.currentRental} />
                  </td>
                </tr>
              ))}
              {loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="code">
                    Loading equipment…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="pager">
          <span>
            Page {pageInfo.number + 1} of {pageInfo.totalPages} ({pageInfo.totalElements} items)
          </span>
          <div>
            <button
              className="btn btn-ghost"
              disabled={pageInfo.number === 0}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn btn-ghost"
              disabled={pageInfo.number + 1 >= pageInfo.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
