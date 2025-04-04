import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/components/ui/use-toast';
import { useToastManager } from "@/components/ui/toast-manager";
import { RoleModal } from '../components/RoleModal';
import { useRoleHistory } from '../context/RoleHistoryContext';
import { RoleFormData } from '../types/RoleFormData';
import { useRoles } from '../hooks/useRoles';

export function RoleAddPage() {
  const navigate = useNavigate();
  const { createRole } = useRoles();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useRoleHistory();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = async (data: RoleFormData) => {
    try {
      // Create the role
      const newRole = await createRole({
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isActive: data.isActive
      });

      // Track this action for history
      trackAction(
        { type: 'create_role', role: newRole },
        `Created role "${data.name}"`
      );

      showToast.success('Success', 'Role created successfully');
      navigate('/staff/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      showToast.error('Error', 'Failed to create role');
    }
  };

  const handleCancel = () => {
    navigate('/staff/roles');
  };

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Add New Role"
        description="Create a new role with specific permissions"
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

      <RoleModal
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
