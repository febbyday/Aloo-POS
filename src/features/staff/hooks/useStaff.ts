import { useState, useCallback, useEffect } from 'react';
import { Staff, CreateStaff, UpdateStaff, Shift, CreateShift, UpdateShift } from '../types/staff.types';
import { staffService } from '../services/staffService';
import { useToast } from '@/lib/toast';

interface UseStaffOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoLoad?: boolean;
}

export function useStaff(options: UseStaffOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoLoad = true } = options;

  const [items, setItems] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.fetchAll();
      setItems(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch staff');
      setError(error);
      toast.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const create = useCallback(async (data: CreateStaff) => {
    try {
      const newStaff = await staffService.create(data);
      setItems(current => [...current, newStaff]);
      toast.success('Success', 'Staff member created successfully');
      return newStaff;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create staff');
      toast.error('Error', error.message);
      throw error;
    }
  }, [toast]);

  const update = useCallback(async (id: string, data: UpdateStaff) => {
    try {
      const updatedStaff = await staffService.update(id, data);
      setItems(current =>
        current.map(item => item.id === id ? updatedStaff : item)
      );
      toast.success('Success', 'Staff member updated successfully');
      return updatedStaff;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update staff');
      toast.error('Error', error.message);
      throw error;
    }
  }, [toast]);

  const remove = useCallback(async (id: string) => {
    try {
      await staffService.delete(id);
      setItems(current => current.filter(item => item.id !== id));
      toast.success('Success', 'Staff member deleted successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete staff');
      toast.error('Error', error.message);
      throw error;
    }
  }, [toast]);

  // Load data on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad) {
      fetchAll();
    }
  }, [autoLoad, fetchAll]);

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
}

export const useStaffShifts = (staffId: string) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await staffService.fetchShifts(staffId);
      setShifts(data);
      if (staffService.isUsingMockData()) {
        toast.info('Using Mock Data', 'The backend service is not available. Using mock data instead.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch shifts');
      setError(error);
      toast.error('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  const createShift = useCallback(async (data: CreateShift) => {
    try {
      const newShift = await staffService.createShift(staffId, data);
      setShifts(prev => [...prev, newShift]);
      if (staffService.isUsingMockData()) {
        toast.info('Using Mock Data', 'The backend service is not available. Using mock data instead.');
      }
      toast.success('Success', 'Shift started successfully');
      return newShift;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create shift');
      setError(error);
      toast.error('Error', error.message);
      throw error;
    }
  }, [staffId, toast]);

  const updateShift = useCallback(async (shiftId: string, data: UpdateShift) => {
    try {
      const updatedShift = await staffService.updateShift(staffId, shiftId, data);
      setShifts(prev => prev.map(shift => shift.id === shiftId ? updatedShift : shift));
      if (staffService.isUsingMockData()) {
        toast.info('Using Mock Data', 'The backend service is not available. Using mock data instead.');
      }
      toast.success('Success', 'Shift updated successfully');
      return updatedShift;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update shift');
      setError(error);
      toast.error('Error', error.message);
      throw error;
    }
  }, [staffId, toast]);

  const deleteShift = useCallback(async (shiftId: string) => {
    try {
      await staffService.deleteShift(staffId, shiftId);
      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      if (staffService.isUsingMockData()) {
        toast.info('Using Mock Data', 'The backend service is not available. Using mock data instead.');
      }
      toast.success('Success', 'Shift deleted successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete shift');
      setError(error);
      toast.error('Error', error.message);
      throw error;
    }
  }, [staffId, toast]);

  return {
    shifts,
    loading,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
  };
};