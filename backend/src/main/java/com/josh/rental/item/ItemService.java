package com.josh.rental.item;

import com.josh.rental.common.NotFoundException;
import com.josh.rental.rental.Rental;
import com.josh.rental.rental.RentalRepository;
import com.josh.rental.rental.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {

    private final ItemRepository repository;
    private final RentalRepository rentals;

    public ItemService(ItemRepository repository, RentalRepository rentals) {
        this.repository = repository;
        this.rentals = rentals;
    }

    @Transactional(readOnly = true)
    public Page<ItemResponse> list(ItemCategory category, Boolean available, Pageable pageable) {
        Page<Item> page;
        if (category != null && available != null) {
            page = repository.findByCategoryAndAvailable(category, available, pageable);
        } else if (category != null) {
            page = repository.findByCategory(category, pageable);
        } else if (available != null) {
            page = repository.findByAvailable(available, pageable);
        } else {
            page = repository.findAll(pageable);
        }
        // One query for the open rentals of the whole page instead of one per item
        Map<Long, Rental> openRentals = rentals
                .findByItemIdInAndStatusIn(page.map(Item::getId).getContent(), RentalStatus.OPEN).stream()
                .collect(Collectors.toMap(r -> r.getItem().getId(), Function.identity(), (a, b) -> a));
        return page.map(item -> ItemResponse.from(item, openRentals.get(item.getId())));
    }

    @Transactional(readOnly = true)
    public ItemResponse get(Long id) {
        return toResponse(find(id));
    }

    public ItemResponse create(ItemRequest request) {
        Item item = new Item();
        apply(item, request);
        return ItemResponse.from(repository.save(item), null);
    }

    public ItemResponse update(Long id, ItemRequest request) {
        Item item = find(id);
        apply(item, request);
        return toResponse(item);
    }

    public void delete(Long id) {
        Item item = find(id);
        if (!item.isAvailable()) {
            throw new IllegalStateException("Item is currently rented out and cannot be deleted");
        }
        // Only returned rentals are left at this point; they're history of an item that no longer exists
        rentals.deleteByItemId(id);
        repository.delete(item);
    }

    private ItemResponse toResponse(Item item) {
        Rental open = rentals.findFirstByItemIdAndStatusIn(item.getId(), RentalStatus.OPEN).orElse(null);
        return ItemResponse.from(item, open);
    }

    private Item find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Item " + id + " not found"));
    }

    private void apply(Item item, ItemRequest request) {
        item.setName(request.name().trim());
        item.setDescription(request.description() == null || request.description().isBlank()
                ? null : request.description().trim());
        item.setCategory(request.category());
        item.setDailyPrice(request.dailyPrice());
        item.setMaxRentalDays(request.maxRentalDays());
        item.setPurchaseDate(request.purchaseDate());
    }
}
