import { ItemStore, Item } from '../models/item.model';
import { RestaurantStore } from '../models/restaurant.model';

// ─── Result Types ─────────────────────────────────────────────────────────────
export interface ItemResult {
  success: boolean;
  item?: Item;
  items?: Item[];
  error?: string;
}

// ─── addItem (admin: Module 3.1) ─────────────────────────────────────────────
/**
 * Class Diagram: Admin.addRestaurant → Item.addItem()
 * Flowchart (Admin): isAdmin check done by middleware.
 *
 * Validation:
 *  1. Restaurant must exist
 *  2. validateItem() — all required fields
 *  3. Duplicate item name within restaurant
 *  4. validateItemOnDiscount() — only when isOnDiscount = true
 *
 * SRS ADM-FR-02: closing-hour enforcement is done client-side (Add button
 * disabled). Server validates fields unconditionally so closed-restaurant
 * items can still be added by the admin.
 */
export function addItem(data: {
  restaurantId: string;
  itemName: string;
  itemCost: number;
  itemQuantity: number;
  isCombo: boolean;
  itemSize: string;
  isOnDiscount: boolean;
  discountPercentage: number;
  description: string;
}): ItemResult {
  // Restaurant must exist
  const restaurant = RestaurantStore.findById(data.restaurantId);
  if (!restaurant) {
    return { success: false, error: 'Restaurant not found' };
  }

  // validateItem()
  const fieldError = ItemStore.validateItem({
    itemName:     data.itemName,
    itemCost:     data.itemCost,
    itemQuantity: data.itemQuantity,
    itemSize:     data.itemSize,
    description:  data.description,
    isCombo:      data.isCombo,
  });
  if (fieldError) return { success: false, error: fieldError };

  // Duplicate name check within the same restaurant
  const existing = ItemStore.findByNameInRestaurant(data.restaurantId, data.itemName);
  if (existing) {
    return { success: false, error: 'An item with this name already exists in this restaurant' };
  }

  // validateItemOnDiscount()
  if (data.isOnDiscount) {
    const discountError = ItemStore.validateItemOnDiscount(data.discountPercentage);
    if (discountError) return { success: false, error: discountError };
  }

  const item = ItemStore.add({
    restaurantId:      data.restaurantId,
    itemName:          data.itemName.trim(),
    itemCost:          data.itemCost,
    itemQuantity:      data.itemQuantity,
    isCombo:           data.isCombo,
    itemSize:          data.itemSize.trim(),
    isOnDiscount:      data.isOnDiscount,
    discountPercentage: data.isOnDiscount ? data.discountPercentage : 0,
    description:       data.description.trim(),
  });

  return { success: true, item };
}

// ─── updateItem ───────────────────────────────────────────────────────────────
export function updateItem(
  id: string,
  data: Partial<Omit<Item, 'id' | 'restaurantId'>>
): ItemResult {
  const existing = ItemStore.findById(id);
  if (!existing) return { success: false, error: 'Item not found' };

  // Re-validate merged data
  const merged = { ...existing, ...data };
  const fieldError = ItemStore.validateItem(merged);
  if (fieldError) return { success: false, error: fieldError };

  // Duplicate name check (allow same name for same item)
  if (data.itemName) {
    const duplicate = ItemStore.findByNameInRestaurant(existing.restaurantId, data.itemName);
    if (duplicate && duplicate.id !== id) {
      return { success: false, error: 'An item with this name already exists in this restaurant' };
    }
  }

  // Re-validate discount if it's turned on
  if (merged.isOnDiscount) {
    const discountError = ItemStore.validateItemOnDiscount(merged.discountPercentage);
    if (discountError) return { success: false, error: discountError };
  }

  const item = ItemStore.update(id, {
    ...data,
    itemName:    data.itemName?.trim(),
    itemSize:    data.itemSize?.trim(),
    description: data.description?.trim(),
    discountPercentage: merged.isOnDiscount ? merged.discountPercentage : 0,
  });

  return { success: true, item };
}

// ─── deleteItem ───────────────────────────────────────────────────────────────
export function deleteItem(id: string): ItemResult {
  const existing = ItemStore.findById(id);
  if (!existing) return { success: false, error: 'Item not found' };
  ItemStore.remove(id);
  return { success: true };
}

// ─── getItemsByRestaurant ─────────────────────────────────────────────────────
export function getItemsByRestaurant(restaurantId: string): ItemResult {
  const restaurant = RestaurantStore.findById(restaurantId);
  if (!restaurant) return { success: false, error: 'Restaurant not found' };

  const items = ItemStore.findByRestaurant(restaurantId).map((item) => ({
    ...item,
    discountedPrice: ItemStore.getDiscountedPrice(item),
  }));

  return { success: true, items: items as Item[] };
}
