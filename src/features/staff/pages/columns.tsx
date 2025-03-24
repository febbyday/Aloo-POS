/**
 * 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
 */

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { EmploymentType } from "../types/employmentType"

interface ColumnActions {
  onEdit?: (type: EmploymentType) => void;
  onDelete?: (type: EmploymentType) => void;
}

/**
 * Creates columns definition with optional edit/delete handlers
 */
export const columns = (actions?: ColumnActions): ColumnDef<EmploymentType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const type = row.original
      
      return (
        <div className="flex items-center gap-2">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: type.color }}
            role="presentation"
          />
          <span className="font-medium">{type.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-[300px] truncate">{description}</div>
      )
    },
  },
  {
    accessorKey: "benefits",
    header: "Benefits",
    cell: ({ row }) => {
      const benefits = row.original.benefits || []
      return (
        <div className="flex flex-wrap gap-1">
          {benefits.slice(0, 3).map((benefit) => (
            <Badge key={benefit} variant="secondary">
              {benefit}
            </Badge>
          ))}
          {benefits.length > 3 && (
            <Badge variant="outline">+{benefits.length - 3}</Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "staffCount",
    header: "Staff Count",
    cell: ({ row }) => {
      const count = row.getValue("staffCount") as number || 0
      return (
        <Badge variant="outline" className="font-mono">
          {count}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const type = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(type.id!.toString())}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => actions?.onEdit && actions.onEdit(type)}
              disabled={!actions?.onEdit}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => actions?.onDelete && actions.onDelete(type)}
              disabled={!actions?.onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
