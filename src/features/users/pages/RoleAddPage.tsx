import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { RoleModal } from '../components/roles/RoleModal';
import { useRoleHistory } from '../context/RoleHistoryContext';
import { RoleFormData } from '@/features/users/types/RoleFormData';
// Import from the main users module instead of the staff module
import { useRoles } from '@/features/users/hooks/useRoles';
import { roleService } from '@/features/users/services/roleService';

export function RoleAddPage() {
  const navigate = useNavigate();
  const { createRole } = useRoles();
  const toast = useToast();
  const { trackAction } = useRoleHistory();
  const [modalOpen, setModalOpen] = useState(true);

  const handleSubmit = async (data: RoleFormData) => {
    try {
      // Convert permissions to the format expected by the API
      const permissionsArray: string[] = [];

      // Convert complex permissions object to string array for API
      if (typeof data.permissions === 'object') {
        for (const [moduleName, modulePerms] of Object.entries(data.permissions)) {
          // Check if the module has any permissions enabled
          const hasPermissions = Object.values(modulePerms).some(
            value => value === true || value === 'all' || value === 'dept' || value === 'self'
          );

          if (hasPermissions) {
            // Add basic module permission
            permissionsArray.push(moduleName);

            // Add specific permissions
            if (typeof modulePerms === 'object') {
              for (const [action, value] of Object.entries(modulePerms)) {
                if (value === 'all' || value === true) {
                  permissionsArray.push(`${moduleName}.${action}`);
                }
              }
            }
          }
        }
      }

      // Create the role using the service directly
      const roleData = {
        name: data.name,
        description: data.description || '',
        permissions: permissionsArray,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      console.log('Creating role with data:', roleData);
      const newRole = await roleService.createRole(roleData);

      // Track this action for history
      trackAction(
        { type: 'create_role', role: newRole },
        `Created role "${data.name}"`
      );

      toast.success('Success', 'Role created successfully');
      navigate('/users/roles');
    } catch (error) {
      console.error('Error creating role:', error);

      // Check if it's a timeout error
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('timed out');

      if (isTimeoutError) {
        toast.error(
          'Connection Timeout',
          'The server is taking too long to respond. Please try again later or check your network connection.'
        );

        // Log detailed information for debugging
        console.warn('Role creation timeout details:', {
          timestamp: new Date().toISOString(),
          errorMessage,
          roleData: {
            name: data.name,
            description: data.description?.substring(0, 20) + '...',
            permissionsCount: typeof data.permissions === 'object' ?
              Object.keys(data.permissions).length : 'unknown'
          }
        });
      } else {
        toast.error('Error', 'Failed to create role: ' + errorMessage);
      }
    }
  };

  const handleCancel = () => {
    navigate('/users/roles');
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
