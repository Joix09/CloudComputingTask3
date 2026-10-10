import { formatDate, todayIso } from "@/lib/api";
import { RENTAL_STATUS_LABELS, type CurrentRental, type RentalStatus } from "@/lib/types";

/** Item status: available, or who-has-it-until-when. */
export default function StatusTag({ available, rental }: { available: boolean; rental?: CurrentRental | null }) {
  if (available || !rental) {
    return <span className={available ? "tag" : "tag out"}>{available ? "Available" : "Rented out"}</span>;
  }
  if (rental.status === "OVERDUE") {
    return <span className="tag late">Overdue since {formatDate(rental.dueDate)}</span>;
  }
  if (rental.startDate > todayIso()) {
    return <span className="tag out">Reserved from {formatDate(rental.startDate)}</span>;
  }
  return <span className="tag out">Rented until {formatDate(rental.dueDate)}</span>;
}

const RENTAL_TAG_CLASS: Record<RentalStatus, string> = {
  ACTIVE: "tag out",
  OVERDUE: "tag late",
  RETURNED: "tag done",
};

export function RentalStatusTag({ status }: { status: RentalStatus }) {
  return <span className={RENTAL_TAG_CLASS[status]}>{RENTAL_STATUS_LABELS[status]}</span>;
}
