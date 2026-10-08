export const CATEGORIES = ["SPORTS", "ELECTRONICS", "TOOLS", "OUTDOOR", "MUSIC", "OTHER"] as const;
export type ItemCategory = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  SPORTS: "Sports",
  ELECTRONICS: "Electronics",
  TOOLS: "Tools",
  OUTDOOR: "Outdoor",
  MUSIC: "Music",
  OTHER: "Other",
};

export interface Item {
  id: number;
  name: string;
  description: string | null;
  category: ItemCategory;
  dailyPrice: number;
  maxRentalDays: number;
  purchaseDate: string; // yyyy-mm-dd
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemInput {
  name: string;
  description: string | null;
  category: ItemCategory | null;
  dailyPrice: number | null;
  maxRentalDays: number | null;
  purchaseDate: string | null;
}

export interface Page<T> {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}
