// ─── Loyalty Model ───────────────────────────────────────────────────────────
// Class Diagram: Loyalty
//   - pointsBalance: int, accrualRate: float = 0.1, egpPerPoint: float = 0.01
//   + calculatePoints(orderTotal:float): int
//   + getEGPValue(): float
//   + validateLoyalty(): boolean
//   + isRedeemable(): boolean
//   + deductPoints(amount:int): void

export const LoyaltyConfig = {
  accrualRate: 0.1,    // 10% of order total becomes points
  egpPerPoint: 0.01,   // each point = 0.01 EGP
  minRedeemBalance: 1000, // minimum 1000 points to enable redemption
};

export const LoyaltyStore = {
  /** Class Diagram: calculatePoints(orderTotal:float): int */
  calculatePoints(orderTotal: number): number {
    return Math.floor(orderTotal * LoyaltyConfig.accrualRate);
  },

  /** Class Diagram: getEGPValue(): float — convert points to EGP */
  getEGPValue(points: number): number {
    return parseFloat((points * LoyaltyConfig.egpPerPoint).toFixed(2));
  },

  /** Class Diagram: validateLoyalty(): boolean — check if points balance is valid */
  validateLoyalty(pointsBalance: number): boolean {
    return pointsBalance >= 0;
  },

  /** Class Diagram: isRedeemable(): boolean — balance > 1000 to enable */
  isRedeemable(pointsBalance: number): boolean {
    return pointsBalance >= LoyaltyConfig.minRedeemBalance;
  },
};
