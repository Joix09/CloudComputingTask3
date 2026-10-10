"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RentalForm from "@/components/RentalForm";
import { api, ApiError } from "@/lib/api";
import type { Item, Rental } from "@/lib/types";

export default function EditRentalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getRental(id)
      .then(async (r) => {
        setRental(r);
        setItem(await api.getItem(r.itemId));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this rental."));
  }, [id]);

  const back = item ? `/items/${item.id}` : "/rentals";

  return (
    <>
      <Link href={back} className="back">
        Back
      </Link>
      <div className="page-head">
        <div>
          <h1>Change rental</h1>
          {rental && <p>#{rental.id}: {rental.itemName}</p>}
        </div>
      </div>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {!item && !error && <p className="code">Loading…</p>}
      {rental && rental.status === "RETURNED" && (
        <div className="alert" role="alert">
          This rental has already been returned and can&apos;t be changed.
        </div>
      )}
      {rental && item && rental.status !== "RETURNED" && (
        <div className="form-card">
          <RentalForm
            item={item}
            initial={rental}
            submitLabel="Save changes"
            onSubmit={async (input) => {
              await api.updateRental(rental.id, input);
              router.push(back);
            }}
            onCancel={() => router.push(back)}
          />
        </div>
      )}
    </>
  );
}
