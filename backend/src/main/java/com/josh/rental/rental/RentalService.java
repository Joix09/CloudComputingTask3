package com.josh.rental.rental;

import com.josh.rental.common.FieldValidationException;
import com.josh.rental.common.NotFoundException;
import com.josh.rental.item.Item;
import com.josh.rental.item.ItemRepository;
import com.josh.rental.receipt.ReceiptService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;

@Service
@Transactional
public class RentalService {

    /** How far ahead a rental can be booked. */
    static final int MAX_DAYS_AHEAD = 14;

    private final RentalRepository rentals;
    private final ItemRepository items;
    private final ReceiptService receipts;

    public RentalService(RentalRepository rentals, ItemRepository items, ReceiptService receipts) {
        this.rentals = rentals;
        this.items = items;
        this.receipts = receipts;
    }

    @Transactional(readOnly = true)
    public Page<RentalResponse> list(RentalStatus status, Pageable pageable) {
        Page<Rental> page = status == null ? rentals.findAll(pageable) : rentals.findByStatus(status, pageable);
        return page.map(RentalResponse::from);
    }

    @Transactional(readOnly = true)
    public RentalResponse get(Long id) {
        return RentalResponse.from(find(id));
    }

    public RentalResponse create(Long itemId, RentalRequest request) {
        // Row lock: if two people rent the same item at the same moment, the second one waits and then sees it's taken
        Item item = items.findForUpdate(itemId)
                .orElseThrow(() -> new NotFoundException("Item " + itemId + " not found"));
        if (!item.isAvailable()) {
            String until = rentals.findFirstByItemIdAndStatusIn(itemId, RentalStatus.OPEN)
                    .map(r -> " until " + r.getDueDate())
                    .orElse("");
            throw new IllegalStateException(item.getName() + " is already rented out" + until);
        }
        checkStartDate(request.startDate(), null);
        checkRentalDays(item, request.rentalDays());

        Rental rental = new Rental();
        rental.setItem(item);
        apply(rental, request);
        item.setAvailable(false);
        rentals.save(rental);
        receipts.save(rental);
        return RentalResponse.from(rental);
    }

    public RentalResponse update(Long id, RentalRequest request) {
        Rental rental = find(id);
        if (!rental.getStatus().isOpen()) {
            throw new IllegalStateException("Rental " + id + " has already been returned and can't be changed");
        }
        checkStartDate(request.startDate(), rental.getStartDate());
        checkRentalDays(rental.getItem(), request.rentalDays());
        apply(rental, request);
        receipts.save(rental);
        return RentalResponse.from(rental);
    }

    public RentalResponse markReturned(Long id) {
        Rental rental = find(id);
        if (!rental.getStatus().isOpen()) {
            throw new IllegalStateException("Rental " + id + " has already been returned");
        }
        rental.setStatus(RentalStatus.RETURNED);
        rental.setReturnedAt(Instant.now());
        rental.getItem().setAvailable(true);
        receipts.save(rental);
        return RentalResponse.from(rental);
    }

    /** Deleting an open rental cancels it, which puts the item back on the shelf. */
    public void delete(Long id) {
        Rental rental = find(id);
        if (rental.getStatus().isOpen()) {
            rental.getItem().setAvailable(true);
        }
        rentals.delete(rental);
        receipts.delete(id);
    }

    /** The receipt PDF from Blob Storage. */
    @Transactional(readOnly = true)
    public byte[] receipt(Long id) {
        return receipts.get(find(id));
    }

    private Rental find(Long id) {
        return rentals.findById(id)
                .orElseThrow(() -> new NotFoundException("Rental " + id + " not found"));
    }

    /** On update, an unchanged start date is fine even if it's now in the past. */
    private void checkStartDate(LocalDate startDate, LocalDate currentStartDate) {
        if (startDate.equals(currentStartDate)) {
            return;
        }
        LocalDate today = LocalDate.now();
        if (startDate.isBefore(today)) {
            throw new FieldValidationException("startDate", "Start date cannot be in the past");
        }
        if (startDate.isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new FieldValidationException("startDate",
                    "Start date can be at most " + MAX_DAYS_AHEAD + " days from today");
        }
    }

    private void checkRentalDays(Item item, int rentalDays) {
        if (rentalDays > item.getMaxRentalDays()) {
            throw new FieldValidationException("rentalDays",
                    item.getName() + " can be rented for at most " + item.getMaxRentalDays() + " days");
        }
    }

    private void apply(Rental rental, RentalRequest request) {
        rental.setRenterName(request.renterName().trim());
        rental.setRenterEmail(request.renterEmail().trim().toLowerCase());
        rental.setStartDate(request.startDate());
        rental.setRentalDays(request.rentalDays());
        rental.setDueDate(request.startDate().plusDays(request.rentalDays()));
        // Extending an overdue rental makes it active again
        rental.setStatus(rental.getDueDate().isBefore(LocalDate.now()) ? RentalStatus.OVERDUE : RentalStatus.ACTIVE);
    }
}
