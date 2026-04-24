// ─── Offer Service ───────────────────────────────────────────────────────────
// Admin class diagram: createPromotion(Offers), editPromotion(Offers)

import { OfferStore, Offer } from '../models/offer.model';
import { ItemStore } from '../models/item.model';

export interface OfferResult {
  success: boolean;
  offer?: Offer;
  offers?: Offer[];
  error?: string;
}

/** Admin flowchart: createPromotion */
export async function createOffer(data: {
  menuItemId: number;
  discountPercentage: number;
  offerName: string;
  startsAt: string;
  expiresAt: string;
}): Promise<OfferResult> {
  // Validate
  const validationError = OfferStore.validateOffer(data);
  if (validationError) return { success: false, error: validationError };

  // Check menu item exists
  const menuItem = await ItemStore.findById(data.menuItemId);
  if (!menuItem) return { success: false, error: 'Menu item not found' };

  // Check if offer already exists for this item
  const existing = await OfferStore.findByMenuItem(data.menuItemId);
  if (existing) return { success: false, error: 'An offer already exists for this item' };

  const discountedPrice = OfferStore.getDiscountedPrice(menuItem.itemCost, data.discountPercentage);

  const offer = await OfferStore.create({
    menuItemId: data.menuItemId,
    discountPercentage: data.discountPercentage,
    originalPrice: menuItem.itemCost,
    discountedPrice,
    offerName: data.offerName.trim(),
    startsAt: data.startsAt,
    expiresAt: data.expiresAt,
  });

  return { success: true, offer };
}

/** Admin flowchart: editPromotion */
export async function updateOffer(id: string, data: Partial<{
  discountPercentage: number;
  offerName: string;
  startsAt: string;
  expiresAt: string;
}>): Promise<OfferResult> {
  const existing = await OfferStore.findById(id);
  if (!existing) return { success: false, error: 'Offer not found' };

  const updates: Partial<Omit<Offer, 'id'>> = { ...data };

  // Recalculate discounted price if discount changes
  if (data.discountPercentage !== undefined) {
    updates.discountedPrice = OfferStore.getDiscountedPrice(existing.originalPrice, data.discountPercentage);
  }

  const offer = await OfferStore.update(id, updates);
  return { success: true, offer };
}

export async function deleteOffer(id: string): Promise<OfferResult> {
  const existing = await OfferStore.findById(id);
  if (!existing) return { success: false, error: 'Offer not found' };
  await OfferStore.delete(id);
  return { success: true };
}

export async function getAllOffers(): Promise<OfferResult> {
  const offers = await OfferStore.findAll();
  return { success: true, offers };
}

export async function getActiveOffers(): Promise<OfferResult> {
  const offers = await OfferStore.findActive();
  return { success: true, offers };
}
