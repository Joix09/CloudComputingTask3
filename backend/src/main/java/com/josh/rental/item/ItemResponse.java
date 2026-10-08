package com.josh.rental.item;

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
        Instant createdAt,
        Instant updatedAt
) {
    public static ItemResponse from(Item item) {
        return new ItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getDailyPrice(),
                item.getMaxRentalDays(),
                item.getPurchaseDate(),
                item.isAvailable(),
                item.getCreatedAt(),
                item.getUpdatedAt());
    }
}
