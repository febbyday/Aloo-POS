import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Clock, Search, ShoppingCart, Trash2 } from 'lucide-react'

import type { DraftSale } from '../types'

interface DraftSalesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  drafts: DraftSale[]
  onLoadDraft: (draftId: string) => void
  onDeleteDraft: (draftId: string) => void
}

export function DraftSalesDialog({ 
  open, 
  onOpenChange, 
  drafts,
  onLoadDraft,
  onDeleteDraft
}: DraftSalesDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDrafts = drafts.filter(draft => 
    draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Saved Drafts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
              <p>No saved drafts found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell className="font-mono">{draft.id}</TableCell>
                      <TableCell>{draft.name}</TableCell>
                      <TableCell>{draft.items}</TableCell>
                      <TableCell>${draft.total.toFixed(2)}</TableCell>
                      <TableCell>{draft.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLoadDraft(draft.id)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => onDeleteDraft(draft.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
