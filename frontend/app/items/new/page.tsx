"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ItemForm from "@/components/ItemForm";
import { api } from "@/lib/api";

export default function NewItemPage() {
  const router = useRouter();
  return (
    <>
      <Link href="/items" className="back">
        Back to equipment
      </Link>
      <div className="page-head">
        <h1>Add item</h1>
      </div>
      <ItemForm
        submitLabel="Add item"
        onSubmit={async (input) => {
          const created = await api.createItem(input);
          router.push(`/items/${created.id}`);
        }}
        onCancel={() => router.push("/items")}
      />
    </>
  );
}
