package com.josh.rental.config;

import com.josh.rental.item.Item;
import com.josh.rental.item.ItemCategory;
import com.josh.rental.item.ItemRepository;
import com.josh.rental.rental.Rental;
import com.josh.rental.rental.RentalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Fills an empty database with the equipment pool on startup, so the app is usable right away.
 * Does nothing if there are already items, so it never overwrites real data.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ItemRepository items;
    private final RentalRepository rentals;

    public DataSeeder(ItemRepository items, RentalRepository rentals) {
        this.items = items;
        this.rentals = rentals;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (items.count() > 0) {
            return;
        }
        LocalDate today = LocalDate.now();

        item("Basketball", ItemCategory.SPORTS, "Size 7 indoor/outdoor ball, pump included.", "3.00", 7, "2024-09-02");
        item("Football", ItemCategory.SPORTS, "Size 5 match ball.", "3.00", 7, "2024-09-02");
        Item rackets = item("Tennis rackets (pair)", ItemCategory.SPORTS, "Two rackets and a tube of 3 balls.", "5.00", 5, "2023-05-14");
        Item laptop = item("Laptop", ItemCategory.ELECTRONICS, "14\" Windows laptop with charger. Wiped after every rental.", "15.00", 14, "2024-01-20");
        item("Projector", ItemCategory.ELECTRONICS, "Full HD projector with HDMI cable and remote.", "12.00", 3, "2023-11-08");
        item("Camera", ItemCategory.ELECTRONICS, "Mirrorless camera with 18-55mm lens, 64 GB card and spare battery.", "20.00", 7, "2024-03-30");
        item("Cordless drill", ItemCategory.TOOLS, "18V drill with two batteries and a bit set.", "6.50", 3, "2024-06-11");
        item("Ladder", ItemCategory.TOOLS, "3-section aluminium ladder, 5.6 m fully extended.", "8.00", 2, "2022-08-19");
        item("Tent (4 person)", ItemCategory.OUTDOOR, "Dome tent with pegs and groundsheet.", "10.00", 10, "2023-04-02");
        item("Camping stove", ItemCategory.OUTDOOR, "Single-burner gas stove. Gas canister not included.", "4.00", 10, "2023-04-02");
        item("Acoustic guitar", ItemCategory.MUSIC, "Full-size steel-string guitar with soft case and tuner.", "7.50", 14, "2022-12-10");
        item("Bluetooth speaker", ItemCategory.MUSIC, "Portable waterproof speaker, about 12 h battery.", "4.50", 7, "2024-07-01");

        // Two example rentals: one running, and one already past its due date
        // (still ACTIVE, so the overdue checker has something to flag on its first run)
        rental(laptop, "Emma Peeters", "emma.peeters@example.com", today.minusDays(2), 7);
        rental(rackets, "Lucas Janssens", "lucas.janssens@example.com", today.minusDays(6), 4);

        log.info("Seeded {} items and {} rentals", items.count(), rentals.count());
    }

    private Item item(String name, ItemCategory category, String description, String dailyPrice,
                      int maxRentalDays, String purchaseDate) {
        Item item = new Item();
        item.setName(name);
        item.setCategory(category);
        item.setDescription(description);
        item.setDailyPrice(new BigDecimal(dailyPrice));
        item.setMaxRentalDays(maxRentalDays);
        item.setPurchaseDate(LocalDate.parse(purchaseDate));
        return items.save(item);
    }

    private void rental(Item item, String name, String email, LocalDate startDate, int days) {
        Rental rental = new Rental();
        rental.setItem(item);
        rental.setRenterName(name);
        rental.setRenterEmail(email);
        rental.setStartDate(startDate);
        rental.setRentalDays(days);
        rental.setDueDate(startDate.plusDays(days));
        rentals.save(rental);
        item.setAvailable(false);
    }
}
