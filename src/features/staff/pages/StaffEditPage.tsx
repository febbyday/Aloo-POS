import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { OperationButton } from "@/components/ui/action-feedback";
import { StaffModal } from '../components/StaffModal';
import { useStaffHistory } from '../context/StaffHistoryContext';
import { StaffFormData } from '../types/staff';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function StaffEditPage() {
  const { staffId } = useParams<{ staffId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useStaffHistory();
  
  const [staff, setStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch staff data
  useEffect(() => {
    if (staffId) {
      setLoading(true);
      // Mock data for now - in a real app, you would fetch from an API
      setStaff({
        id: staffId,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        role: "Manager",
        status: "active",
        hireDate: "2023-01-15",
        department: "Sales",
        position: "Sales Manager",
        employmentType: "full-time",
        createdAt: "2023-01-15T00:00:00Z",
        updatedAt: "2023-01-15T00:00:00Z"
      });
      setLoading(false);
    }
  }, [staffId]);

  const handleSubmit = (data: StaffFormData) => {
    if (!staffId || !staff) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'update_staff', 
          id: staffId,
          before: staff,
          after: data as any
        },
        `Updated staff member ${data.firstName} ${data.lastName}`
      );

      showToast.success('Success', 'Staff member updated successfully');
      navigate('/staff');
    } catch (error) {
      console.error('Error updating staff member:', error);
      showToast.error('Error', 'Failed to update staff member');
    }
  };

  const handleDelete = () => {
    if (!staffId || !staff) return;
    
    try {
      // Track this action for history
      trackAction(
        { 
          type: 'delete_staff', 
          staff: staff
        },
        `Deleted staff member ${staff.firstName} ${staff.lastName}`
      );

      showToast.success('Success', 'Staff member deleted successfully');
      navigate('/staff');
    } catch (error) {
      console.error('Error deleting staff member:', error);
      showToast.error('Error', 'Failed to delete staff member');
    }
  };

  const handleCancel = () => {
    navigate('/staff');
  };

  if (loading) {
    return <div>Loading staff data...</div>;
  }

  if (!staff) {
    return <div>Staff member not found</div>;
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Staff Member"
        description="Update staff member information"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Staff Member
            </Button>
          </div>
        }
      />

      <StaffModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          handleCancel();
        }}
        initialData={staff}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
