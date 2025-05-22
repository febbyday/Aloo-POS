import { ColumnDef } from "@tanstack/react-table"
import { EmploymentType } from "./types/employmentType.types"

export const columns: ColumnDef<EmploymentType>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => row.original.isActive ? "Active" : "Inactive"
  },
]