package com.josh.rental.receipt;

import com.josh.rental.rental.Rental;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ReceiptService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptService.class);

    private final ReceiptStorage storage;

    public ReceiptService(ReceiptStorage storage) {
        this.storage = storage;
    }

    public void save(Rental rental) {
        try {
            storage.upload(blobName(rental.getId()), ReceiptPdf.render(rental));
        } catch (RuntimeException e) {
            log.warn("Could not save receipt for rental {}: {}", rental.getId(), e.getMessage());
        }
    }

    public byte[] get(Rental rental) {
        return storage.download(blobName(rental.getId())).orElseGet(() -> {
            byte[] pdf = ReceiptPdf.render(rental);
            storage.upload(blobName(rental.getId()), pdf);
            return pdf;
        });
    }

    public void delete(Long rentalId) {
        try {
            storage.delete(blobName(rentalId));
        } catch (RuntimeException e) {
            log.warn("Could not delete receipt for rental {}: {}", rentalId, e.getMessage());
        }
    }

    private static String blobName(Long rentalId) {
        return "rental-" + rentalId + ".pdf";
    }
}
