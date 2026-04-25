// ─── Cart Model — In-Memory Per Session ──────────────────────────────────────
// Class Diagram: Cart
//   - items: Item[], currentRestaurant: Restaurant, subtotal, total, totalItemCount
//   + addItem(), removeItem(), updateQuantity(),
//     validateSingleRestaurant(), validateMaxItems(), proceedToCheckout()

export interface CartItem {
  menuItemId: number;
  itemName: string;
  unitPrice: number;
  quantity: number;
  restaurantId: number;
}

export interface Cart {
  items: CartItem[];
  currentRestaurantId: number | null;
  subtotal: number;
  total: number;
  totalItemCount: number;
}

// In-memory cart store keyed by user email (not persisted in ERD)
const carts: Map<string, Cart> = new Map();

function emptyCart(): Cart {
  return { items: [], currentRestaurantId: null, subtotal: 0, total: 0, totalItemCount: 0 };
}

function recalculate(cart: Cart): void {
  cart.subtotal = cart.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  cart.subtotal = parseFloat(cart.subtotal.toFixed(2));
  cart.total = cart.subtotal; // delivery fee is added at checkout
  cart.totalItemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

export const CartStore = {
  getCart(userEmail: string): Cart {
    if (!carts.has(userEmail)) {
      carts.set(userEmail, emptyCart());
    }
    return carts.get(userEmail)!;
  },

  /** Class Diagram: addItem(Item): void */
  addItem(userEmail: string, item: CartItem): { success: boolean; error?: string; cart?: Cart } {
    const cart = this.getCart(userEmail);

    // validateSingleRestaurant
    if (cart.currentRestaurantId !== null && cart.currentRestaurantId !== item.restaurantId) {
      return { success: false, error: 'Cart can only contain items from a single restaurant. Clear cart first.' };
    }

    // validateMaxItems — max 10 unique items
    const existing = cart.items.find((i) => i.menuItemId === item.menuItemId);
    if (!existing && cart.items.length >= 10) {
      return { success: false, error: 'Cart cannot contain more than 10 different items' };
    }

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.items.push({ ...item });
      cart.currentRestaurantId = item.restaurantId;
    }

    recalculate(cart);
    return { success: true, cart };
  },

  /** Class Diagram: removeItem(Item): void */
  removeItem(userEmail: string, menuItemId: number): { success: boolean; cart?: Cart } {
    const cart = this.getCart(userEmail);
    const idx = cart.items.findIndex((i) => i.menuItemId === menuItemId);
    if (idx === -1) return { success: false };

    cart.items.splice(idx, 1);
    if (cart.items.length === 0) cart.currentRestaurantId = null;
    recalculate(cart);
    return { success: true, cart };
  },

  /** Class Diagram: updateQuantity(Item, int): void */
  updateQuantity(userEmail: string, menuItemId: number, quantity: number): { success: boolean; error?: string; cart?: Cart } {
    const cart = this.getCart(userEmail);
    const item = cart.items.find((i) => i.menuItemId === menuItemId);
    if (!item) return { success: false, error: 'Item not in cart' };

    if (quantity <= 0) {
      return this.removeItem(userEmail, menuItemId);
    }

    item.quantity = quantity;
    recalculate(cart);
    return { success: true, cart };
  },

  /** Class Diagram: validateSingleRestaurant(): boolean */
  validateSingleRestaurant(cart: Cart): boolean {
    if (cart.items.length === 0) return true;
    const restaurantId = cart.items[0].restaurantId;
    return cart.items.every((i) => i.restaurantId === restaurantId);
  },

  /** Class Diagram: validateMaxItems(): boolean */
  validateMaxItems(cart: Cart): boolean {
    return cart.items.length <= 10;
  },

  /** Clear the cart */
  clearCart(userEmail: string): Cart {
    const cart = emptyCart();
    carts.set(userEmail, cart);
    return cart;
  },
};
