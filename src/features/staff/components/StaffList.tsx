import { Staff } from '../types/staff.types';
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
import { Edit, Trash2, Calendar } from 'lucide-react';

interface StaffListProps {
  staff: Staff[];
  onEdit: (staff: Staff) => void;
  onDelete: (id: string) => void;
  onManageShifts: (staff: Staff) => void;
}

export const StaffList = ({
  staff,
  onEdit,
  onDelete,
  onManageShifts,
}: StaffListProps) => {
  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'INACTIVE':
        return 'bg-red-500';
      case 'ON_LEAVE':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.code}</TableCell>
            <TableCell>
              {member.firstName} {member.lastName}
            </TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>{member.phone || '-'}</TableCell>
            <TableCell>{member.role.name}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(member.status)}>
                {member.status}
              </Badge>
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManageShifts(member)}
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(member)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(member.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 