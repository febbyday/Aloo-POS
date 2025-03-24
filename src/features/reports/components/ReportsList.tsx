import { CustomReportConfig } from "../types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Download,
  Share2,
  Clock,
  Copy
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface ReportsListProps {
  reports: CustomReportConfig[]
  onView: (report: CustomReportConfig) => void
  onEdit: (report: CustomReportConfig) => void
  onDelete: (reportId: string) => void
}

export function ReportsList({ reports, onView, onEdit, onDelete }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No reports found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          You haven't created any custom reports yet. Click "Create New Report" to get started.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell className="font-medium">{report.name}</TableCell>
            <TableCell className="max-w-xs truncate">{report.description}</TableCell>
            <TableCell>{format(new Date(report.createdAt), 'MMM d, yyyy')}</TableCell>
            <TableCell>{format(new Date(report.updatedAt), 'MMM d, yyyy')}</TableCell>
            <TableCell>
              <Badge variant={report.chartType === 'table' ? 'outline' : 'default'}>
                {report.chartType === 'bar' && 'Bar Chart'}
                {report.chartType === 'line' && 'Line Chart'}
                {report.chartType === 'pie' && 'Pie Chart'}
                {report.chartType === 'table' && 'Table'}
              </Badge>
              {report.schedule && (
                <Badge variant="outline" className="ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onView(report)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(report)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(report.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
