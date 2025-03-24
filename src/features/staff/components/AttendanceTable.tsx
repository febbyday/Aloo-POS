import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Eye } from "lucide-react"
import { AttendanceRecord } from "../types/attendance"
import { format, parseISO } from "date-fns"

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onEdit?: (record: AttendanceRecord) => void;
  onAddNote?: (record: AttendanceRecord) => void;
  onViewNotes: (record: AttendanceRecord) => void;
}

export function AttendanceTable({ records, onEdit, onAddNote, onViewNotes }: AttendanceTableProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // Filter records by selected date if any
  const filteredRecords = selectedDate 
    ? records.filter(record => record.date === selectedDate)
    : records;
  
  // Sort records by date and login time (newest first)
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (a.date !== b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime();
  });

  // Group records by date for easier display
  const recordsByDate = sortedRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'on-time':
        return (
          <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/10">
            On Time
          </Badge>
        );
      case 'late':
        return (
          <Badge className="bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 border-amber-500/10">
            Late
          </Badge>
        );
      case 'absent':
        return (
          <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/10">
            Absent
          </Badge>
        );
      case 'left-early':
        return (
          <Badge className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border-blue-500/10">
            Left Early
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Login Time</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Logout Time</span>
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(recordsByDate).flatMap(([date, dateRecords]) => (
              dateRecords.map((record, index) => (
                <TableRow key={record.id} className="py-2">
                  <TableCell className="py-2">
                    {index === 0 ? (
                      <div className="font-medium">
                        {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-2">
                    {formatTime(record.loginTime)}
                  </TableCell>
                  <TableCell className="py-2">
                    {record.logoutTime ? formatTime(record.logoutTime) : '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell className="py-2 max-w-[200px] truncate">
                    {record.notes || '-'}
                  </TableCell>
                  <TableCell className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      {onAddNote && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onAddNote(record)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Notes
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewNotes(record)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ))}
            
            {sortedRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No attendance records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
