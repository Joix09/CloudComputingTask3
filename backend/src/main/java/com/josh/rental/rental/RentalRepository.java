package com.josh.rental.rental;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    // @EntityGraph loads the item in the same query, since every response includes the item's name
    @Override
    @EntityGraph(attributePaths = "item")
    Page<Rental> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "item")
    Page<Rental> findByStatus(RentalStatus status, Pageable pageable);

    Optional<Rental> findFirstByItemIdAndStatusIn(Long itemId, Collection<RentalStatus> statuses);

    List<Rental> findByItemIdInAndStatusIn(Collection<Long> itemIds, Collection<RentalStatus> statuses);

    List<Rental> findByItemId(Long itemId);
}
