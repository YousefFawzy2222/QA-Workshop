package services;

import models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderStore orderStore;

    @Autowired
    private OrderItemStore orderItemStore;

    @Autowired
    private UserStore userStore;

    @Autowired
    private RestaurantStore restaurantStore;

    @Autowired
    private AddressStore addressStore;

    @Autowired
    private ItemStore itemStore;

    // Loyalty constants from class diagram
    private static final float ACCRUAL_RATE = 0.1f;
    private static final float EGP_PER_POINT = 0.01f;
    private static final int MIN_REDEEMABLE_POINTS = 1000;

    public static class OrderResult {
        public boolean success;
        public Order order;
        public List<Order> orders;
        public String error;

        public OrderResult(boolean success, Order order, List<Order> orders, String error) {
            this.success = success;
            this.order = order;
            this.orders = orders;
            this.error = error;
        }
    }

    // Request DTO for placing an order
    public static class PlaceOrderRequest {
        public int restaurantId;
        public Integer addressId;
        public boolean usePoints;
        public List<CartItem> items;
    }

    public static class CartItem {
        public int menuItemId;
        public int quantity;
    }

    // FA-FC-Checkout flowchart: placeOrder(): Order
    public OrderResult placeOrder(String userEmail, PlaceOrderRequest request) {
        try {
            // Step 1: Call validateAddress - is address valid?
            if (request.addressId != null) {
                AddressOfUser address = addressStore.findById(request.addressId);
                if (address == null) {
                    return new OrderResult(false, null, null, "Delivery address not found");
                }
                // Call AddressOfUser.validateUserInfo() and validatePhoneNumber()
                if (!address.validateUserInfo()) {
                    return new OrderResult(false, null, null, "Invalid address information");
                }
                if (!address.validatePhoneNumber()) {
                    return new OrderResult(false, null, null, "Invalid phone number on delivery address");
                }
            }

            // Validate restaurant exists
            Restaurant restaurant = restaurantStore.findById(request.restaurantId);
            if (restaurant == null) {
                return new OrderResult(false, null, null, "Restaurant not found");
            }

            // Validate user exists
            User user = userStore.findByEmail(userEmail);
            if (user == null) {
                return new OrderResult(false, null, null, "User not found");
            }

            // Validate items
            if (request.items == null || request.items.isEmpty()) {
                return new OrderResult(false, null, null, "Order must contain at least one item");
            }

            // Step 2: Call calculateTotal()
            // Get cart.subtotal - loop items and calculate
            // Get currentRestaurant.restDeliveryCost as deliveryFee
            float deliveryFee = restaurant.getRestDeliveryCost();
            float subTotal = 0;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : request.items) {
                Item menuItem = itemStore.findById(cartItem.menuItemId);
                if (menuItem == null) {
                    return new OrderResult(false, null, null, "Menu item with ID " + cartItem.menuItemId + " not found");
                }

                // FA-FC-Order: is item on discount? -> call getDiscountedPrice() : use itemCost
                float unitPrice;
                if (menuItem.getIsOnDiscount()) {
                    unitPrice = menuItem.getDiscountedPrice();
                } else {
                    unitPrice = menuItem.getItemCost();
                }

                subTotal += (unitPrice * cartItem.quantity);

                OrderItem orderItem = new OrderItem();
                orderItem.setMenuItemId(cartItem.menuItemId);
                orderItem.setQuantity(cartItem.quantity);
                orderItem.setUnitPrice(unitPrice);
                orderItems.add(orderItem);
            }

            // total = subtotal + deliveryFee
            float total = subTotal + deliveryFee;
            int pointsRedeemed = 0;

            // Step 3: Is usePoints == true?
            if (request.usePoints) {
                // Call Loyalty.isRedeemable - enough points?
                if (isRedeemable(user.getLoyaltyPoints())) {
                    // Yes -> Call applyPoints to reduce total
                    float discount = applyPoints(user.getLoyaltyPoints());
                    total = total - discount;
                    pointsRedeemed = user.getLoyaltyPoints();

                    // Is total < 0? -> Set total = 0
                    if (total < 0) {
                        total = 0;
                    }

                    // Deduct points from user
                    userStore.updateLoyaltyPoints(userEmail, 0);
                }
                // No (not enough points) -> proceed without points (show error msg per flowchart, but continue)
            }

            // Step 4: Create new Order object
            Order order = new Order();
            order.setUserEmail(userEmail);
            order.setRestaurantId(request.restaurantId);
            order.setAddressId(request.addressId);
            order.setSubTotal(subTotal);
            order.setDeliveryFee(deliveryFee);
            order.setTotalPrice(total);
            order.setPointsRedeemed(pointsRedeemed);
            order.setStatus("placed");
            order.setPaymentMethod("COD");

            // Set placedAt = current time
            order.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            // Save order to DB
            Order savedOrder = orderStore.add(order);

            // Save order items
            orderItemStore.addAll(savedOrder.getId(), orderItems);

            // Step 5: Call Order.accruePoints
            // pointsEarned = trunc(subTotal * accrualRate)
            int pointsEarned = (int) (subTotal * ACCRUAL_RATE);
            savedOrder.setPointsEarned(pointsEarned);

            // Add pointsEarned to user's loyalty balance
            userStore.addLoyaltyPoints(userEmail, pointsEarned);

            // Set items on order for response
            savedOrder.setItems(orderItemStore.findByOrder(savedOrder.getId()));

            // Step 6: Return Order
            return new OrderResult(true, savedOrder, null, null);

        } catch (Exception e) {
            System.err.println("Place Order Error: " + e.getMessage());
            e.printStackTrace();
            return new OrderResult(false, null, null, "Failed to place order: " + e.getMessage());
        }
    }

    // class diagram Loyalty: isRedeemable(): boolean
    // balance >= 1000 to enable
    private boolean isRedeemable(int pointsBalance) {
        return pointsBalance >= MIN_REDEEMABLE_POINTS;
    }

    // FA-FC-Checkout flowchart: applyPoints(): float
    // Get Loyalty.pointsBalance -> is pointsBalance >= 1000?
    // Yes -> Call Loyalty.getEGPValue to convert points to EGP
    //        discount = points EGP value -> Return discount amount
    // No -> Return 0 (no discount applied)
    private float applyPoints(int pointsBalance) {
        if (pointsBalance >= MIN_REDEEMABLE_POINTS) {
            // Loyalty.getEGPValue(): pointsBalance * egpPerPoint
            return pointsBalance * EGP_PER_POINT;
        }
        return 0;
    }

    // Get user's order history
    public OrderResult getUserOrders(String userEmail) {
        try {
            List<Order> orders = orderStore.findByUser(userEmail);
            // Enrich each order with its items
            for (Order order : orders) {
                order.setItems(orderItemStore.findByOrder(order.getId()));
            }
            return new OrderResult(true, null, orders, null);
        } catch (Exception e) {
            return new OrderResult(false, null, null, "Failed to fetch orders: " + e.getMessage());
        }
    }

    // Get specific order details
    public OrderResult getOrderById(int orderId, String userEmail) {
        try {
            Order order = orderStore.findById(orderId);
            if (order == null) {
                return new OrderResult(false, null, null, "Order not found");
            }
            if (!order.getUserEmail().equalsIgnoreCase(userEmail)) {
                return new OrderResult(false, null, null, "Unauthorized");
            }
            order.setItems(orderItemStore.findByOrder(orderId));
            return new OrderResult(true, order, null, null);
        } catch (Exception e) {
            return new OrderResult(false, null, null, "Failed to fetch order: " + e.getMessage());
        }
    }
}
