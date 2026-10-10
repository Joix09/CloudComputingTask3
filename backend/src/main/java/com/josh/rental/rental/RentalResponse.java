package com.josh.rental.rental;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record RentalResponse(
        Long id,
        Long itemId,
        String itemName,
        String renterName,
        String renterEmail,
        LocalDate startDate,
        Integer rentalDays,
        LocalDate dueDate,
        RentalStatus status,
        BigDecimal totalPrice,
        Instant returnedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static RentalResponse from(Rental rental) {
        return new RentalResponse(
                rental.getId(),
                rental.getItem().getId(),
                rental.getItem().getName(),
                rental.getRenterName(),
                rental.getRenterEmail(),
                rental.getStartDate(),
                rental.getRentalDays(),
                rental.getDueDate(),
                rental.getStatus(),
                rental.getItem().getDailyPrice().multiply(BigDecimal.valueOf(rental.getRentalDays())),
                rental.getReturnedAt(),
                rental.getCreatedAt(),
                rental.getUpdatedAt());
    }
}
