package com.josh.rental.item;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * What a client sends to create or update an item. Validation covers five data types:
 * String, enum, BigDecimal, Integer and LocalDate.
 */
public record ItemRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
        String name,

        @Size(max = 500, message = "Description can be at most 500 characters")
        String description,

        @NotNull(message = "Category is required")
        ItemCategory category,

        @NotNull(message = "Daily price is required")
        @DecimalMin(value = "0.00", message = "Daily price cannot be negative")
        @DecimalMax(value = "10000.00", message = "Daily price can be at most 10000")
        @Digits(integer = 5, fraction = 2, message = "Daily price can have at most 2 decimals")
        BigDecimal dailyPrice,

        @NotNull(message = "Max rental days is required")
        @Min(value = 1, message = "Max rental days must be at least 1")
        @Max(value = 90, message = "Max rental days can be at most 90")
        Integer maxRentalDays,

        @NotNull(message = "Purchase date is required")
        @PastOrPresent(message = "Purchase date cannot be in the future")
        LocalDate purchaseDate
) {
}
