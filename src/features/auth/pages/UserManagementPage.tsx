import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import {
  UserCog,
  Search,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserTable } from '@/features/users/components/UserTable';
import { UserForm } from '@/features/users/components/UserForm';
import { User } from '@/features/users/types/user.types';
import { pinAuthService } from '@/features/auth/services/pinAuthService';
import { toast } from '@/lib/toast';

/**
 * User Management Page
 *
 * This page provides an interface for managing users in the system.
 */
export function UserManagementPage() {
  // State for search and dialogs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the users hook
  const {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    handlePageChange
  } = useUsers();

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  // Handle view user
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle reset password
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsResetPasswordDialogOpen(true);
  };

  // Handle create user submission
  const handleCreateUserSubmit = async (userData: any) => {
    try {
      setIsSubmitting(true);
      await createUser(userData);
      setIsEditDialogOpen(false);

      // Show success toast
      toast({
        title: "Success",
        description: "User created successfully",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Failed to create user:', error);

      // Don't close the dialog on error so user can try again
      // Only show toast if it's not already handled by the useUsers hook
      if (error.name !== 'AbortError' && error.message !== 'Request was cancelled') {
        toast({
          title: "Error",
          description: error.message || "Failed to create user. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update user submission
  const handleUpdateUserSubmit = async (userData: any) => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await updateUser(selectedUser.id, userData);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmitting(true);
      await deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm reset password
  const handleConfirmResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      setIsSubmitting(true);
      await resetPassword(selectedUser.id, newPassword);
      setIsResetPasswordDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset user PIN
  const handleResetUserPin = async (userId: string): Promise<boolean> => {
    try {
      setIsSubmitting(true);

      // Find the user first
      const userToReset = users.find(user => user.id === userId);
      if (!userToReset) {
        toast({
          title: "User Not Found",
          description: "Could not find the user to reset PIN.",
          variant: "destructive"
        });
        return false;
      }

      // Call the PIN service to reset PIN
      const result = await pinAuthService.resetUserPin(userId);

      if (result.success) {
        // Update the user in the UI to reflect the PIN reset
        await fetchUsers();

        toast({
          title: "PIN Reset Successful",
          description: `${userToReset.firstName} ${userToReset.lastName}'s PIN has been reset.`
        });
        return true;
      } else {
        toast({
          title: "Failed to Reset PIN",
          description: result.error || "An error occurred while trying to reset the PIN.",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error resetting user PIN:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while resetting the PIN.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Users"
        description="Manage system users and their access permissions"
        actions={<UserCog className="h-6 w-6" />}
      />

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setIsEditDialogOpen(true);
        }}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPassword}
      />

      {/* Create New User Dialog */}
      {!selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open && isSubmitting) return; // Prevent closing while submitting
          setIsEditDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreateUserSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              onResetPin={handleResetUserPin}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedUser.firstName} {selectedUser.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Username:</div>
                <div className="col-span-3">{selectedUser.username}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email:</div>
                <div className="col-span-3">{selectedUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Full Name:</div>
                <div className="col-span-3">{selectedUser.firstName} {selectedUser.lastName}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Role:</div>
                <div className="col-span-3">{selectedUser.role}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Status:</div>
                <div className="col-span-3">{selectedUser.isActive ? 'Active' : 'Inactive'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Last Login:</div>
                <div className="col-span-3">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : 'Never'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                handleEditUser(selectedUser);
              }}>
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog (Only for existing users) */}
      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          if (!open && isSubmitting) return; // Prevent closing while submitting
          setIsEditDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={selectedUser}
              onSubmit={handleUpdateUserSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              onResetPin={handleResetUserPin}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {selectedUser && ` ${selectedUser.firstName} ${selectedUser.lastName}`} and remove their
              data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.firstName} {selectedUser?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="font-medium">New Password:</div>
              <Input
                className="col-span-3"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmResetPassword}
              disabled={isSubmitting || !newPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
