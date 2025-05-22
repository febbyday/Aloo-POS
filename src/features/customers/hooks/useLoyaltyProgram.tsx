import { useState, useEffect, useCallback } from 'react';
import { loyaltyService } from '@/lib/api/services/loyalty-service';
import { useToast } from '@/lib/toast';
import { eventBus, POS_EVENTS } from '@/lib/events/event-bus';
import {
  LoyaltyTier,
  LoyaltyReward,
  LoyaltyEvent,
  LoyaltySettings
} from '../types/customers.types';

interface UseLoyaltyProgramOptions {
  autoLoad?: boolean;
}

export function useLoyaltyProgram(options: UseLoyaltyProgramOptions = {}) {
  const { autoLoad = true } = options;

  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { toast } = useToast();

  /**
   * Fetch all loyalty program data
   */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch tiers
      const tiersResponse = await loyaltyService.getTiers();
      setTiers(tiersResponse.data || []);

      // Fetch rewards
      const rewardsResponse = await loyaltyService.getRewards();
      setRewards(rewardsResponse.data || []);

      // Fetch events
      const eventsResponse = await loyaltyService.getEvents();
      setEvents(eventsResponse.data || []);

      // Fetch settings
      const settingsData = await loyaltyService.getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading loyalty program",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Tier management functions
   */
  const createTier = useCallback(async (tier: Omit<LoyaltyTier, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.createTier(tier);
      setTiers(prev => [...prev, response.data]);
      toast({
        title: "Tier Created",
        description: `${tier.name} tier has been created.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Creating Tier",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTier = useCallback(async (id: string, tier: Partial<LoyaltyTier>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.updateTier(id, tier);
      setTiers(prev => prev.map(t => t.id === id ? response.data : t));
      toast({
        title: "Tier Updated",
        description: `${tier.name || 'Tier'} has been updated.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Updating Tier",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteTier = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await loyaltyService.deleteTier(id);
      setTiers(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Tier Deleted",
        description: "The tier has been deleted successfully.",
      });

      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Deleting Tier",
        description: (err as Error).message,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Reward management functions
   */
  const createReward = useCallback(async (reward: Omit<LoyaltyReward, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.createReward(reward);
      setRewards(prev => [...prev, response.data]);
      toast({
        title: "Reward Created",
        description: `${reward.name} reward has been created.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Creating Reward",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateReward = useCallback(async (id: string, reward: Partial<LoyaltyReward>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.updateReward(id, reward);
      setRewards(prev => prev.map(r => r.id === id ? response.data : r));
      toast({
        title: "Reward Updated",
        description: `${reward.name || 'Reward'} has been updated.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Updating Reward",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteReward = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await loyaltyService.deleteReward(id);
      setRewards(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Reward Deleted",
        description: "The reward has been deleted successfully.",
      });

      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Deleting Reward",
        description: (err as Error).message,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Event management functions
   */
  const createEvent = useCallback(async (event: Omit<LoyaltyEvent, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.createEvent(event);
      setEvents(prev => [...prev, response.data]);
      toast({
        title: "Event Created",
        description: `${event.name} event has been created.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Creating Event",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEvent = useCallback(async (id: string, event: Partial<LoyaltyEvent>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.updateEvent(id, event);
      setEvents(prev => prev.map(e => e.id === id ? response.data : e));
      toast({
        title: "Event Updated",
        description: `${event.name || 'Event'} has been updated.`,
      });

      return response.data;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Updating Event",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEvent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await loyaltyService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });

      return true;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Deleting Event",
        description: (err as Error).message,
        variant: "destructive",
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Settings management
   */
  const updateSettings = useCallback(async (newSettings: Partial<LoyaltySettings>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.updateSettings(newSettings);
      setSettings(response);
      toast({
        title: "Settings Updated",
        description: "Loyalty program settings have been updated.",
      });

      return response;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Updating Settings",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Customer point management
   */
  const awardPoints = useCallback(async (
    customerId: string,
    points: number,
    source: 'MANUAL' | 'EVENT' | 'PURCHASE' | 'REFERRAL',
    description: string,
    sourceId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.awardPoints(
        customerId,
        points,
        source,
        description,
        sourceId
      );

      toast({
        title: "Points Awarded",
        description: `${points} points have been awarded.`,
      });

      // Emit customer loyalty changed event
      eventBus.emit(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, {
        customerId,
        change: points,
        source,
        sourceId
      });

      return response;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Awarding Points",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const redeemPoints = useCallback(async (customerId: string, rewardId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loyaltyService.redeemPoints(customerId, rewardId);

      toast({
        title: "Points Redeemed",
        description: "Points have been redeemed for reward.",
      });

      // Emit customer loyalty changed event
      eventBus.emit(POS_EVENTS.CUSTOMER_LOYALTY_CHANGED, {
        customerId,
        change: -response.points,
        source: 'REWARD',
        sourceId: rewardId
      });

      return response;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Redeeming Points",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Assign a tier to a customer based on spending
   */
  const assignTierBySpending = useCallback(async (customerId: string, spendAmount: number) => {
    setLoading(true);
    setError(null);

    try {
      // Find the appropriate tier based on spend amount
      if (!tiers || tiers.length === 0) return null;

      // Sort tiers by minimum spend in ascending order
      const sortedTiers = [...tiers].sort((a, b) => a.minimumSpend - b.minimumSpend);

      // Find the highest tier the customer qualifies for
      let eligibleTier = null;
      for (const tier of sortedTiers) {
        if (spendAmount >= tier.minimumSpend) {
          eligibleTier = tier;
        } else {
          break; // Stop once we find a tier with minimum spend greater than the customer's spend
        }
      }

      if (!eligibleTier) return null;

      // Update the customer with the new tier
      const response = await loyaltyService.assignCustomerTier(customerId, eligibleTier.id);

      toast({
        title: "Tier Assigned",
        description: `Customer has been assigned to ${eligibleTier.name} tier.`,
      });

      // Emit tier assignment event
      const tierEvent = new CustomEvent('loyalty:tierAssigned', {
        detail: {
          customerId,
          tierId: eligibleTier.id,
          tierName: eligibleTier.name,
          spendAmount
        }
      });
      window.dispatchEvent(tierEvent);

      return response;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error Assigning Tier",
        description: (err as Error).message,
        variant: "destructive",
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [tiers, loyaltyService, toast]);

  // Load loyalty program data on initial render if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchAll();
    }
  }, [autoLoad, fetchAll]);

  // Initialize event listeners for customer points changes
  useEffect(() => {
    // Function to handle customer points changing
    const handlePointsChanged = (event: CustomEvent<{
      customerId: string;
      previousPoints: number;
      newPoints: number;
      customer: any;
    }>) => {
      const { customerId, previousPoints, newPoints, customer } = event.detail;

      // We don't need to do anything with points change for tier updates
      // since tiers are now based on spending amounts
    };

    // Add event listener
    window.addEventListener('customer:pointsChanged', handlePointsChanged as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('customer:pointsChanged', handlePointsChanged as EventListener);
    };
  }, [tiers, toast]);

  // Add listener for customer spend changes
  useEffect(() => {
    // Function to handle customer spend changing
    const handleSpendChanged = (event: CustomEvent<{
      customerId: string;
      previousSpend: number;
      newSpend: number;
      customer: any;
    }>) => {
      const { customerId, previousSpend, newSpend, customer } = event.detail;

      // Check if any tiers should be triggered based on the new spend amount
      if (tiers && tiers.length > 0) {
        // Find the previous tier
        const previousTier = tiers.find(tier =>
          previousSpend >= tier.minimumSpend &&
          (previousSpend < (tiers.find(t => t.minimumSpend > tier.minimumSpend)?.minimumSpend || Infinity))
        );

        // Find the new tier
        const newTier = tiers.find(tier =>
          newSpend >= tier.minimumSpend &&
          (newSpend < (tiers.find(t => t.minimumSpend > tier.minimumSpend)?.minimumSpend || Infinity))
        );

        // If customer moved to a higher tier, show notification
        if (newTier && (!previousTier || newTier.minimumSpend > previousTier.minimumSpend)) {
          toast({
            title: "Tier Upgraded!",
            description: `Customer ${customer.firstName} ${customer.lastName} has been upgraded to ${newTier.name} tier!`,
          });

          // Emit tier change event
          const tierChangeEvent = new CustomEvent('loyalty:tierChanged', {
            detail: {
              customerId,
              previousTier: previousTier?.id,
              newTier: newTier.id,
              customer
            }
          });
          window.dispatchEvent(tierChangeEvent);
        }
      }
    };

    // Add event listener
    window.addEventListener('customer:spendChanged', handleSpendChanged as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('customer:spendChanged', handleSpendChanged as EventListener);
    };
  }, [tiers, toast]);

  return {
    tiers,
    rewards,
    events,
    settings,
    loading,
    error,
    fetchAll,
    createTier,
    updateTier,
    deleteTier,
    createReward,
    updateReward,
    deleteReward,
    createEvent,
    updateEvent,
    deleteEvent,
    updateSettings,
    awardPoints,
    redeemPoints,
    assignTierBySpending
  };
}