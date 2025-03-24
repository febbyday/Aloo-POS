import { cn } from "@/lib/utils"

// Shared table styling constants
export const tableStyles = {
  container: "space-y-4",
  tableWrapper: "", 
  table: "w-full caption-bottom text-sm",
  header: "bg-muted/50",
  headerRow: "hover:bg-transparent border-b border-border",
  headerCell: "h-12 px-4 align-middle cursor-pointer hover:bg-muted/50 [&:has([role=checkbox])]:pr-0 w-[40px]",
  headerCellContent: "flex items-center gap-2",
  headerIcon: "h-4 w-4",
  sortIcon: "h-4 w-4",
  sortIconContainer: "w-4",
  inactiveSortIcon: "h-4 w-4 opacity-30",
  body: "",
  row: "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
  selectedRow: "bg-muted",
  cell: "h-12 px-4 align-middle [&:has([role=checkbox])]:pr-0 w-[40px]",
  cellWithIcon: "flex items-center gap-2",
  icon: "h-4 w-4",
  footer: "flex items-center justify-between py-4",
  pagination: "flex items-center justify-between",
  paginationText: "text-sm text-muted-foreground",
  paginationControls: "flex gap-2",
  paginationButton: "h-8 px-3 py-1.5",
  paginationButtonActive: "bg-primary text-primary-foreground",
  paginationButtonHover: "hover:bg-muted/70",
}

// Helper function to apply shared table styles with custom overrides
export function applyTableStyles(customStyles: Partial<typeof tableStyles> = {}) {
  return {
    ...tableStyles,
    ...customStyles,
  }
}

// Shared pagination component
export interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function SharedTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: TablePaginationProps) {
  const startItem = (currentPage) * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems)

  return (
    <div className={tableStyles.pagination}>
      <span className={tableStyles.paginationText}>
        Showing {startItem} to {endItem} of {totalItems} items
      </span>
      <div className={tableStyles.paginationControls}>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm h-8 w-8 bg-transparent border-none cursor-pointer transition-colors text-foreground hover:bg-muted/70",
            currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ←
        </button>
        {Array.from(
          { length: Math.min(5, totalPages) },
          (_, i) => {
            const pageNum = i + Math.max(0, currentPage - 2)
            if (pageNum >= totalPages) return null
            return (
              <button
                key={pageNum}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm min-w-[2rem] h-8 px-2 mx-0.5 bg-transparent border-none cursor-pointer transition-colors text-foreground",
                  currentPage === pageNum ? "bg-primary text-primary-foreground" : "hover:bg-muted/70"
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum + 1}
              </button>
            )
          }
        ).filter(Boolean)}
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm h-8 w-8 bg-transparent border-none cursor-pointer transition-colors text-foreground hover:bg-muted/70",
            currentPage >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          →
        </button>
      </div>
    </div>
  )
}
