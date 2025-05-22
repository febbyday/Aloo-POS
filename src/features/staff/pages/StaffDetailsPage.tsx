import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
// Import useToast from @/lib/toast instead (see line 96)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Building,
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  FileType,
  Home,
  Info,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  School,
  Trash2,
  Upload,
  User,
  X,
  Camera,
  Undo2,
  Redo2
} from "lucide-react"
import { Staff } from "../types/staff"
import { StaffModal } from "../components/StaffModal"
import { AttendanceTable } from "../components/AttendanceTable"
import { AttendanceRecord } from "../types/attendance"
import { AttendanceNotesModal } from "../components/AttendanceNotesModal"
import { generateMockAttendanceData, getStaffAttendance, addNoteToAttendanceRecord } from "../services/attendanceService"
import { useToast } from '@/lib/toast'
import { useToastManager } from '@/components/ui/toast-manager'
import { useStaffHistory } from '../context/StaffHistoryContext'
import { FieldHelpTooltip, InfoBox } from '@/components/ui/help-tooltip'
import { OperationButton, ActionStatus, ActionFeedback } from '@/components/ui/action-feedback'
import { LoadingState } from '@/components/ui/loading-state'
import { staffService } from "../services/staffService"

export function StaffDetailsPage() {
  const { staffId } = useParams()
  const navigate = useNavigate()
  const [staff, setStaff] = useState<Staff | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isAttendanceNotesModalOpen, setIsAttendanceNotesModalOpen] = useState(false)
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null)
  const [staffNotes, setStaffNotes] = useState<string>("")
  const [notesHistory, setNotesHistory] = useState<Array<{date: string; note: string; author: string}>>([])
  const [documents, setDocuments] = useState<Array<{id: string; name: string; type: string; size: string; uploadDate: string}>>([])
  const [selectedDocument, setSelectedDocument] = useState<{id: string; name: string; type: string; url?: string} | null>(null)
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [isProfileImageUploadOpen, setIsProfileImageUploadOpen] = useState(false)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [isEmergencyContactModalOpen, setIsEmergencyContactModalOpen] = useState(false)
  const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState(false)
  const [isBankingDetailsModalOpen, setIsBankingDetailsModalOpen] = useState(false)
  const [emergencyContact, setEmergencyContact] = useState<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  } | null>(null)
  const [identification, setIdentification] = useState<{
    type: string;
    number: string;
    issuedBy?: string;
    issueDate?: string;
    expiryDate?: string;
  } | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)) // YYYY-MM format
  const [calendarData, setCalendarData] = useState<Array<{date: string; status: string; hours?: number}>>([])
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const showToast = useToastManager()
  const { trackAction, canUndo, undo, canRedo, redo } = useStaffHistory()
  const [operationStatus, setOperationStatus] = useState<ActionStatus>("idle")

  // Fetch staff details from API
  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) {
        setError("Staff ID is missing")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const staffData = await staffService.fetchById(staffId)

        if (!staffData) {
          setError("Staff not found")
          toast({
            title: "Error",
            description: "Staff member not found.",
            variant: "destructive"
          })
        } else {
          setStaff(staffData)
        }
      } catch (error) {
        console.error("Error fetching staff details:", error)
        setError("Failed to load staff details")
        toast({
          title: "Error",
          description: "Failed to load staff details. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [staffId, toast])

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Command+Z (Undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault()
        const action = undo()
        if (action) {
          showToast.info("Undo", "Last action has been undone")
        }
      }

      // Check for Ctrl+Shift+Z or Command+Shift+Z (Redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault()
        const action = redo()
        if (action) {
          showToast.info("Redo", "Action has been reapplied")
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, undo, redo, showToast])

  useEffect(() => {
    // Simulate loading staff data
    setTimeout(() => {
      setIsLoading(false)

      // Set emergency contact if available
      if (staff && staff.emergencyContact) {
        setEmergencyContact(staff.emergencyContact)
      }

      // Set identification if available
      if (staff && staff.identification) {
        setIdentification(staff.identification)
      }
    }, 1000)
  }, [staff])

  useEffect(() => {
    // Generate calendar data for the selected month
    if (staff) {
      generateCalendarData(selectedMonth)
    }
  }, [selectedMonth, staff])

  const generateCalendarData = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    // Generate random attendance data for the month
    const data = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const dayOfWeek = new Date(date).getDay()

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        data.push({
          date,
          status: 'weekend'
        })
        continue
      }

      // Random status (present, late, absent, leave)
      const rand = Math.random()
      let status
      let hours

      if (rand < 0.7) {
        status = 'present'
        hours = 8 + Math.floor(Math.random() * 3) // 8-10 hours
      } else if (rand < 0.85) {
        status = 'late'
        hours = 5 + Math.floor(Math.random() * 3) // 5-7 hours
      } else if (rand < 0.95) {
        status = 'absent'
      } else {
        status = 'leave'
      }

      data.push({
        date,
        status,
        hours
      })
    }

    setCalendarData(data)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'leave':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'weekend':
        return 'bg-gray-50 text-gray-400 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    return new Date(`${year}-${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })
  }

  const changeMonth = (increment: number) => {
    const [year, month] = selectedMonth.split('-').map(Number)

    let newMonth = month + increment
    let newYear = year

    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    } else if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }

    setSelectedMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`)
  }

  const handleEditStaff = async (updatedStaffData: Staff) => {
    if (!staff || !staffId) return

    try {
      setIsLoading(true)

      const updatedStaff = await staffService.update(staffId, updatedStaffData)

      setStaff(updatedStaff)

      toast({
        title: "Staff Updated",
        description: `${updatedStaff.firstName} ${updatedStaff.lastName}'s information has been updated.`
      })

      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating staff:", error)
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!staff || !staffId) return

    try {
      setIsLoading(true)

      const success = await staffService.delete(staffId)

      if (success) {
        toast({
          title: "Staff Deleted",
          description: `${staff.firstName} ${staff.lastName} has been deleted.`
        })

        // Navigate back to staff list
        navigate("/staff", { replace: true })
      }
    } catch (error) {
      console.error("Error deleting staff:", error)
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
    const allowedTypes = ['pdf', 'docx', 'doc', 'xlsx', 'xls']

    if (!allowedTypes.includes(fileExtension)) {
      showToast.error("Invalid file type", "Please upload PDF, Word, or Excel files only")
      return
    }

    // Mock file upload with progress
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // Determine file type for icon
          let fileType = "other"
          if (fileExtension === 'pdf') fileType = "pdf"
          else if (['doc', 'docx'].includes(fileExtension)) fileType = "word"
          else if (['xls', 'xlsx'].includes(fileExtension)) fileType = "excel"

          // Add the uploaded file to documents
          const newDoc = {
            id: `doc${Date.now()}`,
            name: file.name,
            type: fileType,
            size: `${(file.size / 1024).toFixed(0)} KB`,
            uploadDate: new Date().toISOString().split('T')[0]
          }

          setDocuments(prev => [newDoc, ...prev])

          showToast.success("Upload complete", `${file.name} has been uploaded successfully.`)

          return 0
        }
        return prev + 10
      })
    }, 300)
  }

  const handleViewDocument = (doc: {id: string; name: string; type: string}) => {
    // In a real app, this would fetch the document URL from the server
    setSelectedDocument({
      ...doc,
      url: `/mock-documents/${doc.name}` // Mock URL
    })
    setIsDocumentViewerOpen(true)
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />
      case 'word':
        return <FileText className="h-6 w-6 text-blue-500" />
      case 'excel':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const renderDocumentPreview = () => {
    if (!selectedDocument) return null;

    switch (selectedDocument.type) {
      case 'pdf':
        return (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-md p-6 overflow-hidden">
            <div className="bg-red-50 p-8 rounded-md mb-4 border border-red-100">
              <FileText className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <div className="w-full max-w-md">
              <div className="h-6 bg-gray-200 rounded-md w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-4/5 mb-2"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              PDF Viewer - In a real application, this would use a PDF rendering library
            </p>
          </div>
        );

      case 'word':
        return (
          <div className="h-full flex flex-col bg-white rounded-md overflow-hidden">
            <div className="bg-blue-600 text-white p-2 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{selectedDocument.name}</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full mb-6"></div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground py-2 bg-gray-50 border-t">
              Word Document Viewer
            </p>
          </div>
        );

      case 'excel':
        return (
          <div className="h-full flex flex-col bg-white rounded-md overflow-hidden">
            <div className="bg-green-600 text-white p-2 flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">{selectedDocument.name}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-6 border-b">
                <div className="p-2 border-r bg-gray-100 font-medium text-xs text-center">A</div>
                <div className="p-2 border-r bg-gray-100 font-medium text-xs text-center">B</div>
                <div className="p-2 border-r bg-gray-100 font-medium text-xs text-center">C</div>
                <div className="p-2 border-r bg-gray-100 font-medium text-xs text-center">D</div>
                <div className="p-2 border-r bg-gray-100 font-medium text-xs text-center">E</div>
                <div className="p-2 bg-gray-100 font-medium text-xs text-center">F</div>
              </div>

              {[...Array(10)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 border-b">
                  <div className="p-2 border-r bg-gray-50 font-medium text-xs text-center">{rowIndex + 1}</div>
                  {[...Array(5)].map((_, colIndex) => (
                    <div key={colIndex} className="p-2 border-r text-xs"></div>
                  ))}
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground py-2 bg-gray-50 border-t">
              Excel Viewer
            </p>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mb-4">
                {getDocumentIcon(selectedDocument.type)}
              </div>
              <p className="text-muted-foreground mb-2">
                Preview not available for this file type
              </p>
              <p className="text-xs text-muted-foreground">
                You can download the file to view its contents
              </p>
            </div>
          </div>
        );
    }
  };

  const handleAddAttendanceNote = (record: AttendanceRecord) => {
    setSelectedAttendanceRecord(record);
    setIsAttendanceNotesModalOpen(true);
  };

  const handleSaveStaffNotes = () => {
    if (!staff || !staffNotes.trim()) return;

    // In a real app, this would be an API call to update the staff notes
    const newNote = {
      date: new Date().toISOString().split('T')[0],
      note: staffNotes,
      author: "Current User" // In a real app, this would be the logged-in user
    };

    setNotesHistory(prev => [newNote, ...prev]);
    setStaffNotes("");

    showToast.success("Success", "Staff note added successfully")
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      showToast.error("Invalid file type", "Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File too large", "Profile image must be less than 5MB")
      return
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setProfileImagePreview(previewUrl)

    // Start mock upload
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)

          // In a real app, you would send the file to the server here
          showToast.success("Profile image updated", "Your profile image has been updated successfully")

          setIsProfileImageUploadOpen(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const triggerProfileImageUpload = () => {
    fileInputRef.current?.click()
  }

  const toggleStaffStatus = () => {
    if (staff) {
      const newStatus = staff.status === 'active' ? 'inactive' : 'active'
      setStaff({
        ...staff,
        status: newStatus
      })

      showToast.success(`Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}`, `${staff.firstName} ${staff.lastName} has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold">Staff not found</h2>
        <Button
          variant="link"
          onClick={(e) => {
            e.preventDefault();
            navigate("/staff", { replace: true });
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Staff List
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LoadingState
        isLoading={isLoading}
        loadingText="Loading staff details..."
        center
      >
        {staff && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate("/staff", { replace: true });
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Staff Details</h1>
              </div>
              <div className="flex items-center gap-2">
                {/* Add Undo/Redo buttons */}
                <div className="flex items-center mr-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (canUndo) {
                        const action = undo()
                        if (action) {
                          showToast.info("Undo", "Last action has been undone")
                        }
                      }
                    }}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (canRedo) {
                        const action = redo()
                        if (action) {
                          showToast.info("Redo", "Action has been reapplied")
                        }
                      }
                    }}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Wrap the main content in ActionFeedback */}
                <ActionFeedback
                  status={operationStatus}
                  message={operationStatus === "success" ? "Changes saved successfully" : "Saving changes..."}
                  duration={3000}
                >
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Actions
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsProfileImageUploadOpen(true)}>
                          <Camera className="mr-2 h-4 w-4" />
                          Update Profile Image
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => document.querySelector('[value="documents"]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        )}>
                          <FileText className="mr-2 h-4 w-4" />
                          Manage Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => document.querySelector('[value="attendance"]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        )}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Full Attendance History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={toggleStaffStatus} className="text-amber-600">
                          <Switch className="mr-2" checked={staff.status === 'active'} />
                          {staff.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="flex items-center space-x-2 border rounded-md px-3">
                      <Label htmlFor="staff-status" className="text-sm">
                        {staff.status === 'active' ? 'Active' : 'Inactive'}
                      </Label>
                      <Switch
                        id="staff-status"
                        checked={staff.status === 'active'}
                        onCheckedChange={toggleStaffStatus}
                      />
                    </div>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </ActionFeedback>
              </div>
            </div>

            {/* Add InfoBox for guidance */}
            <InfoBox variant="info" className="mb-4">
              This page allows you to manage staff details, documents, attendance records, and notes. Use the tabs below to navigate between different sections.
            </InfoBox>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <Card className="overflow-hidden">
                  <div className="relative bg-muted h-32 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-muted/50"></div>
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                      <div className="relative w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-background">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt={`${staff.firstName} ${staff.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <User className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setIsProfileImageUploadOpen(true)}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="pt-12 text-center">
                    <CardTitle>{staff.firstName} {staff.lastName}</CardTitle>
                    <CardDescription>{staff.position}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{staff.department}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{staff.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Joined {new Date(staff.hireDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <div className="w-full flex justify-between items-center">
                      <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                        {staff.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setIsProfileImageUploadOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Main Content */}
              <div className="md:col-span-3">
                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="details">
                      <Info className="h-4 w-4 mr-2" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      <Building className="h-4 w-4 mr-2" />
                      Payroll
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      <FileText className="h-4 w-4 mr-2" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                      <Clock className="h-4 w-4 mr-2" />
                      Attendance
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                      <FileText className="h-4 w-4 mr-2" />
                      Notes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Info className="h-5 w-5 mr-2" />
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          View and manage staff personal details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium flex items-center mb-2">
                                <User className="h-4 w-4 mr-2" />
                                Personal Details
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Full Name</span>
                                  <span className="text-sm col-span-2">{staff.firstName} {staff.lastName}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Gender</span>
                                  <span className="text-sm col-span-2">{staff.gender}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Birth Date</span>
                                  <span className="text-sm col-span-2">{new Date(staff.birthDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium flex items-center mb-2">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Information
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Email</span>
                                  <span className="text-sm col-span-2">{staff.email}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Phone</span>
                                  <span className="text-sm col-span-2">{staff.phone}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-base font-semibold flex items-center justify-between">
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2" />
                                  Emergency Contact
                                </span>
                                {emergencyContact && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEmergencyContactModalOpen(true)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                {emergencyContact ? (
                                  <>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Name</span>
                                      <span className="text-sm col-span-2">{emergencyContact.name}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Relationship</span>
                                      <span className="text-sm col-span-2">{emergencyContact.relationship}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Phone</span>
                                      <span className="text-sm col-span-2">{emergencyContact.phone}</span>
                                    </div>
                                    {emergencyContact.email && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Email</span>
                                        <span className="text-sm col-span-2">{emergencyContact.email}</span>
                                      </div>
                                    )}
                                    {emergencyContact.address && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Address</span>
                                        <span className="text-sm col-span-2">{emergencyContact.address}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-4">
                                    <p className="text-sm text-muted-foreground mb-3">No emergency contact information available</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setIsEmergencyContactModalOpen(true)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Emergency Contact
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium flex items-center mb-2">
                                <Briefcase className="h-4 w-4 mr-2" />
                                Employment Details
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Position</span>
                                  <span className="text-sm col-span-2">{staff.position}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Department</span>
                                  <span className="text-sm col-span-2">{staff.department}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Hire Date</span>
                                  <span className="text-sm col-span-2">{new Date(staff.hireDate).toLocaleDateString()}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                  <span className="text-sm font-medium">Status</span>
                                  <span className="text-sm col-span-2">
                                    {staff.status === "active" ? (
                                      <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/10">
                                        {staff.status}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30 border-red-500/10">
                                        {staff.status}
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-base font-semibold flex items-center justify-between">
                                <span className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Identification
                                </span>
                                {identification && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsIdentificationModalOpen(true)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                )}
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                {identification ? (
                                  <>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">ID Type</span>
                                      <span className="text-sm col-span-2">{identification.type}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">ID Number</span>
                                      <span className="text-sm col-span-2">{identification.number}</span>
                                    </div>
                                    {identification.issuedBy && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Issued By</span>
                                        <span className="text-sm col-span-2">{identification.issuedBy}</span>
                                      </div>
                                    )}
                                    {identification.issueDate && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Issue Date</span>
                                        <span className="text-sm col-span-2">{new Date(identification.issueDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    {identification.expiryDate && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Expiry Date</span>
                                        <span className="text-sm col-span-2">{new Date(identification.expiryDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-4">
                                    <p className="text-sm text-muted-foreground mb-3">No identification details available</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setIsIdentificationModalOpen(true)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Identification
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium flex items-center mb-2">
                                <Building className="h-4 w-4 mr-2" />
                                Banking Details
                              </h3>
                              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                {staff.bankingDetails ? (
                                  <>
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-medium">Banking Information</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsBankingDetailsModalOpen(true)}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Bank Name</span>
                                      <span className="text-sm col-span-2">{staff.bankingDetails.bankName}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Account Type</span>
                                      <span className="text-sm col-span-2">{staff.bankingDetails.accountType}</span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Account No.</span>
                                      <span className="text-sm col-span-2">
                                        ****{staff.bankingDetails.accountNumber.slice(-4)}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3">
                                      <span className="text-sm font-medium">Branch Location</span>
                                      <span className="text-sm col-span-2">
                                        {staff.bankingDetails.branchLocation || "Not specified"}
                                      </span>
                                    </div>
                                    {staff.bankingDetails.branchCode && (
                                      <div className="grid grid-cols-3">
                                        <span className="text-sm font-medium">Branch Code</span>
                                        <span className="text-sm col-span-2">
                                          {staff.bankingDetails.branchCode}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-4">
                                    <p className="text-sm text-muted-foreground mb-3">No banking details available</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setIsBankingDetailsModalOpen(true)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Banking Details
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Building className="h-5 w-5 mr-2" />
                          Payroll Information
                        </CardTitle>
                        <CardDescription>
                          Manage staff payroll settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {staff.bankingDetails ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Bank Name</p>
                                <p>{staff.bankingDetails.bankName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                                <p>{staff.bankingDetails.accountType}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                                <p>{staff.bankingDetails.accountNumber}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Branch Location</p>
                                <p>{staff.bankingDetails.branchLocation || "Not specified"}</p>
                              </div>
                              {staff.bankingDetails.branchCode && (
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Branch Code</p>
                                  <p>{staff.bankingDetails.branchCode}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No banking details available</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Documents
                        </CardTitle>
                        <CardDescription>
                          Upload and manage staff documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium mb-2">Upload New Document</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              Supported formats: PDF, Word (docx/doc), Excel (xlsx/xls)
                            </p>

                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".pdf,.doc,.docx,.xls,.xlsx"
                              onChange={handleFileUpload}
                            />

                            {isUploading ? (
                              <div className="space-y-2">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-xs text-center text-muted-foreground">
                                  Uploading... {uploadProgress}%
                                </p>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Select Document
                              </Button>
                            )}
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-3">Document List</h3>

                            {documents.length > 0 ? (
                              <div className="space-y-2">
                                {documents.map(doc => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-3">
                                      {getDocumentIcon(doc.type)}
                                      <div>
                                        <p className="text-sm font-medium">{doc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {doc.size} • Uploaded on {doc.uploadDate}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDocument(doc)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          // Mock download functionality
                                          showToast.info("Download started", `Downloading ${doc.name}`)
                                        }}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          // Remove document
                                          setDocuments(prev =>
                                            prev.filter(d => d.id !== doc.id)
                                          )
                                          showToast.success("Document deleted", `${doc.name} has been removed`)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border rounded-md">
                                <File className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No documents have been uploaded yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="attendance" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Attendance Calendar
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
                              Previous
                            </Button>
                            <span className="font-medium">{getMonthName(selectedMonth)}</span>
                            <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
                              Next
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-sm font-medium py-1">{day}</div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {/* Add empty cells for days before the 1st of the month */}
                          {(() => {
                            const [year, month] = selectedMonth.split('-').map(Number)
                            const firstDayOfMonth = new Date(year, month - 1, 1).getDay() // 0 = Sunday, 1 = Monday, etc.
                            return Array.from({ length: firstDayOfMonth }, (_, i) => (
                              <div key={`empty-${i}`} className="h-16 border rounded-md"></div>
                            ))
                          })()}

                          {/* Calendar days */}
                          {calendarData.map((day) => {
                            const dayNum = parseInt(day.date.split('-')[2])
                            return (
                              <div
                                key={day.date}
                                className={`h-16 border rounded-md p-1 flex flex-col ${getStatusColor(day.status)}`}
                              >
                                <div className="text-xs font-medium self-end">{dayNum}</div>
                                {day.status !== 'weekend' && (
                                  <div className="flex-1 flex flex-col justify-center items-center">
                                    <div className="text-xs font-medium capitalize">{day.status}</div>
                                    {day.hours && <div className="text-xs">{day.hours} hrs</div>}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex justify-center mt-4 space-x-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-xs">Present</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span className="text-xs">Late</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-xs">Absent</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-xs">Leave</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Recent Attendance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AttendanceTable
                          records={attendanceRecords}
                          onViewNotes={(record) => {
                            setSelectedAttendanceRecord(record)
                            setIsAttendanceNotesModalOpen(true)
                          }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Staff Notes
                        </CardTitle>
                        <CardDescription>
                          Add notes about this staff member's performance, training, or other important information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="bg-muted/50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium mb-2">Add New Note</h3>
                            <Textarea
                              placeholder="Enter a new note about this staff member..."
                              className="min-h-[120px] mb-3"
                              value={staffNotes}
                              onChange={(e) => setStaffNotes(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSaveStaffNotes}
                                disabled={!staffNotes.trim()}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Add Note
                              </Button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium mb-3">Notes History</h3>
                            <div className="space-y-4">
                              {notesHistory.length > 0 ? (
                                notesHistory.map((noteItem, index) => (
                                  <div key={index} className="bg-card p-4 rounded-lg border">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-xs text-muted-foreground">
                                        {noteItem.date}
                                      </span>
                                      <span className="text-xs font-medium">
                                        {noteItem.author}
                                      </span>
                                    </div>
                                    <p className="text-sm">{noteItem.note}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                  <p>No notes have been added yet</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </LoadingState>

      {/* Edit Modal */}
      <StaffModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditStaff}
        initialData={staff}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member's record and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Attendance Notes Modal */}
      <AttendanceNotesModal
        isOpen={isAttendanceNotesModalOpen}
        onClose={() => setIsAttendanceNotesModalOpen(false)}
        record={selectedAttendanceRecord}
      />

      {/* Document Viewer Dialog */}
      <Dialog open={isDocumentViewerOpen} onOpenChange={setIsDocumentViewerOpen}>
        <DialogContent className="sm:max-w-[800px] h-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getDocumentIcon(selectedDocument.type)}
              {selectedDocument?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium capitalize">{selectedDocument.type}</span>
                  <span>•</span>
                  <span>Document ID: {selectedDocument.id}</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 h-[450px] overflow-hidden bg-muted/30 rounded-md border">
            {renderDocumentPreview()}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDocumentViewerOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              showToast.info("Download started", `Downloading ${selectedDocument?.name}`)
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Image Upload Dialog */}
      <Dialog open={isProfileImageUploadOpen} onOpenChange={setIsProfileImageUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Image</DialogTitle>
            <DialogDescription>
              Upload a new profile image. The image should be a square JPG, PNG, or WebP file.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {profileImagePreview && (
              <div className="relative w-40 h-40 mx-auto overflow-hidden rounded-full border">
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
              />
              <Button onClick={triggerProfileImageUpload} disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {profileImagePreview ? "Change Image" : "Upload Image"}
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setProfileImagePreview(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              disabled={!profileImagePreview || isUploading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsProfileImageUploadOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (profileImagePreview) {
                    showToast.success("Profile image updated", "Your profile image has been updated successfully")
                    setIsProfileImageUploadOpen(false)
                  } else {
                    triggerProfileImageUpload()
                  }
                }}
                disabled={isUploading}
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Modal */}
      <Dialog open={isEmergencyContactModalOpen} onOpenChange={setIsEmergencyContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency Contact</DialogTitle>
            <DialogDescription>
              Add or update emergency contact information for this staff member.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newEmergencyContact = {
              name: formData.get('emergencyName') as string,
              relationship: formData.get('emergencyRelationship') as string,
              phone: formData.get('emergencyPhone') as string,
              email: formData.get('emergencyEmail') as string || undefined,
              address: formData.get('emergencyAddress') as string || undefined,
            }

            setEmergencyContact(newEmergencyContact)

            showToast.success("Emergency contact updated", "Emergency contact information has been updated successfully")

            setIsEmergencyContactModalOpen(false)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Name *</Label>
                <Input
                  id="emergencyName"
                  name="emergencyName"
                  defaultValue={emergencyContact?.name || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">Relationship *</Label>
                <Input
                  id="emergencyRelationship"
                  name="emergencyRelationship"
                  defaultValue={emergencyContact?.relationship || ''}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone *</Label>
                <Input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  defaultValue={emergencyContact?.phone || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyEmail">Email</Label>
                <Input
                  id="emergencyEmail"
                  name="emergencyEmail"
                  type="email"
                  defaultValue={emergencyContact?.email || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyAddress">Address</Label>
              <Textarea
                id="emergencyAddress"
                name="emergencyAddress"
                defaultValue={emergencyContact?.address || ''}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEmergencyContactModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Identification Modal */}
      <Dialog open={isIdentificationModalOpen} onOpenChange={setIsIdentificationModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Identification Details</DialogTitle>
            <DialogDescription>
              Add or update identification information for this staff member.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newIdentification = {
              type: formData.get('idType') as string,
              number: formData.get('idNumber') as string,
              issuedBy: formData.get('idIssuedBy') as string || undefined,
              issueDate: formData.get('idIssueDate') as string || undefined,
              expiryDate: formData.get('idExpiryDate') as string || undefined,
            }

            setIdentification(newIdentification)

            showToast.success("Identification updated", "Identification information has been updated successfully")

            setIsIdentificationModalOpen(false)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idType">ID Type *</Label>
                <Select defaultValue={identification?.type || 'national'} name="idType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="driverLicense">Driver's License</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number *</Label>
                <Input
                  id="idNumber"
                  name="idNumber"
                  defaultValue={identification?.number || ''}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idIssuedBy">Issued By</Label>
              <Input
                id="idIssuedBy"
                name="idIssuedBy"
                defaultValue={identification?.issuedBy || ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idIssueDate">Issue Date</Label>
                <Input
                  id="idIssueDate"
                  name="idIssueDate"
                  type="date"
                  defaultValue={identification?.issueDate || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idExpiryDate">Expiry Date</Label>
                <Input
                  id="idExpiryDate"
                  name="idExpiryDate"
                  type="date"
                  defaultValue={identification?.expiryDate || ''}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsIdentificationModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Banking Details Modal */}
      <Dialog open={isBankingDetailsModalOpen} onOpenChange={setIsBankingDetailsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Banking Details</DialogTitle>
            <DialogDescription>
              {staff.bankingDetails
                ? "Update banking details for this staff member."
                : "Add banking details for this staff member."
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            const newBankingDetails = {
              accountName: formData.get('accountName') as string,
              accountNumber: formData.get('accountNumber') as string,
              bankName: formData.get('bankName') as string,
              accountType: formData.get('accountType') as string,
              branchLocation: formData.get('branchLocation') as string,
              branchCode: formData.get('branchCode') as string || undefined,
              swiftCode: formData.get('swiftCode') as string || undefined,
            }

            if (staff) {
              setStaff({
                ...staff,
                bankingDetails: newBankingDetails
              })
            }

            showToast.success("Banking details updated", "Banking information has been updated successfully")

            setIsBankingDetailsModalOpen(false)
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  defaultValue={staff?.bankingDetails?.bankName || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type *</Label>
                <Select defaultValue={staff?.bankingDetails?.accountType || 'checking'} name="accountType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name *</Label>
                <Input
                  id="accountName"
                  name="accountName"
                  defaultValue={staff?.bankingDetails?.accountName || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  defaultValue={staff?.bankingDetails?.accountNumber || ''}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchLocation">Branch Location</Label>
                <Input
                  id="branchLocation"
                  name="branchLocation"
                  defaultValue={staff?.bankingDetails?.branchLocation || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  name="branchCode"
                  defaultValue={staff?.bankingDetails?.branchCode || ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
              <Input
                id="swiftCode"
                name="swiftCode"
                defaultValue={staff?.bankingDetails?.swiftCode || ''}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBankingDetailsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{staff?.bankingDetails ? 'Update' : 'Add'} Banking Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
