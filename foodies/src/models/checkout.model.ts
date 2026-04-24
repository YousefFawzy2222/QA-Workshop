// ─── Checkout Model ──────────────────────────────────────────────────────────
// Class Diagram: CheckOut
//   - address: AddressOfUser, loyalty: Loyalty, usePoints: boolean,
//     cart: Cart, order: Order
//   + placeOrder(): Order
//   + applyPoints(): float
//   + validateAddress(): boolean
//   + calculateTotal(): float

import { Cart } from './cart.model';
import { LoyaltyStore, LoyaltyConfig } from './loyalty.model';

export const CheckoutStore = {
  /** Class Diagram: validateAddress(): boolean */
  validateAddress(addressId: number | null): boolean {
    return addressId !== null && addressId > 0;
  },

  /** Class Diagram: applyPoints(): float — return discount amount from points */
  applyPoints(pointsBalance: number, pointsToRedeem: number): { discount: number; pointsUsed: number } {
    if (!LoyaltyStore.isRedeemable(pointsBalance)) {
      return { discount: 0, pointsUsed: 0 };
    }
    const actualPoints = Math.min(pointsToRedeem, pointsBalance);
    const discount = LoyaltyStore.getEGPValue(actualPoints);
    return { discount, pointsUsed: actualPoints };
  },

  /** Class Diagram: calculateTotal(): float */
  calculateTotal(cart: Cart, deliveryFee: number, pointsDiscount: number): number {
    const total = cart.subtotal + deliveryFee - pointsDiscount;
    return parseFloat(Math.max(0, total).toFixed(2));
  },
};
