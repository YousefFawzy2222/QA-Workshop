package models;

import java.util.List;

public class Order {
    private int id;
    private String userEmail;
    private int restaurantId;
    private Integer addressId;  // nullable
    private float subTotal;
    private float deliveryFee;
    private float totalPrice;
    private int pointsRedeemed;
    private int pointsEarned;
    private String status;
    private String createdAt;
    private String paymentMethod;

    // Transient fields (not stored in DB directly, used for response)
    private List<OrderItem> items;

    public Order() {
        this.paymentMethod = "COD";
        this.status = "placed";
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getRestaurantId() { return restaurantId; }
    public void setRestaurantId(int restaurantId) { this.restaurantId = restaurantId; }

    public Integer getAddressId() { return addressId; }
    public void setAddressId(Integer addressId) { this.addressId = addressId; }

    public float getSubTotal() { return subTotal; }
    public void setSubTotal(float subTotal) { this.subTotal = subTotal; }

    public float getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(float deliveryFee) { this.deliveryFee = deliveryFee; }

    public float getTotalPrice() { return totalPrice; }
    public void setTotalPrice(float totalPrice) { this.totalPrice = totalPrice; }

    public int getPointsRedeemed() { return pointsRedeemed; }
    public void setPointsRedeemed(int pointsRedeemed) { this.pointsRedeemed = pointsRedeemed; }

    public int getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(int pointsEarned) { this.pointsEarned = pointsEarned; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    // FA-FC-Order flowchart: calculateTotal(): float
    // Initialize itemsTotal = 0
    // Loop through each item -> is item on discount? 
    //   Yes -> call item.getDiscountedPrice()
    //   No -> use item.itemCost
    // Add (price * item.itemQuantity) to itemsTotal
    // orderTotal = itemsTotal + deliveryFee
    // Return orderTotal
    public float calculateTotal(List<Item> cartItems, float deliveryFee) {
        float itemsTotal = 0;

        for (Item item : cartItems) {
            float price;
            if (item.getIsOnDiscount()) {
                // Call item.getDiscountedPrice()
                price = item.getDiscountedPrice();
            } else {
                // Use item.itemCost
                price = item.getItemCost();
            }
            itemsTotal += (price * item.getItemQuantity());
        }

        float orderTotal = itemsTotal + deliveryFee;
        return orderTotal;
    }

    // FA-FC-Order flowchart: accruePoints(): int
    // Get orderTotal -> Calculate pointsEarned = trunc(orderTotal * accrualRate)
    // Set pointsEarned on Order -> Add pointsEarned to user's Loyalty.pointsBalance
    // Return pointsEarned
    public int accruePoints() {
        float accrualRate = 0.1f;
        int earned = (int) (this.totalPrice * accrualRate);
        this.pointsEarned = earned;
        return earned;
    }
}
