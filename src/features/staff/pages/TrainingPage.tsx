import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Filter, 
  RefreshCw, 
  FileText, 
  BookOpen, 
  Award, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Video, 
  AlertCircle 
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Mock data for training programs
const trainingPrograms = [
  {
    id: "1",
    title: "POS System Training",
    description: "Learn how to use the point of sale system effectively",
    type: "Technical",
    format: "Online",
    duration: "2 hours",
    status: "Active",
    completions: 15,
    enrollments: 20
  },
  {
    id: "2",
    title: "Customer Service Excellence",
    description: "Improve your customer service skills",
    type: "Soft Skills",
    format: "Workshop",
    duration: "4 hours",
    status: "Active",
    completions: 8,
    enrollments: 12
  },
  {
    id: "3",
    title: "Inventory Management",
    description: "Learn best practices for inventory management",
    type: "Technical",
    format: "Online",
    duration: "3 hours",
    status: "Active",
    completions: 5,
    enrollments: 10
  }
];

// Mock data for staff training records
const staffTrainingRecords = [
  {
    id: "1",
    staffId: "101",
    staffName: "John Doe",
    trainingId: "1",
    trainingTitle: "POS System Training",
    startDate: "2023-04-15",
    completionDate: "2023-04-16",
    status: "Completed",
    score: 95
  },
  {
    id: "2",
    staffId: "102",
    staffName: "Jane Smith",
    trainingId: "1",
    trainingTitle: "POS System Training",
    startDate: "2023-04-15",
    completionDate: "2023-04-16",
    status: "Completed",
    score: 88
  },
  {
    id: "3",
    staffId: "103",
    staffName: "Mike Johnson",
    trainingId: "1",
    trainingTitle: "POS System Training",
    startDate: "2023-04-15",
    completionDate: null,
    status: "In Progress",
    score: null
  },
  {
    id: "4",
    staffId: "101",
    staffName: "John Doe",
    trainingId: "2",
    trainingTitle: "Customer Service Excellence",
    startDate: "2023-04-20",
    completionDate: "2023-04-21",
    status: "Completed",
    score: 92
  }
];

// Mock data for staff
const mockStaff = [
  { id: "101", name: "John Doe", role: "Manager" },
  { id: "102", name: "Jane Smith", role: "Cashier" },
  { id: "103", name: "Mike Johnson", role: "Sales Associate" }
];

export function TrainingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("programs");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  
  // Filter training programs based on search and filters
  const filteredPrograms = trainingPrograms.filter(program => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || program.type === filterType;
    const matchesStatus = filterStatus === "all" || program.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Filter training records based on search
  const filteredRecords = staffTrainingRecords.filter(record => {
    return (
      record.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  // Handle adding a new training program
  const handleAddProgram = () => {
    setSelectedProgram(null);
    setShowProgramForm(true);
  };
  
  // Handle editing a training program
  const handleEditProgram = (program: any) => {
    setSelectedProgram(program);
    setShowProgramForm(true);
  };
  
  // Handle saving a training program
  const handleSaveProgram = (data: any) => {
    if (selectedProgram) {
      toast({
        title: "Training program updated",
        description: "The training program has been updated successfully."
      });
    } else {
      toast({
        title: "Training program created",
        description: "The new training program has been created successfully."
      });
    }
    setShowProgramForm(false);
  };
  
  // Handle assigning training to staff
  const handleAssignTraining = () => {
    setShowAssignForm(true);
  };
  
  // Handle saving training assignment
  const handleSaveAssignment = (data: any) => {
    toast({
      title: "Training assigned",
      description: "The training has been assigned to the selected staff members."
    });
    setShowAssignForm(false);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-gray-100 text-gray-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Training"
        description="Manage training programs and staff development"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleAddProgram}>
              <Plus className="h-4 w-4 mr-2" />
              Add Training Program
            </Button>
            <Button variant="outline" onClick={handleAssignTraining}>
              <User className="h-4 w-4 mr-2" />
              Assign Training
            </Button>
          </div>
        }
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="programs" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Training Programs
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Training Records
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            
            {activeTab === "programs" && (
              <>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            
            <Button variant="outline" size="icon" onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
            }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="programs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>Manage your staff training programs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.length > 0 ? (
                    filteredPrograms.map(program => (
                      <TableRow key={program.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{program.title}</div>
                            <div className="text-sm text-muted-foreground">{program.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{program.type}</TableCell>
                        <TableCell>{program.format}</TableCell>
                        <TableCell>{program.duration}</TableCell>
                        <TableCell>
                          <Badge className={program.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {program.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="text-sm">
                              {program.completions}/{program.enrollments} completed
                            </div>
                            <Progress value={(program.completions / program.enrollments) * 100} />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEditProgram(program)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No training programs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="records" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training Records</CardTitle>
              <CardDescription>View staff training progress and completion</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Training</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{record.staffName}</TableCell>
                        <TableCell>{record.trainingTitle}</TableCell>
                        <TableCell>{record.startDate}</TableCell>
                        <TableCell>{record.completionDate || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.score !== null ? `${record.score}%` : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No training records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="text-4xl font-bold">78%</div>
                  <div className="text-sm text-muted-foreground mt-2">Overall completion rate</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="text-4xl font-bold">92%</div>
                  <div className="text-sm text-muted-foreground mt-2">Average training score</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Training Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40">
                  <div className="text-4xl font-bold">124</div>
                  <div className="text-sm text-muted-foreground mt-2">Total training hours</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Training Compliance</CardTitle>
              <CardDescription>Staff training compliance by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Analytics visualization</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Training analytics visualization would be displayed here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Training Program Form Dialog */}
      <Dialog open={showProgramForm} onOpenChange={setShowProgramForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProgram ? 'Edit Training Program' : 'Add Training Program'}
            </DialogTitle>
            <DialogDescription>
              {selectedProgram 
                ? 'Update the details of this training program.' 
                : 'Create a new training program for your staff.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                defaultValue={selectedProgram?.title || ''}
                placeholder="Enter program title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description">Description</label>
              <Input
                id="description"
                defaultValue={selectedProgram?.description || ''}
                placeholder="Enter program description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type">Type</label>
                <Select defaultValue={selectedProgram?.type || 'Technical'}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="format">Format</label>
                <Select defaultValue={selectedProgram?.format || 'Online'}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration">Duration</label>
                <Input
                  id="duration"
                  defaultValue={selectedProgram?.duration || ''}
                  placeholder="e.g. 2 hours"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="status">Status</label>
                <Select defaultValue={selectedProgram?.status || 'Active'}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgramForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProgram}>
              {selectedProgram ? 'Update Program' : 'Create Program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Training Dialog */}
      <Dialog open={showAssignForm} onOpenChange={setShowAssignForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              Assign training programs to staff members.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="training">Training Program</label>
              <Select>
                <SelectTrigger id="training">
                  <SelectValue placeholder="Select training program" />
                </SelectTrigger>
                <SelectContent>
                  {trainingPrograms.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="staff">Staff Members</label>
              <Select>
                <SelectTrigger id="staff">
                  <SelectValue placeholder="Select staff members" />
                </SelectTrigger>
                <SelectContent>
                  {mockStaff.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="start-date">Start Date</label>
                <Input
                  id="start-date"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="due-date">Due Date</label>
                <Input
                  id="due-date"
                  type="date"
                  defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignment}>
              Assign Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
