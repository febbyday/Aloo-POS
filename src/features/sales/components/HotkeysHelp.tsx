import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Keyboard } from 'lucide-react'

interface HotkeysHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const hotkeys = [
  { key: 'F1', description: 'Show this help dialog' },
  { key: 'F2', description: 'Search products' },
  { key: 'F3', description: 'Customer search' },
  { key: 'F4', description: 'Open numpad' },
  { key: 'F5', description: 'Toggle view mode (grid/list)' },
  { key: 'F6', description: 'Apply discount' },
  { key: 'F7', description: 'Saved drafts' },
  { key: 'F8', description: 'Recent transactions' },
  { key: 'F9', description: 'Save as draft' },
  { key: 'F10', description: 'Clear cart' },
  { key: 'F12', description: 'Complete sale' },
  { key: 'Ctrl+P', description: 'Print receipt' },
  { key: 'Esc', description: 'Close dialogs' },
]

export function HotkeysHelp({ open, onOpenChange }: HotkeysHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Shortcut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotkeys.map((hotkey) => (
                <TableRow key={hotkey.key}>
                  <TableCell className="font-mono font-medium">{hotkey.key}</TableCell>
                  <TableCell>{hotkey.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
