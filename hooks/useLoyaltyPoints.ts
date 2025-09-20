import { useState, useEffect } from 'react';
import { loyaltyService, type LoyaltyBalance, type LoyaltyHistory, type RedeemPointsRequest } from '@/lib/services/loyaltyService';
import { useToast } from '@/hooks/use-toast';

interface UseLoyaltyPointsReturn {
  balance: LoyaltyBalance | null;
  history: LoyaltyHistory | null;
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  redeemPoints: (request: RedeemPointsRequest) => Promise<boolean>;
  calculateDiscount: (points: number) => Promise<{ canRedeem: boolean; discountValue: number } | null>;
}

export function useLoyaltyPoints(): UseLoyaltyPointsReturn {
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [history, setHistory] = useState<LoyaltyHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshBalance = async () => {
    try {
      setError(null);
      const balanceData = await loyaltyService.getBalance();
      setBalance(balanceData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch loyalty balance';
      setError(errorMessage);
      console.error('Error fetching loyalty balance:', err);
    }
  };

  const refreshHistory = async () => {
    try {
      setError(null);
      const historyData = await loyaltyService.getHistory();
      setHistory(historyData);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch loyalty history';
      setError(errorMessage);
      console.error('Error fetching loyalty history:', err);
    }
  };

  const redeemPoints = async (request: RedeemPointsRequest): Promise<boolean> => {
    try {
      setError(null);
      const result = await loyaltyService.redeemPoints(request);
      
      if (result.success) {
        toast({
          title: "Points Redeemed Successfully",
          description: `${result.redeemedPoints} points redeemed for ${loyaltyService.formatCurrency(result.discountValue)} discount`,
        });
        
        // Refresh balance after successful redemption
        await refreshBalance();
        return true;
      } else {
        throw new Error(result.message || 'Failed to redeem points');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to redeem points';
      setError(errorMessage);
      toast({
        title: "Redemption Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const calculateDiscount = async (points: number): Promise<{ canRedeem: boolean; discountValue: number } | null> => {
    try {
      setError(null);
      const result = await loyaltyService.calculateDiscount(points);
      return {
        canRedeem: result.canRedeem,
        discountValue: result.discountValue
      };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to calculate discount';
      setError(errorMessage);
      console.error('Error calculating discount:', err);
      return null;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([refreshBalance(), refreshHistory()]);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  return {
    balance,
    history,
    isLoading,
    error,
    refreshBalance,
    refreshHistory,
    redeemPoints,
    calculateDiscount,
  };
}

interface UseAdminLoyaltyPointsReturn {
  getBalanceForUser: (userId: string) => Promise<LoyaltyBalance | null>;
  getHistoryForUser: (userId: string) => Promise<LoyaltyHistory | null>;
  addPointsToUser: (userId: string, points: number, description?: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useAdminLoyaltyPoints(): UseAdminLoyaltyPointsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getBalanceForUser = async (userId: string): Promise<LoyaltyBalance | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const balance = await loyaltyService.getBalanceForUser(userId);
      return balance;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch user loyalty balance';
      setError(errorMessage);
      console.error('Error fetching user loyalty balance:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistoryForUser = async (userId: string): Promise<LoyaltyHistory | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await loyaltyService.getHistoryForUser(userId);
      return history;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch user loyalty history';
      setError(errorMessage);
      console.error('Error fetching user loyalty history:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addPointsToUser = async (userId: string, points: number, description?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loyaltyService.addPoints(userId, points, description);
      
      if (result.success) {
        toast({
          title: "Points Added Successfully",
          description: `${points} points added to user account`,
        });
        return true;
      } else {
        throw new Error(result.message || 'Failed to add points');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add points';
      setError(errorMessage);
      toast({
        title: "Failed to Add Points",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getBalanceForUser,
    getHistoryForUser,
    addPointsToUser,
    isLoading,
    error,
  };
}
