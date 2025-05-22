import React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  Row,
} from "@tanstack/react-table"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronDown,
  ChevronUp,
  ChevronsUpDown
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from '@/lib/utils/cn';

export type DataTableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue>
export type DataTableRow<TData> = Row<TData>

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowSelectionChange?: (selectedRows: any[]) => void
  enableRowSelection?: boolean
  className?: string
  onRowClick?: (id: string) => void
  onRowDoubleClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowSelectionChange,
  enableRowSelection = false,
  className,
  onRowClick,
  onRowDoubleClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    state: {
      sorting,
      rowSelection,
      pagination: {
        pageSize: itemsPerPage,
        pageIndex: 0,
      },
    },
  })

  // Notify parent of row selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, onRowSelectionChange])

  const handleRowClick = (e: React.MouseEvent, row: Row<TData>) => {
    const id = (row.original as any).id
    if (id && onRowClick) {
      onRowClick(id)
    }
  }

  const handleRowDoubleClick = (e: React.MouseEvent, row: Row<TData>) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row.original)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id}
                      className="text-zinc-100 h-[50px] cursor-pointer hover:bg-zinc-800/50"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <div className="w-4">
                            {header.column.getIsSorted() ? (
                              header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 opacity-30" />
                            )}
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => handleRowClick(e, row)}
                  onDoubleClick={(e) => handleRowDoubleClick(e, row)}
                  className={cn(
                    "cursor-pointer",
                    index === table.getRowModel().rows.length - 1 && "border-b border-border"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Show</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-zinc-500">entries</span>
          </div>
          <div className="text-sm text-zinc-500">
            Showing {table.getState().pagination.pageIndex * itemsPerPage + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * itemsPerPage,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          {Array.from(
            { length: table.getPageCount() },
            (_, index) => index + 1
          ).map((page) => (
            <Button
              key={page}
              variant={
                table.getState().pagination.pageIndex === page - 1
                  ? "default"
                  : "outline"
              }
              className="h-8 px-3 py-1.5 hidden md:inline-flex"
              onClick={() => table.setPageIndex(page - 1)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-8 px-3 py-1.5"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
