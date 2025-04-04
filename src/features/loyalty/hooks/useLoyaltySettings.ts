import { useState, useEffect } from 'react';
import { loyaltyApi, LoyaltySettings } from '../api/loyaltyApi';
import { toast } from '@/components/ui/use-toast';

export function useLoyaltySettings() {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await loyaltyApi.getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch loyalty settings'));
      toast({
        title: "Error",
        description: "Failed to fetch loyalty settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<LoyaltySettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = await loyaltyApi.updateSettings(newSettings);
      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Loyalty settings updated successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update loyalty settings'));
      toast({
        title: "Error",
        description: "Failed to update loyalty settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add special event
  const addSpecialEvent = async (event: Omit<LoyaltySettings['specialEvents'][0], 'id'>) => {
    try {
      const newEvent = await loyaltyApi.addSpecialEvent(event);
      setSettings(prev => prev ? {
        ...prev,
        specialEvents: [...prev.specialEvents, newEvent],
      } : null);
      toast({
        title: "Success",
        description: "Special event added successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add special event",
        variant: "destructive",
      });
    }
  };

  // Remove special event
  const removeSpecialEvent = async (eventId: string) => {
    try {
      await loyaltyApi.removeSpecialEvent(eventId);
      setSettings(prev => prev ? {
        ...prev,
        specialEvents: prev.specialEvents.filter(event => event.id !== eventId),
      } : null);
      toast({
        title: "Success",
        description: "Special event removed successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to remove special event",
        variant: "destructive",
      });
    }
  };

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    addSpecialEvent,
    removeSpecialEvent,
    refetch: fetchSettings,
  };
} 