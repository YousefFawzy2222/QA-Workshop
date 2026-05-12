package models;

public class Item {
    private int id;
    private int restaurantId;
    private String itemName;
    private float itemCost;
    private int itemQuantity;
    private boolean isCombo;
    private String itemSize;
    private boolean isOnDiscount;
    private float discountPercentage;
    private String description;

    public Item() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getRestaurantId() { return restaurantId; }
    public void setRestaurantId(int restaurantId) { this.restaurantId = restaurantId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public float getItemCost() { return itemCost; }
    public void setItemCost(float itemCost) { this.itemCost = itemCost; }

    public int getItemQuantity() { return itemQuantity; }
    public void setItemQuantity(int itemQuantity) { this.itemQuantity = itemQuantity; }

    public boolean getIsCombo() { return isCombo; }
    public void setIsCombo(boolean isCombo) { this.isCombo = isCombo; }

    public String getItemSize() { return itemSize; }
    public void setItemSize(String itemSize) { this.itemSize = itemSize; }

    public boolean getIsOnDiscount() { return isOnDiscount; }
    public void setIsOnDiscount(boolean isOnDiscount) { this.isOnDiscount = isOnDiscount; }

    public float getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(float discountPercentage) { this.discountPercentage = discountPercentage; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean validateItem() {
        if (itemName == null || itemName.trim().isEmpty()) return false;
        if (itemCost < 0) return false;
        if (itemQuantity < 0) return false;
        if (itemSize == null || itemSize.trim().isEmpty()) return false;
        return true;
    }

    public boolean validateItemOnDiscount() {
        if (discountPercentage <= 0 || discountPercentage > 100) return false;
        return true;
    }

    public float getDiscountedPrice() {
        if (!isOnDiscount || discountPercentage <= 0) return itemCost;
        return itemCost * (1 - (discountPercentage / 100));
    }

    public void addItem() {
        // Present in Class Diagram, implementation handled via Store
    }
}
