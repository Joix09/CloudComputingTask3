package com.josh.rental.item;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByCategory(ItemCategory category, Pageable pageable);

    Page<Item> findByAvailable(boolean available, Pageable pageable);

    Page<Item> findByCategoryAndAvailable(ItemCategory category, boolean available, Pageable pageable);
}
