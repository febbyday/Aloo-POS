import {
  RefreshCw,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Bell,
  FileDown,
  Settings
} from "lucide-react"
import { ProductsToolbar } from "../ProductsToolbar"
import { useToast } from "@/lib/toast"
import { motion } from "framer-motion"

interface LowStockToolbarProps {
  onExport: () => void
  onColumnsChange: () => void
  onAlertSettings: () => void
}

export function LowStockToolbar({
  onExport,
  onColumnsChange,
  onAlertSettings
}: LowStockToolbarProps) {
  const toast = useToast()

  const toolbarGroups = [
    {
      buttons: [
        {
          icon: RefreshCw,
          label: "Refresh",
          onClick: () => {
            toast.info("Refreshing data...", "Your low stock alerts are being updated.")
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: Bell,
          label: "Notifications",
          onClick: () => {
            toast.info("Notification settings", "Configure low stock notifications.")
          }
        },
        {
          icon: Filter,
          label: "Filter",
          onClick: () => {
            toast.info("Filter options", "Filter alerts by various criteria.")
          }
        }
      ]
    },
    {
      buttons: [
        {
          icon: ArrowUpDown,
          label: "Sort",
          onClick: () => {
            toast.info("Sort options", "Sort alerts by urgency or quantity.")
          }
        },
        {
          icon: SlidersHorizontal,
          label: "Columns",
          onClick: onColumnsChange
        }
      ]
    },
    {
      buttons: [
        {
          icon: Settings,
          label: "Alert Settings",
          onClick: onAlertSettings
        },
        {
          icon: FileDown,
          label: "Export",
          onClick: onExport
        }
      ]
    }
  ]

  return (
    <ProductsToolbar
      groups={toolbarGroups}
      rightContent={null}
    />
  )
}
