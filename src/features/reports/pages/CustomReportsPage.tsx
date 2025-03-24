import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Settings,
  RefreshCw,
  PlusCircle,
  Search,
  FileText,
  Edit,
  Trash2,
  Share2,
  Clock
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomReportConfig } from "../types"
import { CreateReportDialog } from "../components/CreateReportDialog"
import { ReportsList } from "../components/ReportsList"
import { ReportBuilder } from "../components/ReportBuilder"
import { ReportPreview } from "../components/ReportPreview"
import { useToast } from "@/components/ui/use-toast"

// Mock data for custom reports
const mockReports: CustomReportConfig[] = [
  {
    id: "1",
    name: "Monthly Sales by Category",
    description: "Tracks sales performance across product categories on a monthly basis",
    createdBy: "Admin",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-02-10"),
    fields: [
      { id: "1", name: "Category", source: "products.category", dataType: "string", visible: true },
      { id: "2", name: "Month", source: "sales.date", dataType: "date", format: "MMMM yyyy", visible: true },
      { id: "3", name: "Total Sales", source: "sales.amount", dataType: "number", aggregation: "sum", format: "currency", visible: true },
      { id: "4", name: "Units Sold", source: "sales.quantity", dataType: "number", aggregation: "sum", visible: true }
    ],
    filters: [
      { id: "1", field: "sales.date", operator: "between", value: { from: new Date("2023-01-01"), to: new Date("2023-12-31") } }
    ],
    sortBy: "Total Sales",
    sortDirection: "desc",
    groupBy: "Category",
    chartType: "bar"
  },
  {
    id: "2",
    name: "Top Performing Staff",
    description: "Identifies top-performing staff members based on sales and customer satisfaction",
    createdBy: "Manager",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-03-05"),
    fields: [
      { id: "1", name: "Staff Name", source: "staff.name", dataType: "string", visible: true },
      { id: "2", name: "Department", source: "staff.department", dataType: "string", visible: true },
      { id: "3", name: "Sales Amount", source: "sales.amount", dataType: "number", aggregation: "sum", format: "currency", visible: true },
      { id: "4", name: "Transaction Count", source: "sales.id", dataType: "number", aggregation: "count", visible: true },
      { id: "5", name: "Average Rating", source: "feedback.rating", dataType: "number", aggregation: "avg", visible: true }
    ],
    filters: [
      { id: "1", field: "sales.date", operator: "between", value: { from: new Date("2023-01-01"), to: new Date("2023-12-31") } }
    ],
    sortBy: "Sales Amount",
    sortDirection: "desc",
    chartType: "table"
  },
  {
    id: "3",
    name: "Inventory Turnover Analysis",
    description: "Analyzes inventory turnover rates to identify fast and slow-moving products",
    createdBy: "Inventory Manager",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-04-15"),
    fields: [
      { id: "1", name: "Product", source: "products.name", dataType: "string", visible: true },
      { id: "2", name: "Category", source: "products.category", dataType: "string", visible: true },
      { id: "3", name: "Initial Stock", source: "inventory.initialQuantity", dataType: "number", visible: true },
      { id: "4", name: "Units Sold", source: "sales.quantity", dataType: "number", aggregation: "sum", visible: true },
      { id: "5", name: "Current Stock", source: "inventory.currentQuantity", dataType: "number", visible: true },
      { id: "6", name: "Turnover Rate", source: "calculated.turnoverRate", dataType: "number", format: "percentage", visible: true }
    ],
    filters: [],
    sortBy: "Turnover Rate",
    sortDirection: "desc",
    chartType: "table",
    schedule: {
      frequency: "monthly",
      recipients: ["inventory@example.com", "purchasing@example.com"],
      lastRun: new Date("2023-04-01"),
      nextRun: new Date("2023-05-01")
    }
  }
];

export function CustomReportsPage() {
  const [activeTab, setActiveTab] = useState("my-reports")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<CustomReportConfig | null>(null)
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [isEditingReport, setIsEditingReport] = useState(false)
  const { toast } = useToast()

  const filteredReports = mockReports.filter(report => 
    report.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateReport = () => {
    setIsCreatingReport(true)
  }

  const handleEditReport = (report: CustomReportConfig) => {
    setSelectedReport(report)
    setIsEditingReport(true)
  }

  const handleViewReport = (report: CustomReportConfig) => {
    setSelectedReport(report)
    setActiveTab("preview")
  }

  const handleDeleteReport = (reportId: string) => {
    // In a real app, you would delete the report from your backend
    toast({
      title: "Report deleted",
      description: "The report has been successfully deleted.",
    })
  }

  const handleSaveReport = (report: CustomReportConfig) => {
    // In a real app, you would save the report to your backend
    setIsCreatingReport(false)
    setIsEditingReport(false)
    toast({
      title: "Report saved",
      description: "Your report has been successfully saved.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Create, manage, and schedule custom reports for your business
          </p>
        </div>
        <Button onClick={handleCreateReport}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="shared">Shared Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="builder" disabled={!selectedReport && !isEditingReport}>
            Report Builder
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!selectedReport}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="space-y-4">
          <Card className="p-0 border-0">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>My Custom Reports</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <ReportsList
                reports={filteredReports}
                onView={handleViewReport}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <Card className="p-0 border-0">
            <CardHeader>
              <CardTitle>Shared Reports</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No shared reports</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Reports shared with you by other users will appear here. You can view and export shared reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card className="p-0 border-0">
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="space-y-4">
                {mockReports
                  .filter(report => report.schedule)
                  .map(report => (
                    <div key={report.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-start space-x-4">
                        <FileText className="h-10 w-10 text-primary/70" />
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {report.schedule?.frequency.charAt(0).toUpperCase() + 
                               report.schedule?.frequency.slice(1)} • Next run: {
                                report.schedule?.nextRun ? 
                                new Date(report.schedule.nextRun).toLocaleDateString() : 
                                'Not scheduled'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Schedule
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Run Now
                        </Button>
                      </div>
                    </div>
                  ))}
                {mockReports.filter(report => report.schedule).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No scheduled reports</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Schedule reports to be automatically generated and sent to specific recipients on a recurring basis.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          {(selectedReport || isEditingReport) && (
            <ReportBuilder 
              report={selectedReport} 
              onSave={handleSaveReport} 
              onCancel={() => {
                setSelectedReport(null)
                setIsEditingReport(false)
                setActiveTab("my-reports")
              }} 
            />
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {selectedReport && (
            <ReportPreview 
              report={selectedReport} 
              onEdit={() => {
                setIsEditingReport(true)
                setActiveTab("builder")
              }}
              onExport={() => {
                toast({
                  title: "Report exported",
                  description: "The report has been exported to PDF.",
                })
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateReportDialog 
        open={isCreatingReport} 
        onOpenChange={setIsCreatingReport}
        onSave={(reportData) => {
          // In a real app, you would save the new report to your backend
          const newReport: CustomReportConfig = {
            ...reportData,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "Admin", // This would come from the user context
            fields: [],
            filters: []
          }
          setSelectedReport(newReport)
          setIsCreatingReport(false)
          setActiveTab("builder")
          toast({
            title: "Report created",
            description: "Your new report has been created. Now you can customize it.",
          })
        }}
      />
    </div>
  )
}
