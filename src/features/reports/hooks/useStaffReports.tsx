import { useState, useEffect } from 'react';
import { staffService } from '@/features/staff/services/staffService';
import { Staff } from '@/features/staff/types/staff';
import { useToast } from '@/lib/toast';

export interface StaffReportData {
  name: string;
  role: string;
  department: string;
  sales: number;
  transactions: number;
  avgTicket: number;
  hoursWorked: number;
  performance: number;
  commissions: number;
}

export function useStaffReports() {
  const [reportData, setReportData] = useState<StaffReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStaffReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch staff from the API
      const staffMembers = await staffService.fetchAll();

      // Transform staff data into report data
      const transformedData: StaffReportData[] = staffMembers.map((staff: Staff) => {
        // Generate realistic looking mock data based on real staff info
        const sales = Math.floor(Math.random() * 40000) + 10000;
        const transactions = Math.floor(Math.random() * 150) + 50;
        const avgTicket = sales / transactions;
        const hoursWorked = staff.employmentType === 'full-time' ? 160 : 80;
        const performance = Math.floor(Math.random() * 30) + 70; // 70-100
        const commissions = sales * 0.05; // 5% commission

        return {
          name: `${staff.firstName} ${staff.lastName}`,
          role: staff.role || 'Staff Member',
          department: staff.department || 'General',
          sales,
          transactions,
          avgTicket,
          hoursWorked,
          performance,
          commissions
        };
      });

      setReportData(transformedData);
    } catch (err) {
      console.error('Error fetching staff report data:', err);
      setError('Failed to load staff reports');
      toast({
        title: 'Error',
        description: 'Failed to load staff reports',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStaffReports();
  }, []);

  return {
    reportData,
    isLoading,
    error,
    refetch: fetchStaffReports
  };
}