import { cn } from '@/lib/utils/cn';

// Shared table styling constants with improved responsiveness
export const tableStyles = {
  container: "space-y-4",
  tableWrapper: "overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0",
  table: "w-full caption-bottom text-sm min-w-[640px]",
  header: "bg-muted/50",
  headerRow: "hover:bg-transparent",
  headerCell: "h-12 px-2 sm:px-4 align-middle cursor-pointer hover:bg-muted/50 [&:has([role=checkbox])]:pr-0 w-[40px]",
  headerCellContent: "flex items-center gap-1 sm:gap-2",
  headerIcon: "h-4 w-4",
  sortIcon: "h-4 w-4",
  sortIconContainer: "w-4",
  inactiveSortIcon: "h-4 w-4 opacity-30",
  body: "",
  row: "border-b border-border transition-colors hover:bg-muted/50 cursor-pointer",
  selectedRow: "bg-muted",
  cell: "h-12 px-2 sm:px-4 align-middle [&:has([role=checkbox])]:pr-0 w-[40px] whitespace-nowrap sm:whitespace-normal",
  cellWithIcon: "flex items-center gap-1 sm:gap-2",
  icon: "h-4 w-4",
  footer: "flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 gap-4",
  pagination: "flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2",
  paginationText: "text-sm text-muted-foreground",
  paginationControls: "flex gap-1 sm:gap-2 w-full sm:w-auto justify-center",
  paginationButton: "h-8 px-2 sm:px-3 py-1.5",
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
          aria-label="Previous page"
        >
          ←
        </button>
        {/* Show fewer page buttons on small screens */}
        {Array.from(
          { length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) },
          (_, i) => {
            // On mobile, show current page and one on each side if possible
            let pageNum;
            if (window.innerWidth < 640) {
              pageNum = i + Math.max(0, currentPage - 1);
            } else {
              pageNum = i + Math.max(0, currentPage - 2);
            }

            if (pageNum >= totalPages) return null;
            return (
              <button
                key={pageNum}
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm min-w-[2rem] h-8 px-2 mx-0.5 bg-transparent border-none cursor-pointer transition-colors text-foreground",
                  currentPage === pageNum ? "bg-primary text-primary-foreground" : "hover:bg-muted/70"
                )}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum + 1}`}
                aria-current={currentPage === pageNum ? "page" : undefined}
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
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  )
}
