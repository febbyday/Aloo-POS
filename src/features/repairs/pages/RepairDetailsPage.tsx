import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Wrench,
  Clock,
  Package,
  DollarSign,
  FileText,
  User,
  Phone,
  Mail,
  Box,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Upload,
  ArrowLeft,
  Edit,
  Trash2,
  Palette
} from "lucide-react"
import { format } from 'date-fns'
import { useDropzone } from 'react-dropzone'
import { Repair, RepairStatus, RepairPriority, RepairIssueType, LeatherProductType } from '../types'
import { mockRepairs } from './RepairsPage' // In a real app, this would come from an API
import { useToast } from "@/components/ui/use-toast"

export function RepairDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [beforeRepairImages, setBeforeRepairImages] = useState<string[]>([])
  const [afterRepairImages, setAfterRepairImages] = useState<string[]>([])
  const [workLogEntry, setWorkLogEntry] = useState("")
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const { toast } = useToast()
  
  // In a real app, this would be fetched from an API
  const repair = mockRepairs.find(r => r.id === id)
  
  if (!repair) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">Repair Not Found</h2>
        <p className="text-muted-foreground mb-8">The repair ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/repairs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Repairs
        </Button>
      </div>
    )
  }
  
  const priorityColors: Record<string, string> = {
    "LOW": "bg-gray-100 text-gray-800",
    "MEDIUM": "bg-blue-100 text-blue-800",
    "HIGH": "bg-orange-100 text-orange-800",
  }
  
  const statusColors: Record<RepairStatus, string> = {
    [RepairStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [RepairStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
    [RepairStatus.WAITING_PARTS]: "bg-purple-100 text-purple-800",
    [RepairStatus.COMPLETED]: "bg-green-100 text-green-800",
    [RepairStatus.CANCELLED]: "bg-red-100 text-red-800",
  }
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create preview URLs for the accepted files
    const imageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
    setAfterRepairImages(prev => [...prev, ...imageUrls]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5242880 // 5MB
  });

  const removeBeforeImage = (index: number) => {
    setBeforeRepairImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAfterImage = (index: number) => {
    setAfterRepairImages(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps: getBeforeRootProps, getInputProps: getBeforeInputProps, isDragActive: isBeforeDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      // Create preview URLs for the accepted files
      const imageUrls = acceptedFiles.map(file => URL.createObjectURL(file));
      setBeforeRepairImages(prev => [...prev, ...imageUrls]);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5242880 // 5MB
  });

  const handleAddWorkLog = () => {
    if (!workLogEntry.trim()) return;
    
    // In a real app, this would send the work log entry to an API
    console.log("Adding work log entry:", workLogEntry);
    
    // Clear the input
    setWorkLogEntry("");
  };

  const handleProcessPayment = () => {
    // In a real app, this would open a payment modal or redirect to a payment page
    // For now, we'll just show a toast notification
    const amount = parseFloat(paymentAmount) || (repair.estimatedCost - repair.depositAmount);
    
    toast({
      title: "Payment Processing",
      description: `Processing payment of $${amount.toFixed(2)}`,
    })
    
    // Reset payment amount
    setPaymentAmount("");
  }

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    
    // In a real app, this would update the repair record with the new payment
    toast({
      title: "Payment Added",
      description: `Added payment of $${amount.toFixed(2)}`,
    });
    
    // Reset payment amount
    setPaymentAmount("");
  }

  const handlePrintInvoice = () => {
    // In a real app, this would generate a PDF invoice and open the print dialog
    // For now, we'll just show a toast notification
    toast({
      title: "Printing Invoice",
      description: `Generating invoice for repair #${repair.ticketNumber}`,
    })
    
    // Simulate printing delay
    setTimeout(() => {
      toast({
        title: "Invoice Ready",
        description: "Invoice has been sent to the printer",
      })
    }, 1500)
  }

  return (
    <div className="h-full flex-1 flex-col flex space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/repairs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Repair #{repair.ticketNumber}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={priorityColors[repair.priority]}>
            {repair.priority} Priority
          </Badge>
          <Badge className={statusColors[repair.status]}>
            {repair.status}
          </Badge>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Created on {format(repair.createdAt, 'PPP')} at {format(repair.createdAt, 'p')}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="work-log">Work Log</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{repair.customerName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span className="ml-2">{repair.customerPhone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{repair.customerEmail}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Box className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Product:</span>
                  <span className="ml-2">{repair.productName}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Brand/Model:</span>
                  <span className="ml-2">{repair.productBrand} {repair.productModel}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Product Type:</span>
                  <span className="ml-2">{repair.productType || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Serial Number:</span>
                  <span className="ml-2">{repair.productSerial || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Color:</span>
                  <span className="ml-2">{repair.productColor || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Repair Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Issue Type</h3>
                  <Badge variant="outline" className="text-sm">
                    {repair.issueType || 'General Repair'}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Priority</h3>
                  <Badge className={priorityColors[repair.priority]}>
                    {repair.priority}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <Badge className={statusColors[repair.status]}>
                    {repair.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Issue Description</h3>
                <p className="text-muted-foreground">{repair.issueDescription}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h3 className="font-medium mb-2">Estimated Completion</h3>
                  <p>{format(repair.estimatedCompletionDate, 'PPP')}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Estimated Cost</h3>
                  <p>${repair.estimatedCost.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Deposit Amount</h3>
                  <p>${repair.depositAmount.toFixed(2)}</p>
                </div>
              </div>

              <Separator className="my-4" />
              
              <div>
                <h3 className="font-medium mb-4">Payment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span className="font-medium">${repair.estimatedCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Deposit Paid:</span>
                      <span className="font-medium text-green-600">-${repair.depositAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Remaining Balance:</span>
                      <span className="font-bold">${(repair.estimatedCost - repair.depositAmount).toFixed(2)}</span>
                    </div>
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/repairs/${repair.id}/payments`)}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        View Payment History
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge variant={repair.depositAmount >= repair.estimatedCost ? "success" : "outline"}>
                        {repair.depositAmount >= repair.estimatedCost ? "Paid in Full" : "Partially Paid"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Date:</span>
                      <span>{repair.paymentDate ? format(repair.paymentDate, 'PPP') : 'Not yet paid'}</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="Enter payment amount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="h-8"
                          min="0.01"
                          step="0.01"
                        />
                        <Button 
                          size="sm"
                          onClick={handleAddPayment}
                          disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <Button 
                        className="w-full" 
                        disabled={repair.depositAmount >= repair.estimatedCost}
                        onClick={handleProcessPayment}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        {repair.depositAmount > 0 ? 'Process Remaining Payment' : 'Process Payment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Before Repair Images</CardTitle>
              <CardDescription>Images of the item before repair work began</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                {...getBeforeRootProps()} 
                className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
                  isBeforeDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <input {...getBeforeInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      Drag & drop images here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to select files (max 5MB each)
                    </p>
                  </div>
                </div>
              </div>

              {beforeRepairImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {beforeRepairImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img 
                        src={img} 
                        alt={`Before repair ${index + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeBeforeImage(index)}
                          className="bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>After Repair Images</CardTitle>
              <CardDescription>Upload images of the completed repair work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-md p-6 cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Drop the images here' : 'Drag & drop images here'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to select files (max 5MB each)
                    </p>
                  </div>
                </div>
              </div>

              {afterRepairImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {afterRepairImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img 
                        src={img} 
                        alt={`After repair ${index + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeAfterImage(index)}
                          className="bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button disabled={afterRepairImages.length === 0}>
                Save Images
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="work-log" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Work Log</CardTitle>
              <CardDescription>Record of all work performed on this repair</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Textarea 
                  placeholder="Enter details about the work performed..." 
                  value={workLogEntry}
                  onChange={(e) => setWorkLogEntry(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddWorkLog} disabled={!workLogEntry.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                {repair.workLog && repair.workLog.length > 0 ? (
                  repair.workLog.map((entry, index) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.technician}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(entry.timestamp, 'PPP p')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="mt-2">{entry.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No work log entries yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoice" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice</CardTitle>
              <CardDescription>Financial details for this repair</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Diagnostic Fee</TableCell>
                    <TableCell>Initial assessment and testing</TableCell>
                    <TableCell className="text-right">$45.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Labor</TableCell>
                    <TableCell>2 hours @ $65/hr</TableCell>
                    <TableCell className="text-right">$130.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Parts</TableCell>
                    <TableCell>Replacement components</TableCell>
                    <TableCell className="text-right">$75.00</TableCell>
                  </TableRow>
                  <TableRow className="font-medium">
                    <TableCell colSpan={2} className="text-right">Subtotal</TableCell>
                    <TableCell className="text-right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} className="text-right">Tax (8%)</TableCell>
                    <TableCell className="text-right">$20.00</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell colSpan={2} className="text-right">Total</TableCell>
                    <TableCell className="text-right">$270.00</TableCell>
                  </TableRow>
                  <TableRow className="text-muted-foreground">
                    <TableCell colSpan={2} className="text-right">Deposit Paid</TableCell>
                    <TableCell className="text-right">-$50.00</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell colSpan={2} className="text-right">Balance Due</TableCell>
                    <TableCell className="text-right">$220.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrintInvoice}>
                <FileText className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button onClick={handleProcessPayment}>
                <DollarSign className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
