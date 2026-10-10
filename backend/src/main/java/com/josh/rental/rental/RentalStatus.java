package com.josh.rental.rental;

import java.util.List;

public enum RentalStatus {
    /** Item is out and not yet due back. */
    ACTIVE,
    /** Item is still out after its due date. Set by the overdue checker (Azure Function). */
    OVERDUE,
    /** Item has been handed back. */
    RETURNED;

    /** Statuses where the item is still out with the renter. */
    public static final List<RentalStatus> OPEN = List.of(ACTIVE, OVERDUE);

    public boolean isOpen() {
        return this != RETURNED;
    }
}
