import type { Item, ItemCategory, ItemInput, Page } from "./types";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "Can't reach the API. Check that the backend is running and the URL is correct.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`, body?.fieldErrors ?? {});
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ItemFilters {
  category?: ItemCategory | "";
  available?: "true" | "false" | "";
  page?: number;
  size?: number;
}

export const api = {
  listItems(filters: ItemFilters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.available) params.set("available", filters.available);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 20));
    return request<Page<Item>>(`/api/items?${params}`);
  },
  getItem(id: string | number) {
    return request<Item>(`/api/items/${id}`);
  },
  createItem(input: ItemInput) {
    return request<Item>("/api/items", { method: "POST", body: JSON.stringify(input) });
  },
  updateItem(id: string | number, input: ItemInput) {
    return request<Item>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(input) });
  },
  deleteItem(id: string | number) {
    return request<void>(`/api/items/${id}`, { method: "DELETE" });
  },
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
