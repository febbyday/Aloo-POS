// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Copy,
  Pencil,
  Trash2,
  Plus
} from "lucide-react"
import { templateStorage, LabelTemplate } from "../../services/templateStorage"
import { formatDistanceToNow } from "date-fns"

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<LabelTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null)

  useEffect(() => {
    // Load templates when component mounts
    const loadTemplates = () => {
      const allTemplates = templateStorage.getTemplates()
      setTemplates(allTemplates)
    }

    loadTemplates()
    
    // Set up listener for template changes
    const handleTemplateChange = () => {
      loadTemplates()
    }

    templateStorage.addListener(handleTemplateChange)
    return () => templateStorage.removeListener(handleTemplateChange)
  }, [])

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (template: LabelTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedTemplate) {
      templateStorage.deleteTemplate(selectedTemplate.id)
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(null)
    }
  }

  const handleDuplicate = (template: LabelTemplate) => {
    const duplicate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    templateStorage.saveTemplate(duplicate)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Template Library</CardTitle>
          <Button size="sm" onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
        <div className="mt-2">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[calc(100vh-15rem)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(template.updatedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {template.dimensions.width}x{template.dimensions.height}mm
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {}}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Add default export for the component
export default TemplateLibrary;
