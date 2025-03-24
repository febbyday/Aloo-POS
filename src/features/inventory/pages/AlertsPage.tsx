import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { StockAlerts } from '../components/StockAlerts'
import { useState } from 'react'
import { InventoryToolbar } from '../components/InventoryToolbar'
import { AlertSettingsDialog } from '../components/AlertSettingsDialog'
import { 
  Bell,
  FileDown,
  FileText,
  Printer,
  RefreshCw,
  Package,
  PackageCheck,
  PackageMinus,
  Store,
  AlertTriangle,
  ChevronDown,
  Table as TableIcon,
  FileSpreadsheet
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useCompany } from '@/features/store/context/CompanyContext'
import { 
  printAlerts,
  exportToPdf,
  exportToExcel,
  exportToCsv,
  type AlertItem
} from '../utils/alertsExport'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - replace with actual API call
const alerts: AlertItem[] = [
  {
    id: "1",
    product: "Blue T-Shirt",
    sku: "BTS001",
    currentStock: 5,
    minStock: 20,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "2",
    product: "Black Jeans",
    sku: "BJ002",
    currentStock: 8,
    minStock: 15,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "3",
    product: "Red Sneakers",
    sku: "RS003",
    currentStock: 3,
    minStock: 25,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "4",
    product: "White Socks",
    sku: "WS004",
    currentStock: 12,
    minStock: 30,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "5",
    product: "Leather Wallet",
    sku: "LW005",
    currentStock: 4,
    minStock: 10,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "6",
    product: "Baseball Cap",
    sku: "BC006",
    currentStock: 7,
    minStock: 20,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "7",
    product: "Running Shorts",
    sku: "RS007",
    currentStock: 2,
    minStock: 15,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "8",
    product: "Sports Bra",
    sku: "SB008",
    currentStock: 6,
    minStock: 25,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "9",
    product: "Yoga Mat",
    sku: "YM009",
    currentStock: 1,
    minStock: 10,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "10",
    product: "Water Bottle",
    sku: "WB010",
    currentStock: 9,
    minStock: 30,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "11",
    product: "Gym Bag",
    sku: "GB011",
    currentStock: 4,
    minStock: 12,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "12",
    product: "Sweatband",
    sku: "SB012",
    currentStock: 8,
    minStock: 20,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "13",
    product: "Tennis Racket",
    sku: "TR013",
    currentStock: 2,
    minStock: 8,
    location: "Downtown Store",
    severity: "High"
  },
  {
    id: "14",
    product: "Golf Balls",
    sku: "GB014",
    currentStock: 15,
    minStock: 50,
    location: "Mall Store",
    severity: "Warning"
  },
  {
    id: "15",
    product: "Swimming Goggles",
    sku: "SG015",
    currentStock: 3,
    minStock: 15,
    location: "Downtown Store",
    severity: "High"
  }
]

const columns = [
  {
    accessorKey: "sku",
    header: () => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <span>SKU</span>
      </div>
    )
  },
  {
    accessorKey: "product",
    header: () => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <span>Product</span>
      </div>
    )
  },
  {
    accessorKey: "currentStock",
    header: () => (
      <div className="flex items-center gap-2">
        <PackageCheck className="h-4 w-4" />
        <span>Current Stock</span>
      </div>
    )
  },
  {
    accessorKey: "minStock",
    header: () => (
      <div className="flex items-center gap-2">
        <PackageMinus className="h-4 w-4" />
        <span>Min Stock</span>
      </div>
    )
  },
  {
    accessorKey: "location",
    header: () => (
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4" />
        <span>Location</span>
      </div>
    )
  },
  {
    accessorKey: "severity",
    header: () => (
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span>Severity</span>
      </div>
    ),
    cell: ({ row }) => {
      const severity = row.original.severity
      return (
        <Badge variant={severity === "High" ? "destructive" : "warning"}>
          {severity}
        </Badge>
      )
    }
  }
]

export function AlertsPage() {
  const { toast } = useToast()
  const { companyInfo, currentUser } = useCompany()
  const [alertSettingsOpen, setAlertSettingsOpen] = useState(false)
  const [alertData, setAlertData] = useState<AlertItem[]>(alerts)

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            toast({
              title: "Refreshing alerts...",
              description: "Your alerts are being updated."
            })
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Bell,
          label: "Configure Alerts",
          onClick: () => {
            setAlertSettingsOpen(true)
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Printer,
          label: "Print",
          onClick: () => {
            printAlerts(alertData, {
              companyInfo,
              user: currentUser
            })
          }
        },
        {
          icon: FileText,
          label: "PDF",
          onClick: () => {
            const options = { companyInfo, user: currentUser }
            exportToPdf(alertData, options)
            toast({
              title: "PDF generated",
              description: "Your PDF has been downloaded"
            })
          }
        },
        {
          icon: TableIcon,
          label: "CSV",
          onClick: () => {
            const options = { companyInfo, user: currentUser }
            exportToCsv(alertData, options)
            toast({
              title: "Export complete",
              description: "Your CSV file has been downloaded"
            })
          }
        },
        {
          icon: FileSpreadsheet,
          label: "Excel",
          onClick: () => {
            const options = { companyInfo, user: currentUser }
            exportToExcel(alertData, options)
            toast({
              title: "Export complete",
              description: "Your Excel file has been downloaded"
            })
          }
        }
      ]
    }
  ]

  return (
    <div className="space-y-4">
      <InventoryToolbar 
        groups={toolbarGroups} 
        rightContent={<StockAlerts />}
      />
      
      <div className="w-full">
        <DataTable 
          columns={columns} 
          data={alertData}
          className="w-full [&_table]:border-0 [&_table]:rounded-none [&_thead]:bg-zinc-900/90 [&_tr]:border-0 [&_tr]:border-b [&_tr]:border-zinc-800 [&_td]:px-2 [&_td]:text-zinc-100 [&_th]:px-2 [&_th]:text-zinc-100 [&_tr]:h-[50px] hover:bg-white/5"
        />
      </div>
      <AlertSettingsDialog 
        open={alertSettingsOpen}
        onOpenChange={setAlertSettingsOpen}
      />
    </div>
  )
}
