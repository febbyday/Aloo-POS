import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Shield } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useToast } from '@/lib/toast';
import { RoleModal } from '../components/roles/RoleModal';
import { useRoleHistory } from '../context/RoleHistoryContext';
import { RoleFormData } from '@/features/users/types/RoleFormData';
import { useRoles } from '@/features/users/hooks/useRoles';
import { Role } from '@/features/users/types/role';
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

export function RoleEditPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { getRoleById, updateRole, deleteRole } = useRoles();
  const { toast } = useToast();
  const showToast = useToastManager();
  const { trackAction } = useRoleHistory();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch role data
  useEffect(() => {
    const fetchRole = async () => {
      if (!roleId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const roleData = await getRoleById(roleId);

        if (roleData) {
          setRole(roleData);
        } else {
          toast({
            title: "Error",
            description: "Role not found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching role details:", error);
        toast({
          title: "Error",
          description: "Failed to load role details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [roleId, getRoleById, toast]);

  const handleSubmit = async (data: RoleFormData) => {
    if (!roleId || !role) return;

    try {
      // Update the role
      const updatedRole = await updateRole(roleId, {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
        isActive: data.isActive
      });

      // Track this action for history
      trackAction(
        {
          type: 'update_role',
          id: roleId,
          before: role,
          after: updatedRole
        },
        `Updated role "${data.name}"`
      );

      showToast.success('Success', 'Role updated successfully');
      navigate('/users/roles');
    } catch (error) {
      console.error('Error updating role:', error);
      showToast.error('Error', 'Failed to update role');
    }
  };

  const handleDelete = async () => {
    if (!roleId || !role) return;

    try {
      // Delete the role
      await deleteRole(roleId);

      // Track this action for history
      trackAction(
        {
          type: 'delete_role',
          role: role
        },
        `Deleted role "${role.name}"`
      );

      showToast.success('Success', 'Role deleted successfully');
      navigate('/users/roles');
    } catch (error) {
      console.error('Error deleting role:', error);
      showToast.error('Error', 'Failed to delete role');
    }
  };

  const handleCancel = () => {
    navigate('/users/roles');
  };

  if (loading) {
    return <div>Loading role data...</div>;
  }

  if (!role) {
    return <div>Role not found</div>;
  }

  return (
    <div className="w-full pb-6 space-y-4 mx-auto max-w-[1920px]">
      <PageHeader
        title="Edit Role"
        description="Update role information and permissions"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            {!role.isSystemRole && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Role
              </Button>
            )}
          </div>
        }
      />

      <RoleModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          handleCancel();
        }}
        initialData={role}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove it from any staff members it's assigned to.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
