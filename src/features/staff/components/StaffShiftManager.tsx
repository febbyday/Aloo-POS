import { useState, useEffect } from 'react';
import { Staff, Shift, CreateShift, UpdateShift } from '../types/staff.types';
import { useStaffShifts } from '../hooks/useStaff';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { ShiftForm } from './ShiftForm';

interface StaffShiftManagerProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffShiftManager = ({
  staff,
  open,
  onOpenChange,
}: StaffShiftManagerProps) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showShiftForm, setShowShiftForm] = useState(false);

  const {
    shifts,
    loading,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
  } = useStaffShifts(staff.id);

  useEffect(() => {
    if (open) {
      fetchShifts();
    }
  }, [open, fetchShifts]);

  const handleCreateShift = async (data: CreateShift) => {
    try {
      await createShift(data);
      setShowShiftForm(false);
      fetchShifts();
    } catch (error) {
      console.error('Failed to create shift:', error);
    }
  };

  const handleUpdateShift = async (data: UpdateShift) => {
    if (!selectedShift) return;
    try {
      await updateShift(selectedShift.id, data);
      setShowShiftForm(false);
      setSelectedShift(null);
      fetchShifts();
    } catch (error) {
      console.error('Failed to update shift:', error);
    }
  };

  const handleDeleteShift = async (id: string) => {
    try {
      await deleteShift(id);
      fetchShifts();
    } catch (error) {
      console.error('Failed to delete shift:', error);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: Shift['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'COMPLETED':
        return 'bg-blue-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getShopName = (shopId: string) => {
    const shop = staff.shops.find(s => s.id === shopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Manage Shifts - {staff.firstName} {staff.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowShiftForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>

        {loading ? (
          <div>Loading shifts...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error.message}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{formatDateTime(shift.startTime)}</TableCell>
                  <TableCell>
                    {shift.endTime ? formatDateTime(shift.endTime) : '-'}
                  </TableCell>
                  <TableCell>{getShopName(shift.shopId)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shift.status)}>
                      {shift.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedShift(shift);
                        setShowShiftForm(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={showShiftForm} onOpenChange={setShowShiftForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedShift ? 'Edit Shift' : 'Add Shift'}
              </DialogTitle>
            </DialogHeader>
            <ShiftForm
              shift={selectedShift}
              onSubmit={selectedShift ? handleUpdateShift : handleCreateShift}
              onCancel={() => {
                setShowShiftForm(false);
                setSelectedShift(null);
              }}
              shops={staff.shops}
            />
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}; 