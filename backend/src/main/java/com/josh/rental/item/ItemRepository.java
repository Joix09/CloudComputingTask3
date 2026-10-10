package com.josh.rental.item;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Page<Item> findByCategory(ItemCategory category, Pageable pageable);

    Page<Item> findByAvailable(boolean available, Pageable pageable);

    Page<Item> findByCategoryAndAvailable(ItemCategory category, boolean available, Pageable pageable);

    /** SELECT ... FOR UPDATE: locks the row until the transaction ends, so an item can't be rented twice. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Item i where i.id = :id")
    Optional<Item> findForUpdate(@Param("id") Long id);
}
