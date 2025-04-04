import React from 'react'
import { History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Shop } from '../types/shops.types'

export function ShopHistoryDialog({
  open,
  onOpenChange,
  shop
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shop: Shop
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Shop History
          </DialogTitle>
          <DialogDescription>
            View the history of changes for this shop
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{new Date(shop.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Update</TableCell>
                  <TableCell>Shop details updated</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{new Date(shop.createdAt).toLocaleString()}</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Create</TableCell>
                  <TableCell>Shop created</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 