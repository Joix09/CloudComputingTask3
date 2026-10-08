"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ItemForm from "@/components/ItemForm";
import { api, ApiError } from "@/lib/api";
import type { Item } from "@/lib/types";

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getItem(id)
      .then(setItem)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this item."));
  }, [id]);

  return (
    <>
      <Link href={`/items/${id}`} className="back">
        Back to item
      </Link>
      <div className="page-head">
        <h1>Edit item</h1>
      </div>
      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}
      {!item && !error && <p className="code">Loading…</p>}
      {item && (
        <ItemForm
          initial={item}
          submitLabel="Save changes"
          onSubmit={async (input) => {
            await api.updateItem(id, input);
            router.push(`/items/${id}`);
          }}
          onCancel={() => router.push(`/items/${id}`)}
        />
      )}
    </>
  );
}
