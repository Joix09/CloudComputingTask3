package com.josh.rental.item;

import com.josh.rental.common.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ItemService {

    private final ItemRepository repository;

    public ItemService(ItemRepository repository) {
        this.repository = repository;
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
        return page.map(ItemResponse::from);
    }

    @Transactional(readOnly = true)
    public ItemResponse get(Long id) {
        return ItemResponse.from(find(id));
    }

    public ItemResponse create(ItemRequest request) {
        Item item = new Item();
        apply(item, request);
        return ItemResponse.from(repository.save(item));
    }

    public ItemResponse update(Long id, ItemRequest request) {
        Item item = find(id);
        apply(item, request);
        return ItemResponse.from(item);
    }

    public void delete(Long id) {
        Item item = find(id);
        if (!item.isAvailable()) {
            throw new IllegalStateException("Item is currently rented out and cannot be deleted");
        }
        repository.delete(item);
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
