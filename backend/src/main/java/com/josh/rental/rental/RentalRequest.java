package com.josh.rental.rental;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

/**
 * What a client sends to rent an item or change a rental. Validation covers four data types:
 * String, LocalDate, Integer and Boolean. Rules that depend on the item (its max rental days)
 * or on today's date are checked in {@link RentalService}.
 */
public record RentalRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2-100 characters")
        String renterName,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        @Size(max = 254, message = "Email can be at most 254 characters")
        String renterEmail,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "Number of days is required")
        @Min(value = 1, message = "Rent for at least 1 day")
        @Max(value = 90, message = "Rent for at most 90 days")
        Integer rentalDays,

        @NotNull(message = "You must agree to the rental terms")
        @AssertTrue(message = "You must agree to the rental terms")
        Boolean agreedToTerms
) {
}
