"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RentalStatusTag } from "@/components/StatusTag";
import { api, ApiError, formatDate, formatPrice } from "@/lib/api";
import { RENTAL_STATUS_LABELS, type Page, type Rental, type RentalStatus } from "@/lib/types";

export default function RentalsPage() {
  const [status, setStatus] = useState<RentalStatus | "">("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Rental> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    return api
      .listRentals({ status, page })
      .then((res) => (setData(res), setError(null)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load rentals."))
      .finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(rental: Rental, action: "return" | "delete") {
    if (action === "delete") {
      const open = rental.status !== "RETURNED";
      const question = open
        ? `Cancel ${rental.renterName}'s rental of ${rental.itemName}? The item becomes available again.`
        : `Delete this rental record of ${rental.itemName}?`;
      if (!confirm(question)) return;
    }
    setBusyId(rental.id);
    try {
      if (action === "return") await api.returnRental(rental.id);
      else await api.deleteRental(rental.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work. Try again.");
    }
    setBusyId(null);
  }

  const rentals = data?.content ?? [];
  const pageInfo = data?.page;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Rentals</h1>
          <p>Who has what, and when it's due back.</p>
        </div>
      </div>

      <div className="filters">
        <div>
          <label htmlFor="f-status">Status</label>
          <select
            id="f-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RentalStatus | "");
              setPage(0);
            }}
          >
            <option value="">All rentals</option>
            {(Object.keys(RENTAL_STATUS_LABELS) as RentalStatus[]).map((s) => (
              <option key={s} value={s}>
                {RENTAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <div className="ledger-wrap" aria-busy={loading}>
        {!loading && !error && rentals.length === 0 ? (
          <div className="empty">
            <p>{status ? "No rentals with this status." : "Nothing has been rented yet."}</p>
            <Link href="/items" className="btn">
              Browse equipment
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Item</th>
                <th scope="col">Rented by</th>
                <th scope="col">Picked up</th>
                <th scope="col">Due back</th>
                <th scope="col" className="num">Total</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => {
                const open = r.status !== "RETURNED";
                return (
                  <tr key={r.id}>
                    <td className="code">#{r.id}</td>
                    <td>
                      <Link href={`/items/${r.itemId}`} className="item-link">
                        {r.itemName}
                      </Link>
                    </td>
                    <td>
                      {r.renterName}
                      <div className="code small">{r.renterEmail}</div>
                    </td>
                    <td>{formatDate(r.startDate)}</td>
                    <td className={r.status === "OVERDUE" ? "late-text" : undefined}>
                      {r.returnedAt ? `Returned ${formatDate(r.returnedAt)}` : formatDate(r.dueDate)}
                    </td>
                    <td className="num">{formatPrice(r.totalPrice)}</td>
                    <td>
                      <RentalStatusTag status={r.status} />
                    </td>
                    <td>
                      <div className="row-actions">
                        {open && (
                          <button className="btn btn-small" onClick={() => act(r, "return")} disabled={busyId === r.id}>
                            Returned
                          </button>
                        )}
                        {open && (
                          <Link href={`/rentals/${r.id}/edit`} className="btn btn-small btn-ghost">
                            Change
                          </Link>
                        )}
                        <button
                          className="btn btn-small btn-ghost"
                          onClick={() => act(r, "delete")}
                          disabled={busyId === r.id}
                        >
                          {open ? "Cancel" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && rentals.length === 0 && (
                <tr>
                  <td colSpan={8} className="code">
                    Loading rentals…
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
            Page {pageInfo.number + 1} of {pageInfo.totalPages} ({pageInfo.totalElements} rentals)
          </span>
          <div>
            <button className="btn btn-ghost" disabled={pageInfo.number === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button
              className="btn btn-ghost"
              disabled={pageInfo.number + 1 >= pageInfo.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
