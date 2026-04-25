// ─── Cart Service ────────────────────────────────────────────────────────────

import { CartStore, Cart } from '../models/cart.model';
import { ItemStore } from '../models/item.model';

export interface CartResult {
  success: boolean;
  cart?: Cart;
  error?: string;
}

export async function addToCart(userEmail: string, menuItemId: number, quantity: number): Promise<CartResult> {
  const item = await ItemStore.findById(menuItemId);
  if (!item) return { success: false, error: 'Item not found' };

  if (quantity <= 0) return { success: false, error: 'Quantity must be greater than 0' };
  if (quantity > item.itemQuantity) return { success: false, error: 'Not enough stock available' };

  const unitPrice = ItemStore.getDiscountedPrice(item);

  const result = CartStore.addItem(userEmail, {
    menuItemId: item.id,
    itemName: item.itemName,
    unitPrice,
    quantity,
    restaurantId: item.restaurantId,
  });

  return result;
}

export function removeFromCart(userEmail: string, menuItemId: number): CartResult {
  return CartStore.removeItem(userEmail, menuItemId);
}

export function updateCartQuantity(userEmail: string, menuItemId: number, quantity: number): CartResult {
  return CartStore.updateQuantity(userEmail, menuItemId, quantity);
}

export function getCart(userEmail: string): CartResult {
  const cart = CartStore.getCart(userEmail);
  return { success: true, cart };
}

export function clearCart(userEmail: string): CartResult {
  const cart = CartStore.clearCart(userEmail);
  return { success: true, cart };
}
