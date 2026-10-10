package com.josh.rental.item;

import com.josh.rental.rental.Rental;
import com.josh.rental.rental.RentalStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/** What the API returns. Keeps the entity itself out of the public contract. */
public record ItemResponse(
        Long id,
        String name,
        String description,
        ItemCategory category,
        BigDecimal dailyPrice,
        Integer maxRentalDays,
        LocalDate purchaseDate,
        boolean available,
        /** Who has the item right now and until when; null when it's available. */
        CurrentRental currentRental,
        Instant createdAt,
        Instant updatedAt
) {
    public record CurrentRental(Long id, String renterName, LocalDate startDate, LocalDate dueDate, RentalStatus status) {
        static CurrentRental from(Rental rental) {
            return rental == null ? null : new CurrentRental(
                    rental.getId(), rental.getRenterName(), rental.getStartDate(), rental.getDueDate(), rental.getStatus());
        }
    }

    public static ItemResponse from(Item item, Rental currentRental) {
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getDailyPrice(),
                item.getMaxRentalDays(),
                item.getPurchaseDate(),
                item.isAvailable(),
                CurrentRental.from(currentRental),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
