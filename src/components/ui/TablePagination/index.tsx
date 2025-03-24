import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from "@/lib/utils"

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm min-w-[2rem] h-8 px-2 mx-0.5 bg-transparent border-none cursor-pointer transition-colors",
            i === currentPage ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted/70"
          )}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      )
    }
    
    return pages
  }

  return (
    <div className="flex justify-between items-center w-full">
      <span className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </span>
      <div className="flex items-center gap-1">
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm h-8 w-8 bg-transparent text-foreground border-none cursor-pointer transition-colors hover:bg-muted/70",
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {renderPageNumbers()}
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm h-8 w-8 bg-transparent text-foreground border-none cursor-pointer transition-colors hover:bg-muted/70",
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
