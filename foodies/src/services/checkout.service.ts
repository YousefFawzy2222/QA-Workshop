// ─── Checkout Service ────────────────────────────────────────────────────────
// Class Diagram: CheckOut → placeOrder(), applyPoints(), validateAddress(), calculateTotal()

import { CartStore } from '../models/cart.model';
import { CheckoutStore } from '../models/checkout.model';
import { LoyaltyStore } from '../models/loyalty.model';
import { OrderStore, Order } from '../models/order.model';
import { OrderItemStore } from '../models/order-item.model';
import { RestaurantStore } from '../models/restaurant.model';
import { AddressStore } from '../models/address.model';
import { UserStore } from '../models/user.model';

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export async function placeOrder(
  userEmail: string,
  addressId: number | null,
  usePoints: boolean,
  pointsToRedeem: number
): Promise<CheckoutResult> {
  // Get user's cart
  const cart = CartStore.getCart(userEmail);
  if (cart.items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }

  // Validate single restaurant
  if (!CartStore.validateSingleRestaurant(cart)) {
    return { success: false, error: 'Cart contains items from multiple restaurants' };
  }

  // Validate address
  if (addressId) {
    const address = await AddressStore.findById(addressId);
    if (!address || address.userEmail !== userEmail) {
      return { success: false, error: 'Invalid delivery address' };
    }
  }

  // Get restaurant for delivery fee
  const restaurant = await RestaurantStore.findById(cart.currentRestaurantId!);
  if (!restaurant) {
    return { success: false, error: 'Restaurant not found' };
  }

  const deliveryFee = restaurant.restDeliveryCost;

  // Apply loyalty points
  let pointsDiscount = 0;
  let pointsUsed = 0;
  if (usePoints) {
    const user = await UserStore.findByEmail(userEmail);
    if (user) {
      const result = CheckoutStore.applyPoints(user.loyaltyPoints, pointsToRedeem);
      pointsDiscount = result.discount;
      pointsUsed = result.pointsUsed;
    }
  }

  // Calculate total
  const totalPrice = CheckoutStore.calculateTotal(cart, deliveryFee, pointsDiscount);
  const pointsEarned = LoyaltyStore.calculatePoints(totalPrice);

  // Create order
  const order = await OrderStore.create({
    userEmail,
    restaurantId: cart.currentRestaurantId!,
    addressId,
    subTotal: cart.subtotal,
    deliveryPrice: deliveryFee,
    totalPrice,
    pointsRedeemed: pointsUsed,
    pointsEarned,
    orderStatus: 'placed',
    paymentMethod: 'COD',
    createdAt: new Date().toISOString(),
  });

  // Create order items
  await OrderItemStore.addItems(
    order.id,
    cart.items.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    }))
  );

  // Update loyalty points
  if (pointsUsed > 0) {
    await UserStore.deductLoyaltyPoints(userEmail, pointsUsed);
  }
  if (pointsEarned > 0) {
    await UserStore.addLoyaltyPoints(userEmail, pointsEarned);
  }

  // Clear cart
  CartStore.clearCart(userEmail);

  return { success: true, order };
}

export async function getUserOrders(userEmail: string): Promise<{ success: boolean; orders: Order[] }> {
  const orders = await OrderStore.findByUser(userEmail);
  return { success: true, orders };
}

export async function getOrderDetails(orderId: string): Promise<{ success: boolean; order?: Order; items?: any[]; error?: string }> {
  const order = await OrderStore.findById(orderId);
  if (!order) return { success: false, error: 'Order not found' };
  const items = await OrderItemStore.findByOrder(orderId);
  return { success: true, order, items };
}
