import type { Item, ItemCategory, ItemInput, Page, Rental, RentalInput, RentalStatus } from "./types";

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

  listRentals(filters: { status?: RentalStatus | ""; page?: number; size?: number } = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 20));
    return request<Page<Rental>>(`/api/rentals?${params}`);
  },
  getRental(id: string | number) {
    return request<Rental>(`/api/rentals/${id}`);
  },
  createRental(itemId: string | number, input: RentalInput) {
    return request<Rental>(`/api/items/${itemId}/rentals`, { method: "POST", body: JSON.stringify(input) });
  },
  updateRental(id: string | number, input: RentalInput) {
    return request<Rental>(`/api/rentals/${id}`, { method: "PUT", body: JSON.stringify(input) });
  },
  returnRental(id: string | number) {
    return request<Rental>(`/api/rentals/${id}/return`, { method: "POST" });
  },
  deleteRental(id: string | number) {
    return request<void>(`/api/rentals/${id}`, { method: "DELETE" });
  },
  /** Plain link target: the browser downloads the PDF directly from the API. */
  receiptUrl(id: string | number) {
    return `${BASE_URL}/api/rentals/${id}/receipt`;
  },
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Formats a yyyy-mm-dd date or an ISO timestamp, e.g. "14 Oct 2026". */
export const formatDate = (value: string) =>
  dateFmt.format(new Date(value.length === 10 ? `${value}T00:00:00` : value));

/** Today as yyyy-mm-dd in UTC, the same "today" the backend checks against. */
export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Adds days to a yyyy-mm-dd date without timezone surprises. */
export const addDays = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
