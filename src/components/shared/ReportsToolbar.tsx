import { 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  Printer, 
  RefreshCw, 
  Save, 
  Share2 
} from "lucide-react"
import { Toolbar, ToolbarGroup } from "@/components/ui/toolbar"
import { DateRange } from "@/types/date"
import { DateRangePicker as BaseDateRangePicker } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"

export interface ReportsToolbarProps {
  onRefresh?: () => void
  onExport?: () => void
  onPrint?: () => void
  onFilter?: () => void
  onShare?: () => void
  onSave?: () => void
  onViewDetails?: () => void
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange) => void
  rightContent?: React.ReactNode
  children?: React.ReactNode
}

// Wrapper component to adapt the existing DateRangePicker to our toolbar
function DateRangePicker({ value, onChange }: { value: DateRange, onChange: (range: DateRange) => void }) {
  return (
    <BaseDateRangePicker
      date={value}
      onDateChange={(date) => date && onChange(date)}
    />
  );
}

export function ReportsToolbar({
  onRefresh,
  onExport,
  onPrint,
  onFilter,
  onShare,
  onSave,
  onViewDetails,
  dateRange,
  onDateRangeChange,
  rightContent,
  children
}: ReportsToolbarProps) {
  const toolbarGroups: ToolbarGroup[] = [
    {
      buttons: [
        ...(onRefresh ? [{
          icon: RefreshCw,
          label: "Refresh",
          onClick: onRefresh
        }] : []),
        ...(onFilter ? [{
          icon: Filter,
          label: "Filter",
          onClick: onFilter
        }] : [])
      ]
    },
    {
      buttons: [
        ...(onExport ? [{
          icon: Download,
          label: "Export",
          onClick: onExport
        }] : []),
        ...(onPrint ? [{
          icon: Printer,
          label: "Print",
          onClick: onPrint
        }] : [])
      ]
    },
    {
      buttons: [
        ...(onViewDetails ? [{
          icon: FileText,
          label: "Details",
          onClick: onViewDetails
        }] : []),
        ...(onShare ? [{
          icon: Share2,
          label: "Share",
          onClick: onShare
        }] : []),
        ...(onSave ? [{
          icon: Save,
          label: "Save",
          onClick: onSave
        }] : [])
      ]
    }
  ].filter(group => group.buttons.length > 0);

  return (
    <Toolbar 
      groups={toolbarGroups}
      rightContent={
        <>
          {dateRange && onDateRangeChange && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DateRangePicker
                value={dateRange}
                onChange={onDateRangeChange}
              />
            </div>
          )}
          {rightContent}
        </>
      }
    >
      {children}
    </Toolbar>
  )
}
