import { useState, useEffect } from 'react';
import { Staff } from '../types/staff.types';
import { useStaff } from '../hooks/useStaff';
import { StaffList } from '../components/StaffList';
import { StaffForm } from '../components/StaffForm';
import { StaffShiftManager } from '../components/StaffShiftManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const StaffPage = () => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showShiftManager, setShowShiftManager] = useState(false);

  const {
    staff,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  } = useStaff();

  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleCreateStaff = async (data: any) => {
    try {
      await create(data);
      setShowStaffForm(false);
      fetchAll();
      toast({
        title: 'Success',
        description: 'Staff member created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create staff member',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStaff = async (data: any) => {
    if (!selectedStaff) return;
    try {
      await update(selectedStaff.id, data);
      setShowStaffForm(false);
      setSelectedStaff(null);
      fetchAll();
      toast({
        title: 'Success',
        description: 'Staff member updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update staff member',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      await remove(id);
      fetchAll();
      toast({
        title: 'Success',
        description: 'Staff member deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive',
      });
    }
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowStaffForm(true);
  };

  const handleManageShifts = (staff: Staff) => {
    setSelectedStaff(staff);
    setShowShiftManager(true);
  };

  // Mock roles data - replace with real data from API
  const roles = [
    { id: '1', name: 'Manager' },
    { id: '2', name: 'Cashier' },
    { id: '3', name: 'Sales Associate' },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Button onClick={() => setShowStaffForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg">Loading staff...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-red-500 text-lg">Error: {error.message}</div>
        </div>
      ) : (
        <StaffList
          staff={staff}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onManageShifts={handleManageShifts}
        />
      )}

      <Dialog open={showStaffForm} onOpenChange={setShowStaffForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStaff ? 'Edit Staff' : 'Add Staff'}
            </DialogTitle>
          </DialogHeader>

          <StaffForm
            staff={selectedStaff}
            onSubmit={selectedStaff ? handleUpdateStaff : handleCreateStaff}
            onCancel={() => {
              setShowStaffForm(false);
              setSelectedStaff(null);
            }}
            roles={roles}
          />
        </DialogContent>
      </Dialog>

      {selectedStaff && (
        <StaffShiftManager
          staff={selectedStaff}
          open={showShiftManager}
          onOpenChange={setShowShiftManager}
        />
      )}
    </div>
  );
};
