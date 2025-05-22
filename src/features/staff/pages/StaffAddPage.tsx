import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { OperationButton } from "@/components/ui/action-feedback";
import { StaffModal } from '../components/StaffModal';
import { useStaffHistory } from '../context/StaffHistoryContext';
import { StaffFormData } from '../types/staff';

export function StaffAddPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useStaffHistory();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = (data: StaffFormData) => {
    try {
      // Track this action for history
      trackAction(
        { type: 'create_staff', staff: data as any },
        `Created staff member ${data.firstName} ${data.lastName}`
      );

      showToast.success('Success', 'Staff member created successfully');
      navigate('/staff');
    } catch (error) {
      console.error('Error creating staff member:', error);
      showToast.error('Error', 'Failed to create staff member');
    }
  };

  const handleCancel = () => {
    navigate('/staff');
  };

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Staff Member"
        description="Create a new staff member in your system"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
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
        onSubmit={handleSubmit}
      />
    </div>
  );
}
