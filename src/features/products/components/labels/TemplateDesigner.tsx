import { useState, useCallback, useEffect } from "react"
import { useDrop } from 'react-dnd'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import {
  AlignHorizontalJustifyCenterIcon,
  AlignHorizontalJustifyEndIcon,
  AlignHorizontalJustifyStartIcon,
  AlignVerticalJustifyCenterIcon,
  AlignVerticalJustifyEndIcon,
  AlignVerticalJustifyStartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Group,
  Ungroup,
  Copy,
  Trash2,
  Plus,
  Save,
  Grid,
  CopyCheck,
  Clipboard
} from "lucide-react"
import { DraggableElement } from "./DraggableElement"
import { nanoid } from 'nanoid'
import { templateStorage, LabelTemplate, TemplateElement } from "../../services/templateStorage"

interface ElementGroup {
  id: string
  elementIds: string[]
}

const GRID_SIZE = 10

export function TemplateDesigner() {
  const [template, setTemplate] = useState<LabelTemplate>({
    id: nanoid(),
    name: "New Template",
    dimensions: { width: 400, height: 300 },
    elements: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [groups, setGroups] = useState<ElementGroup[]>([])
  const [clipboardElements, setClipboardElements] = useState<TemplateElement[]>([])
  const [showGrid, setShowGrid] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(false)

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        handleCopy()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        handlePaste()
      }
      if (e.key === 'Delete') {
        deleteElements()
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [selectedElements, template.elements])

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta && item.id) {
        let x = Math.round(item.position.x + delta.x)
        let y = Math.round(item.position.y + delta.y)
        
        if (snapToGrid) {
          x = Math.round(x / GRID_SIZE) * GRID_SIZE
          y = Math.round(y / GRID_SIZE) * GRID_SIZE
        }
        
        moveElement(item.id, x, y)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }), [template.elements, snapToGrid])

  const addElement = (type: 'barcode' | 'text' | 'image') => {
    const newElement: TemplateElement = {
      id: nanoid(),
      type,
      content: type === 'text' ? 'New Text' : '',
      position: { x: 50, y: 50 },
      size: { width: 120, height: 80 },
      rotation: 0,
      zIndex: Math.max(0, ...template.elements.map(el => el.zIndex || 0)) + 1
    }

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date()
    }))
  }

  const moveElement = (id: string, x: number, y: number) => {
    const group = groups.find(g => g.elementIds.includes(id))
    
    if (group) {
      const mainElement = template.elements.find(el => el.id === id)
      if (!mainElement) return

      const deltaX = x - mainElement.position.x
      const deltaY = y - mainElement.position.y

      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          group.elementIds.includes(el.id)
            ? { ...el, position: { 
                x: snapToGrid 
                  ? Math.round((el.position.x + deltaX) / GRID_SIZE) * GRID_SIZE
                  : el.position.x + deltaX,
                y: snapToGrid
                  ? Math.round((el.position.y + deltaY) / GRID_SIZE) * GRID_SIZE
                  : el.position.y + deltaY
              }}
            : el
        ),
        updatedAt: new Date()
      }))
    } else {
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          el.id === id 
            ? { ...el, position: { x, y } }
            : el
        ),
        updatedAt: new Date()
      }))
    }
  }

  const distributeElements = (direction: 'horizontal' | 'vertical') => {
    if (selectedElements.length < 3) return

    const selectedElementsData = template.elements
      .filter(el => selectedElements.includes(el.id))
      .sort((a, b) => {
        if (direction === 'horizontal') {
          return a.position.x - b.position.x
        }
        return a.position.y - b.position.y
      })

    const first = selectedElementsData[0]
    const last = selectedElementsData[selectedElementsData.length - 1]
    
    if (direction === 'horizontal') {
      const totalSpace = last.position.x - first.position.x
      const spacing = totalSpace / (selectedElementsData.length - 1)
      
      selectedElementsData.forEach((el, index) => {
        if (index !== 0 && index !== selectedElementsData.length - 1) {
          moveElement(el.id, first.position.x + spacing * index, el.position.y)
        }
      })
    } else {
      const totalSpace = last.position.y - first.position.y
      const spacing = totalSpace / (selectedElementsData.length - 1)
      
      selectedElementsData.forEach((el, index) => {
        if (index !== 0 && index !== selectedElementsData.length - 1) {
          moveElement(el.id, el.position.x, first.position.y + spacing * index)
        }
      })
    }
  }

  const handleCopy = () => {
    const elementsToCopy = template.elements
      .filter(el => selectedElements.includes(el.id))
      .map(el => ({
        ...el,
        id: nanoid(),
        position: { x: el.position.x + 20, y: el.position.y + 20 }
      }))
    setClipboardElements(elementsToCopy)
  }

  const handlePaste = () => {
    if (clipboardElements.length === 0) return

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, ...clipboardElements.map(el => ({
        ...el,
        id: nanoid(),
        position: { x: el.position.x + 20, y: el.position.y + 20 }
      }))],
      updatedAt: new Date()
    }))
  }

  const adjustLayer = (direction: 'up' | 'down') => {
    if (selectedElements.length === 0) return

    setTemplate(prev => {
      const elements = [...prev.elements]
      const maxZ = Math.max(...elements.map(el => el.zIndex || 0))
      
      selectedElements.forEach(id => {
        const element = elements.find(el => el.id === id)
        if (element) {
          if (direction === 'up') {
            element.zIndex = (element.zIndex || 0) + 1
          } else {
            element.zIndex = Math.max(0, (element.zIndex || 0) - 1)
          }
        }
      })

      return {
        ...prev,
        elements,
        updatedAt: new Date()
      }
    })
  }

  const alignElements = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return

    const selectedElementsData = template.elements.filter(el => 
      selectedElements.includes(el.id)
    )

    let alignPosition: number
    switch (direction) {
      case 'left':
        alignPosition = Math.min(...selectedElementsData.map(el => el.position.x))
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { ...el.position, x: alignPosition } }
              : el
          )
        }))
        break
      case 'center':
        alignPosition = selectedElementsData.reduce((sum, el) => 
          sum + (el.position.x + el.size.width / 2), 0
        ) / selectedElementsData.length
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { 
                  ...el.position, 
                  x: alignPosition - el.size.width / 2 
                } }
              : el
          )
        }))
        break
      case 'right':
        alignPosition = Math.max(...selectedElementsData.map(el => 
          el.position.x + el.size.width
        ))
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { 
                  ...el.position, 
                  x: alignPosition - el.size.width 
                } }
              : el
          )
        }))
        break
      case 'top':
        alignPosition = Math.min(...selectedElementsData.map(el => el.position.y))
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { ...el.position, y: alignPosition } }
              : el
          )
        }))
        break
      case 'middle':
        alignPosition = selectedElementsData.reduce((sum, el) => 
          sum + (el.position.y + el.size.height / 2), 0
        ) / selectedElementsData.length
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { 
                  ...el.position, 
                  y: alignPosition - el.size.height / 2 
                } }
              : el
          )
        }))
        break
      case 'bottom':
        alignPosition = Math.max(...selectedElementsData.map(el => 
          el.position.y + el.size.height
        ))
        setTemplate(prev => ({
          ...prev,
          elements: prev.elements.map(el =>
            selectedElements.includes(el.id)
              ? { ...el, position: { 
                  ...el.position, 
                  y: alignPosition - el.size.height 
                } }
              : el
          )
        }))
        break
    }
  }

  const groupElements = () => {
    if (selectedElements.length < 2) return

    const newGroup: ElementGroup = {
      id: nanoid(),
      elementIds: selectedElements
    }

    setGroups(prev => [...prev, newGroup])
  }

  const ungroupElements = () => {
    const groupsToRemove = groups.filter(g => 
      g.elementIds.some(id => selectedElements.includes(id))
    )
    
    setGroups(prev => 
      prev.filter(g => !groupsToRemove.includes(g))
    )
  }

  const updateElementContent = (id: string, content: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id
          ? { ...el, content }
          : el
      ),
      updatedAt: new Date()
    }))
  }

  const resizeElement = (id: string, size: { width: number; height: number }) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id
          ? { ...el, size }
          : el
      ),
      updatedAt: new Date()
    }))
  }

  const rotateElement = (id: string, rotation: number) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id
          ? { ...el, rotation }
          : el
      ),
      updatedAt: new Date()
    }))
  }

  const deleteElements = () => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !selectedElements.includes(el.id)),
      updatedAt: new Date()
    }))
    setSelectedElements([])
  }

  const handleSave = async () => {
    await templateStorage.saveTemplate(template)
  }

  const handleElementSelect = (id: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      setSelectedElements(prev => 
        prev.includes(id) 
          ? prev.filter(elementId => elementId !== id)
          : [...prev, id]
      )
    } else {
      setSelectedElements([id])
    }
    event.stopPropagation()
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Template Designer</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 mr-4">
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
                id="show-grid"
              />
              <Label htmlFor="show-grid">Show Grid</Label>
            </div>
            <div className="flex items-center space-x-2 mr-4">
              <Switch
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
                id="snap-grid"
              />
              <Label htmlFor="snap-grid">Snap to Grid</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[200px_1fr]">
            {/* Toolbox */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add Elements</Label>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addElement('barcode')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Barcode
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addElement('text')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addElement('image')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                </div>
              </div>

              {selectedElements.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Clipboard</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleCopy}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handlePaste}
                        disabled={clipboardElements.length === 0}
                      >
                        <Clipboard className="w-4 h-4 mr-2" />
                        Paste
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Layer</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => adjustLayer('up')}
                      >
                        <ArrowUpIcon className="w-4 h-4 mr-2" />
                        Bring Forward
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => adjustLayer('down')}
                      >
                        <ArrowDownIcon className="w-4 h-4 mr-2" />
                        Send Back
                      </Button>
                    </div>
                  </div>

                  {selectedElements.length > 2 && (
                    <div className="space-y-2">
                      <Label>Distribution</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => distributeElements('horizontal')}
                        >
                          Horizontal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => distributeElements('vertical')}
                        >
                          Vertical
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('left')}
                      >
                        <AlignHorizontalJustifyStartIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('center')}
                      >
                        <AlignHorizontalJustifyCenterIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('right')}
                      >
                        <AlignHorizontalJustifyEndIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('top')}
                      >
                        <AlignVerticalJustifyStartIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('middle')}
                      >
                        <AlignVerticalJustifyCenterIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alignElements('bottom')}
                      >
                        <AlignVerticalJustifyEndIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Group</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={groupElements}
                        disabled={selectedElements.length < 2}
                      >
                        <Group className="w-4 h-4 mr-2" />
                        Group
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={ungroupElements}
                      >
                        <Ungroup className="w-4 h-4 mr-2" />
                        Ungroup
                      </Button>
                    </div>
                  </div>

                  {selectedElements.length === 1 && template.elements.find(el => 
                    el.id === selectedElements[0]
                  )?.type === 'text' && (
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Input
                        value={template.elements.find(el => 
                          el.id === selectedElements[0]
                        )?.content || ''}
                        onChange={(e) => updateElementContent(selectedElements[0], e.target.value)}
                        placeholder="Enter text"
                      />
                    </div>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={deleteElements}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete {selectedElements.length > 1 ? 'Elements' : 'Element'}
                  </Button>
                </>
              )}
            </div>

            {/* Canvas */}
            <div 
              ref={drop}
              className="border rounded-lg bg-white relative"
              style={{
                width: template.dimensions.width,
                height: template.dimensions.height,
                backgroundImage: showGrid ? `
                  linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                  linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
                ` : 'none',
                backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto'
              }}
              onClick={() => setSelectedElements([])}
            >
              {template.elements
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((element) => (
                  <DraggableElement
                    key={element.id}
                    {...element}
                    onSelect={(e) => handleElementSelect(element.id, e)}
                    isSelected={selectedElements.includes(element.id)}
                    onResize={(size) => resizeElement(element.id, size)}
                    onRotate={(rotation) => rotateElement(element.id, rotation)}
                    snapToGrid={snapToGrid}
                    gridSize={GRID_SIZE}
                  />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
