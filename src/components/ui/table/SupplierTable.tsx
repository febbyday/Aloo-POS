import React, { useState, useEffect } from 'react'
import { cn } from "@/lib/utils"
import { tableStyles, SharedTablePagination } from '../shared-table-styles'

interface SupplierTableProps {
  children: React.ReactNode
  className?: string
  data?: any[]
  pageSize?: number
  pagination?: boolean
}

export const SupplierTable = ({
  children,
  className = '',
  data = [],
  pageSize = 5,
  pagination = true,
  ...props
}: SupplierTableProps & React.HTMLAttributes<HTMLTableElement>) => {
  const [currentPage, setCurrentPage] = useState(0)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const totalPages = data.length > 0 ? Math.ceil(data.length / pageSize) : 1

  // Extract header and body from children
  const childrenArray = React.Children.toArray(children)
  const header = childrenArray.find(child => 
    React.isValidElement(child) && child.type === SupplierTableHeader
  )
  const body = childrenArray.find(child => 
    React.isValidElement(child) && child.type === SupplierTableBody
  )

  // If we have a body, paginate its children
  let paginatedBody = body
  if (body && React.isValidElement(body) && pagination && data.length > 0) {
    const bodyChildren = React.Children.toArray(body.props.children)
    const start = currentPage * pageSize
    const end = start + pageSize
    const paginatedChildren = bodyChildren.slice(start, end)
    
    paginatedBody = React.cloneElement(body, {
      ...body.props,
      children: paginatedChildren
    })
  }
  
  return (
    <div className={tableStyles.container}>
      <div className={tableStyles.tableWrapper}>
        <table className={cn(tableStyles.table, className)} {...props}>
          {header}
          {paginatedBody}
        </table>
      </div>
      {pagination && data.length > 0 && (
        <div className={tableStyles.footer}>
          <SharedTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={data.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

export const SupplierTableHeader = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <thead className={cn(tableStyles.header, className)} {...props}>
      {children}
    </thead>
  )
}

export const SupplierTableBody = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody className={cn(tableStyles.body, className)} {...props}>
      {children}
    </tbody>
  )
}

export const SupplierTableRow = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr className={cn(tableStyles.row, className)} {...props}>
      {children}
    </tr>
  )
}

export const SupplierTableHead = ({
  children,
  className = '',
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <th className={cn(tableStyles.headerCell, className)} {...props}>
      {children}
    </th>
  )
}

export const SupplierTableCell = ({
  children,
  className = '',
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <td className={cn(tableStyles.cell, className)} {...props}>
      {children}
    </td>
  )
}

export const SupplierTableFooter = ({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tfoot className={cn(tableStyles.header, className)} {...props}>
      {children}
    </tfoot>
  )
}
