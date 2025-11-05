import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectId, publicAnonKey } from '../utils/superbase/info';

interface RewardsContextType {
  totalRewards: number;
  loading: boolean;
  addRewards: (amount: number) => Promise<void>;
  fetchRewards: () => Promise<void>;
  calculateRewards: (orderAmount: number) => number;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

const REWARDS_RATE = 10; // 1 point per ₹10 spent

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (user) {
      fetchRewards();
    } else {
      setTotalRewards(0);
    }
  }, [user, authLoading]);

  const fetchRewards = async () => {
    if (!user) return;
    
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f/rewards/${user.email}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setTotalRewards(data.totalRewards || 0);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name !== 'AbortError') {
        console.error('Error fetching rewards:', error);
      } else {
        console.warn('Rewards fetch timed out, using default value');
      }
      setTotalRewards(0);
    } finally {
      setLoading(false);
    }
  };

  const addRewards = async (amount: number) => {
    if (!user) return;

    const pointsEarned = calculateRewards(amount);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f/rewards/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            pointsToAdd: pointsEarned,
            orderAmount: amount,
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        setTotalRewards((prev) => prev + pointsEarned);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name !== 'AbortError') {
        console.error('Error adding rewards:', error);
      } else {
        console.warn('Add rewards timed out');
      }
    }
  };

  const calculateRewards = (orderAmount: number): number => {
    return Math.floor(orderAmount / REWARDS_RATE);
  };

  return (
    <RewardsContext.Provider
      value={{
        totalRewards,
        loading,
        addRewards,
        fetchRewards,
        calculateRewards,
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardsContext);
  if (context === undefined) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
}
