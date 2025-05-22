import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Building
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';

// Mock data for staff shifts
const mockShifts = [
  {
    id: '1',
    staffId: '101',
    staffName: 'John Doe',
    shopId: '201',
    shopName: 'Main Store',
    startTime: '2023-05-01T09:00:00',
    endTime: '2023-05-01T17:00:00',
    status: 'COMPLETED'
  },
  {
    id: '2',
    staffId: '102',
    staffName: 'Jane Smith',
    shopId: '201',
    shopName: 'Main Store',
    startTime: '2023-05-01T09:00:00',
    endTime: '2023-05-01T17:00:00',
    status: 'COMPLETED'
  },
  {
    id: '3',
    staffId: '103',
    staffName: 'Mike Johnson',
    shopId: '202',
    shopName: 'Downtown Branch',
    startTime: '2023-05-01T12:00:00',
    endTime: '2023-05-01T20:00:00',
    status: 'COMPLETED'
  },
  {
    id: '4',
    staffId: '101',
    staffName: 'John Doe',
    shopId: '201',
    shopName: 'Main Store',
    startTime: '2023-05-02T09:00:00',
    endTime: '2023-05-02T17:00:00',
    status: 'COMPLETED'
  },
  {
    id: '5',
    staffId: '102',
    staffName: 'Jane Smith',
    shopId: '202',
    shopName: 'Downtown Branch',
    startTime: '2023-05-02T12:00:00',
    endTime: '2023-05-02T20:00:00',
    status: 'COMPLETED'
  }
];

// Mock data for staff
const mockStaff = [
  { id: '101', name: 'John Doe', role: 'Manager' },
  { id: '102', name: 'Jane Smith', role: 'Cashier' },
  { id: '103', name: 'Mike Johnson', role: 'Sales Associate' }
];

// Mock data for shops
const mockShops = [
  { id: '201', name: 'Main Store' },
  { id: '202', name: 'Downtown Branch' }
];

export function SchedulePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [shifts, setShifts] = useState(mockShifts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterShop, setFilterShop] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);



  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter shifts based on search and filters
  const filteredShifts = shifts.filter(shift => {
    const matchesSearch =
      shift.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.shopName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesShop = filterShop === 'all' || shift.shopId === filterShop;
    const matchesStaff = filterStaff === 'all' || shift.staffId === filterStaff;

    return matchesSearch && matchesShop && matchesStaff;
  });

  // Handle adding a new shift
  const handleAddShift = () => {
    setSelectedShift(null);
    setShowShiftForm(true);
  };

  // Handle editing a shift
  const handleEditShift = (shift: any) => {
    setSelectedShift(shift);
    setShowShiftForm(true);
  };

  // Handle deleting a shift
  const handleDeleteShift = (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      setShifts(shifts.filter(shift => shift.id !== shiftId));
      toast({
        title: 'Shift deleted',
        description: 'The shift has been deleted successfully.'
      });
    }
  };

  // Handle saving a shift (add or edit)
  const handleSaveShift = (data: any) => {
    if (selectedShift) {
      // Edit existing shift
      setShifts(shifts.map(shift =>
        shift.id === selectedShift.id ? { ...shift, ...data } : shift
      ));
      toast({
        title: 'Shift updated',
        description: 'The shift has been updated successfully.'
      });
    } else {
      // Add new shift
      const newShift = {
        id: Math.random().toString(36).substring(2, 9),
        ...data
      };
      setShifts([...shifts, newShift]);
      toast({
        title: 'Shift added',
        description: 'The new shift has been added successfully.'
      });
    }
    setShowShiftForm(false);
  };

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Get current period display text
  const getPeriodText = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Schedule"
        description="Manage staff shifts and schedules"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleAddShift}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">{getPeriodText()}</span>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>

            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="w-[150px]">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {mockStaff.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterShop} onValueChange={setFilterShop}>
              <SelectTrigger className="w-[150px]">
                <Building className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {mockShops.map(shop => (
                  <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery('');
              setFilterShop('all');
              setFilterStaff('all');
            }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
          <CardDescription>View and manage staff shifts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading schedule data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.length > 0 ? (
                  filteredShifts.map(shift => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.staffName}</TableCell>
                      <TableCell>{shift.shopName}</TableCell>
                      <TableCell>{formatDate(shift.startTime, { format: 'short' })}</TableCell>
                      <TableCell>
                        {formatDate(shift.startTime, { format: 'short', includeTime: true })} - {formatDate(shift.endTime, { format: 'short', includeTime: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shift.status)}>
                          {shift.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditShift(shift)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No shifts found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Shift Form Dialog */}
      <Dialog open={showShiftForm} onOpenChange={setShowShiftForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedShift ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
            <DialogDescription>
              {selectedShift
                ? 'Update the details for this shift.'
                : 'Create a new shift for a staff member.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="staff" className="text-right">Staff</label>
              <Select defaultValue={selectedShift?.staffId || ''} className="col-span-3">
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="location" className="text-right">Location</label>
              <Select defaultValue={selectedShift?.shopId || ''} className="col-span-3">
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {mockShops.map(shop => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">Date</label>
              <Input
                id="date"
                type="date"
                defaultValue={selectedShift
                  ? new Date(selectedShift.startTime).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="start-time" className="text-right">Start Time</label>
              <Input
                id="start-time"
                type="time"
                defaultValue={selectedShift
                  ? new Date(selectedShift.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : '09:00'
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="end-time" className="text-right">End Time</label>
              <Input
                id="end-time"
                type="time"
                defaultValue={selectedShift
                  ? new Date(selectedShift.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : '17:00'
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right">Status</label>
              <Select defaultValue={selectedShift?.status || 'ACTIVE'} className="col-span-3">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftForm(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // In a real app, you would collect form data here
              const mockData = {
                staffId: '101',
                staffName: 'John Doe',
                shopId: '201',
                shopName: 'Main Store',
                startTime: '2023-05-03T09:00:00',
                endTime: '2023-05-03T17:00:00',
                status: 'ACTIVE'
              };
              handleSaveShift(mockData);
            }}>
              {selectedShift ? 'Update Shift' : 'Add Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
