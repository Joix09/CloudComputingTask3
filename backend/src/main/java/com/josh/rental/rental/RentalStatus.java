package com.josh.rental.rental;

import java.util.List;

public enum RentalStatus {
    ACTIVE,
    OVERDUE,
    RETURNED;

    public static final List<RentalStatus> OPEN = List.of(ACTIVE, OVERDUE);

    public boolean isOpen() {
        return this != RETURNED;
    }
}
