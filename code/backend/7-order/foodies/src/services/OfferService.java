package services;

import models.Item;
import models.ItemStore;
import models.Offer;
import models.OfferStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfferService {

    @Autowired
    private OfferStore offerStore;

    @Autowired
    private ItemStore itemStore;

    public static class OfferResult {
        public boolean success;
        public Offer offer;
        public List<Offer> offers;
        public String error;

        public OfferResult(boolean success, Offer offer, List<Offer> offers, String error) {
            this.success = success;
            this.offer = offer;
            this.offers = offers;
            this.error = error;
        }
    }

    public OfferResult getAllOffers() {
        return new OfferResult(true, null, offerStore.findAll(), null);
    }

    public OfferResult getActiveOffers() {
        List<Offer> all = offerStore.findAll();
        List<Offer> active = all.stream()
                .filter(o -> !o.isExpired())
                .collect(Collectors.toList());
        return new OfferResult(true, null, active, null);
    }

    public OfferResult getOffersByMenuItem(int menuItemId) {
        Item item = itemStore.findById(menuItemId);
        if (item == null) {
            return new OfferResult(false, null, null, "Menu item not found");
        }
        return new OfferResult(true, null, offerStore.findByMenuItem(menuItemId), null);
    }

    // Admin: createPromotion(Offers): void — from class diagram
    public OfferResult createOffer(Offer data) {
        // Validate offer
        if (!data.validateOffer()) {
            return new OfferResult(false, null, null, "Invalid offer data. Check discount percentage (1-100) and date format (yyyy-MM-dd).");
        }

        // Validate menu item exists
        Item item = itemStore.findById(data.getMenuItemId());
        if (item == null) {
            return new OfferResult(false, null, null, "Menu item with ID " + data.getMenuItemId() + " not found");
        }

        // Set original price from the item if not provided
        if (data.getOriginalPrice() <= 0) {
            data.setOriginalPrice(item.getItemCost());
        }

        // Check if there's already an active offer for this item
        List<Offer> existing = offerStore.findByMenuItem(data.getMenuItemId());
        for (Offer o : existing) {
            if (!o.isExpired()) {
                return new OfferResult(false, null, null, "An active offer already exists for this menu item");
            }
        }

        Offer created = offerStore.add(data);
        return new OfferResult(true, created, null, null);
    }

    // Admin: editPromotion(Offers): void — from class diagram
    public OfferResult updateOffer(int id, Offer data) {
        Offer existing = offerStore.findById(id);
        if (existing == null) {
            return new OfferResult(false, null, null, "Offer not found");
        }

        if (data.getMenuItemId() > 0) existing.setMenuItemId(data.getMenuItemId());
        if (data.getOfferName() != null) existing.setOfferName(data.getOfferName());
        if (data.getDiscountPercentage() > 0) existing.setDiscountPercentage(data.getDiscountPercentage());
        if (data.getOriginalPrice() > 0) existing.setOriginalPrice(data.getOriginalPrice());
        if (data.getStartsAt() != null) existing.setStartsAt(data.getStartsAt());
        if (data.getExpiresAt() != null) existing.setExpiresAt(data.getExpiresAt());

        if (!existing.validateOffer()) {
            return new OfferResult(false, null, null, "Invalid offer data after update");
        }

        offerStore.update(id, existing);
        Offer updated = offerStore.findById(id);
        return new OfferResult(true, updated, null, null);
    }

    public OfferResult deleteOffer(int id) {
        Offer existing = offerStore.findById(id);
        if (existing == null) {
            return new OfferResult(false, null, null, "Offer not found");
        }
        offerStore.remove(id);
        return new OfferResult(true, null, null, null);
    }
}
