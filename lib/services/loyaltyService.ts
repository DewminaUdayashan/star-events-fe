import { apiClient } from '../api-client';

export interface LoyaltyPoint {
  id: string;
  points: number;
  description: string;
  earnedDate: string;
  type: 'Earned' | 'Redeemed';
}

export interface LoyaltyBalance {
  userId: string;
  balance: number;
  discountValue: number;
}

export interface LoyaltyHistory {
  userId: string;
  history: LoyaltyPoint[];
}

export interface RedeemPointsRequest {
  Points: number;        // Match C# property name exactly
  Description?: string;  // Match C# property name exactly
}

export interface RedeemPointsResponse {
  success: boolean;
  message: string;
  redeemedPoints: number;
  discountValue: number;
  remainingBalance: number;
}

export interface DiscountCalculation {
  requestedPoints: number;
  currentBalance: number;
  canRedeem: boolean;
  discountValue: number;
}

export class LoyaltyService {
  private readonly baseUrl = '/api/loyalty';

  /**
   * Get current user's loyalty point balance
   */
  async getBalance(): Promise<LoyaltyBalance> {
    return await apiClient.get<LoyaltyBalance>(`${this.baseUrl}/balance`);
  }

  /**
   * Get loyalty point balance for a specific user (Admin/Organizer only)
   */
  async getBalanceForUser(userId: string): Promise<LoyaltyBalance> {
    return await apiClient.get<LoyaltyBalance>(`${this.baseUrl}/balance/${userId}`);
  }

  /**
   * Get current user's loyalty points history
   */
  async getHistory(): Promise<LoyaltyHistory> {
    return await apiClient.get<LoyaltyHistory>(`${this.baseUrl}/history`);
  }

  /**
   * Get loyalty points history for a specific user (Admin/Organizer only)
   */
  async getHistoryForUser(userId: string): Promise<LoyaltyHistory> {
    return await apiClient.get<LoyaltyHistory>(`${this.baseUrl}/history/${userId}`);
  }

  /**
   * Redeem loyalty points for discount
   */
  async redeemPoints(request: RedeemPointsRequest): Promise<RedeemPointsResponse> {
    return await apiClient.post<RedeemPointsResponse>(`${this.baseUrl}/redeem`, request);
  }

  /**
   * Calculate potential discount from points without redeeming
   */
  async calculateDiscount(points: number): Promise<DiscountCalculation> {
    return await apiClient.get<DiscountCalculation>(`${this.baseUrl}/calculate-discount/${points}`);
  }

  /**
   * Add loyalty points (Admin only)
   */
  async addPoints(userId: string, points: number, description?: string): Promise<any> {
    return await apiClient.post(`${this.baseUrl}/add`, {
      userId,
      points,
      description: description || 'Points added by admin'
    });
  }

  /**
   * Calculate earned points from purchase amount (client-side calculation)
   */
  calculateEarnedPoints(purchaseAmount: number): number {
    return Math.floor(purchaseAmount * 0.10); // 10% of purchase amount
  }

  /**
   * Calculate discount value from points (client-side calculation)
   */
  calculateDiscountValue(points: number): number {
    return points * 1.0; // 1 point = 1 LKR
  }

  /**
   * Format points for display
   */
  formatPoints(points: number): string {
    return points.toLocaleString();
  }

  /**
   * Format currency value for display
   */
  formatCurrency(amount: number): string {
    return `LKR ${amount.toFixed(2)}`;
  }

  /**
   * Get maximum points that can be redeemed for a given purchase amount
   * Typically limited to a percentage of the purchase amount
   */
  getMaxRedeemablePoints(purchaseAmount: number, currentBalance: number, maxDiscountPercentage: number = 0.5): number {
    const maxDiscountAmount = purchaseAmount * maxDiscountPercentage; // e.g., 50% of purchase
    const maxPointsFromDiscount = Math.floor(maxDiscountAmount); // 1 point = 1 LKR
    return Math.min(currentBalance, maxPointsFromDiscount);
  }

  /**
   * Validate points redemption
   */
  validateRedemption(points: number, currentBalance: number, purchaseAmount: number): {
    isValid: boolean;
    error?: string;
  } {
    if (points <= 0) {
      return { isValid: false, error: 'Points must be greater than zero' };
    }

    if (points > currentBalance) {
      return { isValid: false, error: 'Insufficient loyalty points' };
    }

    if (points > purchaseAmount) {
      return { isValid: false, error: 'Cannot redeem more points than the purchase amount' };
    }

    return { isValid: true };
  }
}

export const loyaltyService = new LoyaltyService();
