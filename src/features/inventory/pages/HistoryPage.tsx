import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Barcode, 
  Package2, 
  ArrowRightLeft, 
  Hash, 
  Building2, 
  Store, 
  User2
} from "lucide-react"

// Mock data - replace with actual API call
const history = [
  {
    id: "1",
    date: "2025-02-17",
    product: "Blue T-Shirt",
    sku: "BTS001",
    type: "Transfer",
    quantity: 10,
    from: "Main Warehouse",
    to: "Downtown Store",
    user: "John Doe"
  },
  // Add more mock history entries as needed
]

const columns = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Calendar className="h-4 w-4" />
          <span>Date</span>
        </div>
      )
    }
  },
  {
    accessorKey: "sku",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Barcode className="h-4 w-4" />
          <span>SKU</span>
        </div>
      )
    }
  },
  {
    accessorKey: "product",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Package2 className="h-4 w-4" />
          <span>Product</span>
        </div>
      )
    }
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <ArrowRightLeft className="h-4 w-4" />
          <span>Type</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <Badge variant={
          type === "Transfer" ? "default" :
          type === "Adjustment" ? "warning" :
          "secondary"
        }>
          {type}
        </Badge>
      )
    }
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Hash className="h-4 w-4" />
          <span>Quantity</span>
        </div>
      )
    }
  },
  {
    accessorKey: "from",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Building2 className="h-4 w-4" />
          <span>From</span>
        </div>
      )
    }
  },
  {
    accessorKey: "to",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <Store className="h-4 w-4" />
          <span>To</span>
        </div>
      )
    }
  },
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-2 text-zinc-100">
          <User2 className="h-4 w-4" />
          <span>User</span>
        </div>
      )
    }
  }
]

export function HistoryPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock History</h1>
      </div>
      <DataTable columns={columns} data={history} />
    </div>
  )
}
