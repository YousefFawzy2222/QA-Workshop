package services;

import models.Item;
import models.ItemStore;
import models.Restaurant;
import models.RestaurantStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    @Autowired
    private ItemStore itemStore;
    @Autowired
    private RestaurantStore restaurantStore;

    public static class ItemResult {
        public boolean success;
        public Item item;
        public List<Item> items;
        public String error;
        
        public ItemResult(boolean success, Item item, List<Item> items, String error) {
            this.success = success;
            this.item = item;
            this.items = items;
            this.error = error;
        }
    }

    public ItemResult addItem(Item data) {
        Restaurant restaurant = restaurantStore.findById(data.getRestaurantId());
        if (restaurant == null) {
            return new ItemResult(false, null, null, "Restaurant with ID " + data.getRestaurantId() + " not found");
        }

        if (!data.validateItem()) {
            return new ItemResult(false, null, null, "Invalid item data");
        }

        Item existing = itemStore.findByNameInRestaurant(data.getRestaurantId(), data.getItemName());
        if (existing != null) {
            return new ItemResult(false, null, null, "An item with this name already exists in this restaurant");
        }

        if (data.getIsOnDiscount()) {
            if (!data.validateItemOnDiscount()) {
                return new ItemResult(false, null, null, "Discount percentage must be between 1 and 100");
            }
        } else {
            data.setDiscountPercentage(0);
        }

        Item created = itemStore.add(data);
        return new ItemResult(true, created, null, null);
    }

    public ItemResult updateItem(int id, Item data) {
        Item existing = itemStore.findById(id);
        if (existing == null) {
            return new ItemResult(false, null, null, "Item not found");
        }

        if (data.getItemName() != null) existing.setItemName(data.getItemName());
        if (data.getItemCost() > 0) existing.setItemCost(data.getItemCost());
        existing.setItemQuantity(data.getItemQuantity());
        existing.setIsCombo(data.getIsCombo());
        if (data.getItemSize() != null) existing.setItemSize(data.getItemSize());
        if (data.getDescription() != null) existing.setDescription(data.getDescription());
        existing.setIsOnDiscount(data.getIsOnDiscount());
        if (data.getIsOnDiscount()) {
            existing.setDiscountPercentage(data.getDiscountPercentage());
        } else {
            existing.setDiscountPercentage(0);
        }

        if (!existing.validateItem()) {
             return new ItemResult(false, null, null, "Invalid item data");
        }

        if (data.getItemName() != null) {
            Item duplicate = itemStore.findByNameInRestaurant(existing.getRestaurantId(), data.getItemName());
            if (duplicate != null && duplicate.getId() != id) {
                return new ItemResult(false, null, null, "An item with this name already exists in this restaurant");
            }
        }

        if (existing.getIsOnDiscount() && !existing.validateItemOnDiscount()) {
            return new ItemResult(false, null, null, "Discount percentage must be between 1 and 100");
        }

        itemStore.update(id, existing);
        return new ItemResult(true, existing, null, null);
    }

    public ItemResult deleteItem(int id) {
        Item existing = itemStore.findById(id);
        if (existing == null) return new ItemResult(false, null, null, "Item not found");
        itemStore.remove(id);
        return new ItemResult(true, null, null, null);
    }

    public ItemResult getItemsByRestaurant(int restaurantId) {
        Restaurant restaurant = restaurantStore.findById(restaurantId);
        if (restaurant == null) return new ItemResult(false, null, null, "Restaurant not found");

        List<Item> items = itemStore.findByRestaurant(restaurantId);
        return new ItemResult(true, null, items, null);
    }
}
