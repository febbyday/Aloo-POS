import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Plus
} from "lucide-react"
import { format } from 'date-fns'
import { Repair, RepairStatus, RepairPriority } from '../types'
import { RepairInvoice } from './RepairInvoice'

interface RepairDetailsViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repair: Repair | null
  onAddWorkLog: () => void
  onAddItem: () => void
}

const priorityColors = {
  [RepairPriority.LOW]: "bg-gray-100 text-gray-800",
  [RepairPriority.MEDIUM]: "bg-blue-100 text-blue-800",
  [RepairPriority.HIGH]: "bg-orange-100 text-orange-800",
  [RepairPriority.URGENT]: "bg-red-100 text-red-800",
}

const statusColors = {
  [RepairStatus.PENDING]: "bg-gray-100 text-gray-800",
  [RepairStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [RepairStatus.WAITING_PARTS]: "bg-purple-100 text-purple-800",
  [RepairStatus.READY_FOR_TESTING]: "bg-yellow-100 text-yellow-800",
  [RepairStatus.COMPLETED]: "bg-green-100 text-green-800",
  [RepairStatus.DELIVERED]: "bg-teal-100 text-teal-800",
  [RepairStatus.CANCELLED]: "bg-red-100 text-red-800",
}

export function RepairDetailsView({
  open,
  onOpenChange,
  repair,
  onAddWorkLog,
  onAddItem
}: RepairDetailsViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [invoiceOpen, setInvoiceOpen] = useState(false)

  if (!repair) {
    return null
  }

  const companyInfo = {
    name: "Leather Repair Shop",
    address: "123 Main St, City, Country",
    phone: "+1 234 567 890",
    email: "info@leatherrepair.com",
    website: "www.leatherrepair.com",
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  Ticket #{repair.ticketNumber}
                </DialogTitle>
                <DialogDescription>
                  Created on {format(repair.createdAt, 'PPP')}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={priorityColors[repair.priority]}>
                  {repair.priority}
                </Badge>
                <Badge className={statusColors[repair.status]}>
                  {repair.status}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="work-log">Work Log</TabsTrigger>
              <TabsTrigger value="parts">Parts</TabsTrigger>
              <TabsTrigger value="invoice">Invoice</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{repair.customerName}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{repair.customerPhone}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{repair.customerEmail}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Item Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Box className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{repair.productName}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{repair.productBrand} {repair.productModel}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Due: {format(repair.dueDate, 'PPP')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {repair.issueDescription}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work-log" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Work Log</h3>
                <Button onClick={onAddWorkLog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </div>
              {repair.workLogs.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No work log entries yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {repair.workLogs.map((entry, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          {entry.title}
                        </CardTitle>
                        <CardDescription>
                          {format(entry.timestamp, 'PPP')} - {entry.technician}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {entry.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="parts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Parts Used</h3>
                <Button onClick={onAddItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </div>
              {repair.items.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">No parts added yet</p>
                  </CardContent>
                </Card>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Part Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repair.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="invoice" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Invoice</h3>
                <Button onClick={() => setInvoiceOpen(true)}>
                  View Full Invoice
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parts:</span>
                        <span>
                          ${repair.items.reduce((sum, item) => 
                            sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labor:</span>
                        <span>${repair.actualCost.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>
                          ${(repair.items.reduce((sum, item) => 
                            sum + (item.quantity * item.unitPrice), 0) + 
                            repair.actualCost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Payment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {repair.isPaid ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            <span className="text-green-500">Paid</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-red-500">Unpaid</span>
                          </>
                        )}
                      </div>
                      {repair.paymentDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Paid on {format(repair.paymentDate, 'PPP')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <RepairInvoice
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        repair={repair}
        companyInfo={companyInfo}
      />
    </>
  )
}
