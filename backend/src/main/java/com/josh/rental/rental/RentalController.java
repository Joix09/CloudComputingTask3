package com.josh.rental.rental;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api")
@Tag(name = "Rentals", description = "Who has which item, and until when")
public class RentalController {

    private final RentalService service;

    public RentalController(RentalService service) {
        this.service = service;
    }

    @GetMapping("/rentals")
    @Operation(summary = "List rentals, optionally filtered by status")
    public Page<RentalResponse> list(
            @RequestParam(required = false) RentalStatus status,
            @PageableDefault(size = 20, sort = "dueDate", direction = Sort.Direction.ASC) Pageable pageable) {
        return service.list(status, pageable);
    }

    @GetMapping("/rentals/{id}")
    @Operation(summary = "Get one rental")
    public RentalResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping("/items/{itemId}/rentals")
    @Operation(summary = "Rent an item (409 if it is already rented out)")
    public ResponseEntity<RentalResponse> create(@PathVariable Long itemId, @Valid @RequestBody RentalRequest request) {
        RentalResponse created = service.create(itemId, request);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/rentals/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/rentals/{id}")
    @Operation(summary = "Change a rental, e.g. extend it (still limited to the item's max rental days)")
    public RentalResponse update(@PathVariable Long id, @Valid @RequestBody RentalRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/rentals/{id}/return")
    @Operation(summary = "Mark a rental as returned, which makes the item available again")
    public RentalResponse markReturned(@PathVariable Long id) {
        return service.markReturned(id);
    }

    @DeleteMapping("/rentals/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a rental (cancels it if the item is still out)")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
