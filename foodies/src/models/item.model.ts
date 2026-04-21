// ─── In-Memory Item Store ─────────────────────────────────────────────────────
// Class Diagram: Item
//   - itemName: String
//   - itemCost: float
//   - itemQuantity: int        (stock / available quantity)
//   - isCombo: boolean
//   - itemSize: String
//   - isOnDiscount: boolean
//   - discountPercentage: float
//   - description: String
//   + validateItem(): void
//   + validateItemOnDiscount(): void
//   + getDiscountedPrice(): float
//   + addItem(): void          (admin action – adds item to menu)

export interface Item {
  id: string;                  // unique identifier
  restaurantId: string;        // FK → Restaurant
  itemName: string;
  itemCost: number;            // EGP (base price)
  itemQuantity: number;        // available quantity (≥ 0)
  isCombo: boolean;            // true = combo meal (counts as 1 item per RES-FR-01.1)
  itemSize: string;            // e.g. "Small" | "Medium" | "Large" | "Regular"
  isOnDiscount: boolean;
  discountPercentage: number;  // 0–100, relevant only when isOnDiscount = true
  description: string;
}

// Singleton in-memory store
const items: Item[] = [];
let nextId = 1;

export const ItemStore = {
  /** Return all items for a restaurant */
  findByRestaurant(restaurantId: string): Item[] {
    return items.filter((i) => i.restaurantId === restaurantId);
  },

  /** Find a single item by id */
  findById(id: string): Item | undefined {
    return items.find((i) => i.id === id);
  },

  /** Find by name within a restaurant (case-insensitive) */
  findByNameInRestaurant(restaurantId: string, name: string): Item | undefined {
    return items.find(
      (i) =>
        i.restaurantId === restaurantId &&
        i.itemName.toLowerCase() === name.trim().toLowerCase()
    );
  },

  /** Add a new item */
  add(data: Omit<Item, 'id'>): Item {
    const item: Item = { id: String(nextId++), ...data };
    items.push(item);
    return item;
  },

  /** Update an existing item */
  update(id: string, data: Partial<Omit<Item, 'id' | 'restaurantId'>>): Item | undefined {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    items[idx] = { ...items[idx], ...data };
    return items[idx];
  },

  /** Remove an item */
  remove(id: string): boolean {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    items.splice(idx, 1);
    return true;
  },

  /** Remove all items for a restaurant (cascade from deleteRestaurant) */
  removeByRestaurant(restaurantId: string): void {
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].restaurantId === restaurantId) items.splice(i, 1);
    }
  },

  // ─── Class Diagram Methods ────────────────────────────────────────────────

  /**
   * validateItem(): void
   * Returns an error string or null if valid.
   */
  validateItem(data: {
    itemName?: string;
    itemCost?: number;
    itemQuantity?: number;
    itemSize?: string;
    description?: string;
    isCombo?: boolean;
  }): string | null {
    if (!data.itemName || data.itemName.trim().length === 0) {
      return 'Item name is required';
    }
    if (data.itemCost === undefined || isNaN(data.itemCost) || data.itemCost < 0) {
      return 'Item cost must be a non-negative number';
    }
    if (data.itemQuantity === undefined || isNaN(data.itemQuantity) || data.itemQuantity < 0) {
      return 'Quantity must be a non-negative number';
    }
    if (!data.itemSize || data.itemSize.trim().length === 0) {
      return 'Item size is required';
    }
    return null;
  },

  /**
   * validateItemOnDiscount(): void
   * Called only when isOnDiscount = true.
   * Returns error string or null.
   */
  validateItemOnDiscount(discountPercentage: number): string | null {
    if (isNaN(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
      return 'Discount percentage must be between 1 and 100';
    }
    return null;
  },

  /**
   * getDiscountedPrice(item): float
   * Returns the price after discount (or base price if not on discount).
   */
  getDiscountedPrice(item: Item): number {
    if (!item.isOnDiscount || item.discountPercentage <= 0) return item.itemCost;
    return parseFloat(
      (item.itemCost * (1 - item.discountPercentage / 100)).toFixed(2)
    );
  },
};
