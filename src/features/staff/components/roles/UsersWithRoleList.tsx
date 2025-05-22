/**
 * Users With Role List
 *
 * Displays and manages users assigned to a specific role
 * Supports searching, filtering, and user role assignment
 */
import React, { useEffect, useState } from 'react';
import { User } from '@/features/auth/types/auth.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast';
import { Search, MoreHorizontal, UserPlus, UserMinus, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUserManagement } from '../../hooks/useUserManagement';

interface UsersWithRoleListProps {
  roleId: string;
}

export function UsersWithRoleList({ roleId }: UsersWithRoleListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const {
    usersWithRole,
    availableUsers,
    isLoading,
    error,
    loadUsersWithRole,
    assignUserToRole,
    removeUserFromRole
  } = useUserManagement(roleId);

  // Load users when the component mounts or roleId changes
  useEffect(() => {
    loadUsersWithRole(roleId);
  }, [roleId, loadUsersWithRole]);

  // Filter users based on search query
  const filteredUsers = usersWithRole.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle user role assignment
  const handleAssignUser = async (userId: string) => {
    try {
      await assignUserToRole(userId, roleId);
      toast({
        title: "User assigned successfully",
        description: "The user has been assigned to this role.",
      });
      setShowAssignDialog(false);
    } catch (error) {
      toast({
        title: "Failed to assign user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle user role removal
  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromRole(userId, roleId);
      toast({
        title: "User removed successfully",
        description: "The user has been removed from this role.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Get user full name
  const getUserFullName = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading users: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 UsersWithRoleList">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64"
          />
        </div>
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign User to Role</DialogTitle>
              <DialogDescription>
                Select a user to assign to this role. Users already assigned to this role won't be shown.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Search users..."
                className="mb-4"
              />
              <ScrollArea className="h-72">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No available users to assign
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getUserFullName(user)}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignUser(user.id)}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No users found</h3>
          <p className="text-muted-foreground">
            {usersWithRole.length === 0
              ? "No users have been assigned to this role yet."
              : "No users match your search criteria."}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{getUserFullName(user)}</p>
                        <p className="text-xs text-muted-foreground">{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {user.lastLogin
                        ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                        : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleRemoveUser(user.id)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
