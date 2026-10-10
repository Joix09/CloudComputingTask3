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
  currentRental: CurrentRental | null; // null when the item is available
  createdAt: string;
  updatedAt: string;
}

export type RentalStatus = "ACTIVE" | "OVERDUE" | "RETURNED";

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  ACTIVE: "Active",
  OVERDUE: "Overdue",
  RETURNED: "Returned",
};

export interface CurrentRental {
  id: number;
  renterName: string;
  startDate: string; // yyyy-mm-dd
  dueDate: string;
  status: RentalStatus;
}

export interface Rental {
  id: number;
  itemId: number;
  itemName: string;
  renterName: string;
  renterEmail: string;
  startDate: string;
  rentalDays: number;
  dueDate: string;
  status: RentalStatus;
  totalPrice: number;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalInput {
  renterName: string;
  renterEmail: string;
  startDate: string | null;
  rentalDays: number | null;
  agreedToTerms: boolean;
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
