package com.josh.rental.rental;

import com.josh.rental.item.Item;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false, length = 100)
    private String renterName;

    @Column(nullable = false, length = 254)
    private String renterEmail;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private Integer rentalDays;

    /** startDate + rentalDays: the day the item has to be back. */
    @Column(nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RentalStatus status = RentalStatus.ACTIVE;

    private Instant returnedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Item getItem() { return item; }
    public void setItem(Item item) { this.item = item; }
    public String getRenterName() { return renterName; }
    public void setRenterName(String renterName) { this.renterName = renterName; }
    public String getRenterEmail() { return renterEmail; }
    public void setRenterEmail(String renterEmail) { this.renterEmail = renterEmail; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public Integer getRentalDays() { return rentalDays; }
    public void setRentalDays(Integer rentalDays) { this.rentalDays = rentalDays; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public RentalStatus getStatus() { return status; }
    public void setStatus(RentalStatus status) { this.status = status; }
    public Instant getReturnedAt() { return returnedAt; }
    public void setReturnedAt(Instant returnedAt) { this.returnedAt = returnedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
