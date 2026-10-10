package com.josh.rental.receipt;

import com.josh.rental.rental.Rental;
import com.josh.rental.rental.RentalStatus;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Draws a one-page A4 receipt for a rental. */
final class ReceiptPdf {

    private static final PDType1Font REGULAR = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private static final PDType1Font BOLD = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);
    private static final NumberFormat EUR = NumberFormat.getCurrencyInstance(Locale.GERMANY);

    private static final float MARGIN = 56;
    private static final float LABEL_X = MARGIN;
    private static final float VALUE_X = MARGIN + 150;

    private ReceiptPdf() {
    }

    static byte[] render(Rental rental) {
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            float top = page.getMediaBox().getHeight() - MARGIN;

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                text(cs, BOLD, 24, MARGIN, top, "Lending Desk");
                text(cs, REGULAR, 12, MARGIN, top - 22, "Rental receipt");
                text(cs, BOLD, 12, VALUE_X + 160, top, "Receipt R-%06d".formatted(rental.getId()));
                text(cs, REGULAR, 10, VALUE_X + 160, top - 16,
                        "Issued " + DATE.format(LocalDate.now(ZoneOffset.UTC)));

                line(cs, top - 40);

                float y = top - 70;
                y = row(cs, y, "Item", rental.getItem().getName());
                y = row(cs, y, "Rented by", rental.getRenterName());
                y = row(cs, y, "Email", rental.getRenterEmail());
                y -= 10;
                y = row(cs, y, "Pick-up date", DATE.format(rental.getStartDate()));
                y = row(cs, y, "Return by", DATE.format(rental.getDueDate()));
                y = row(cs, y, "Rental length", rental.getRentalDays() + (rental.getRentalDays() == 1 ? " day" : " days"));
                y = row(cs, y, "Status", status(rental));
                y -= 10;

                BigDecimal perDay = rental.getItem().getDailyPrice();
                BigDecimal total = perDay.multiply(BigDecimal.valueOf(rental.getRentalDays()));
                y = row(cs, y, "Price per day", EUR.format(perDay));
                line(cs, y + 6);
                y -= 14;
                text(cs, BOLD, 14, LABEL_X, y, "Total");
                text(cs, BOLD, 14, VALUE_X, y, EUR.format(total));

                text(cs, REGULAR, 9, MARGIN, MARGIN + 12,
                        "The renter agreed to return the item on time and in the same condition.");
                text(cs, REGULAR, 9, MARGIN, MARGIN, "Lending Desk rental #" + rental.getId());
            }
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create receipt for rental " + rental.getId(), e);
        }
    }

    private static String status(Rental rental) {
        if (rental.getStatus() == RentalStatus.RETURNED && rental.getReturnedAt() != null) {
            return "Returned on " + DATE.format(rental.getReturnedAt().atZone(ZoneOffset.UTC));
        }
        return rental.getStatus() == RentalStatus.OVERDUE ? "Overdue" : "Active";
    }

    private static float row(PDPageContentStream cs, float y, String label, String value) throws IOException {
        text(cs, REGULAR, 11, LABEL_X, y, label);
        text(cs, BOLD, 11, VALUE_X, y, value);
        return y - 20;
    }

    private static void line(PDPageContentStream cs, float y) throws IOException {
        cs.setLineWidth(0.75f);
        cs.moveTo(MARGIN, y);
        cs.lineTo(PDRectangle.A4.getWidth() - MARGIN, y);
        cs.stroke();
    }

    private static void text(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String value)
            throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(printable(font, value));
        cs.endText();
    }

    /** The built-in PDF fonts only cover Western European characters; anything else becomes "?". */
    private static String printable(PDType1Font font, String value) {
        StringBuilder sb = new StringBuilder(value.length());
        value.codePoints().forEach(cp -> {
            String ch = new String(Character.toChars(cp));
            try {
                font.encode(ch);
                sb.append(ch);
            } catch (IOException | IllegalArgumentException e) {
                sb.append('?');
            }
        });
        return sb.toString();
    }
}
