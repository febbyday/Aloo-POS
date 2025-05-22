/**
 * Roles List
 *
 * Displays a list of available user roles with key information
 * Allows selection of roles for editing
 */
import React from 'react';
import { IRole } from '@/features/users/types/role';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Users, Calendar, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RolesListProps {
  roles: IRole[];
  onSelectRole: (role: IRole) => void;
}

export function RolesList({ roles, onSelectRole }: RolesListProps) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No roles found</h3>
        <p className="text-muted-foreground">
          No roles match your search criteria. Try adjusting your search or create a new role.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex flex-col">
                  <div className="font-medium flex items-center">
                    {role.name}
                    {role.isSystemRole && (
                      <Badge variant="outline" className="ml-2">
                        System
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {role.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {role.staffCount}
                </div>
              </TableCell>
              <TableCell>
                {role.isActive ? (
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(role.updatedAt), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectRole(role)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
