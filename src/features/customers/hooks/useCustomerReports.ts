import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { customerReportsService } from '../services/customerReportsService';

export interface ReportDateRange {
  from?: Date;
  to?: Date;
}

export function useCustomerReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const getSegmentDistribution = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getSegmentDistribution();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading segment distribution",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getCustomerSegmentsReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getCustomerSegmentsReport();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading customer segments report",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getRetentionReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getRetentionReport();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading retention report",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getAcquisitionReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getAcquisitionReport();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading acquisition report",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getLoyaltyProgramReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getLoyaltyProgramReport();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading loyalty program report",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getCustomerMetrics = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getCustomerMetrics(customerId);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading customer metrics",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getCustomerLifetimeValue = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getCustomerLifetimeValue(customerId);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading customer lifetime value",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getLoyaltyActivity = useCallback(async (customerId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerReportsService.getLoyaltyActivity(customerId);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error loading loyalty activity",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    data,
    getSegmentDistribution,
    getCustomerSegmentsReport,
    getRetentionReport,
    getAcquisitionReport,
    getLoyaltyProgramReport,
    getCustomerMetrics,
    getCustomerLifetimeValue,
    getLoyaltyActivity,
  };
} 