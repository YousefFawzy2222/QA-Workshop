package models;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Offer {
    private int id;
    private int menuItemId;
    private String offerName;
    private float discountPercentage;
    private float originalPrice;
    private float discountedPrice;
    private String startsAt;   // "yyyy-MM-dd" — matches frontend field name
    private String expiresAt;  // "yyyy-MM-dd" — matches frontend field name

    public Offer() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getMenuItemId() { return menuItemId; }
    public void setMenuItemId(int menuItemId) { this.menuItemId = menuItemId; }

    public String getOfferName() { return offerName; }
    public void setOfferName(String offerName) { this.offerName = offerName; }

    public float getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(float discountPercentage) { this.discountPercentage = discountPercentage; }

    public float getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(float originalPrice) { this.originalPrice = originalPrice; }

    public float getDiscountedPrice() { return discountedPrice; }
    public void setDiscountedPrice(float discountedPrice) { this.discountedPrice = discountedPrice; }

    public String getStartsAt() { return startsAt; }
    public void setStartsAt(String startsAt) { this.startsAt = startsAt; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    // Follows FA-FC-Offers flowchart: isExpired(): boolean
    // Get current system time -> Get endDate -> is current date > endDate? 
    // Yes -> return true (expired) | No -> return false (active)
    public boolean isExpired() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate end = LocalDate.parse(this.expiresAt, DateTimeFormatter.ISO_LOCAL_DATE);
            return now.isAfter(end);
        } catch (Exception e) {
            // If date parsing fails, consider it expired
            return true;
        }
    }

    // Follows FA-FC-Offers flowchart: getDiscountedPrice(): float
    // Is offer expired? -> Yes -> return original price
    // No -> call item.getDiscountedPrice() -> return discounted price
    public float calculateDiscountedPrice() {
        if (isExpired()) {
            return originalPrice;
        }
        if (discountPercentage <= 0 || discountPercentage > 100) {
            return originalPrice;
        }
        return originalPrice * (1 - (discountPercentage / 100));
    }

    // Follows class diagram: validateOffer(): void
    public boolean validateOffer() {
        if (discountPercentage <= 0 || discountPercentage > 100) return false;
        if (startsAt == null || startsAt.trim().isEmpty()) return false;
        if (expiresAt == null || expiresAt.trim().isEmpty()) return false;

        try {
            LocalDate start = LocalDate.parse(startsAt, DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDate end = LocalDate.parse(expiresAt, DateTimeFormatter.ISO_LOCAL_DATE);
            if (end.isBefore(start)) return false;
        } catch (Exception e) {
            return false;
        }

        return true;
    }
}
