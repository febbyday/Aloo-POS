import { useState, useEffect } from "react"
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
  Clipboard,
  Image,
  Barcode,
  Type,
  Hash,
  DollarSign,
  Calendar,
  Package,
  Tag,
  Settings,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignTop,
  AlignMiddle,
  AlignBottom
} from "lucide-react"
import { DraggableElement } from "./DraggableElement"
import { nanoid } from 'nanoid'
import { templateStorage, LabelTemplate, TemplateElement } from "../../services/templateStorage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LabelDesignerProps {
  templateId?: string
  previewMode?: boolean
}

interface ElementGroup {
  id: string
  elements: string[]
}

interface LabelElement extends TemplateElement {
  id: string
  zIndex?: number
}

export function LabelDesigner({ templateId, previewMode = false }: LabelDesignerProps) {
  const [elements, setElements] = useState<LabelElement[]>([])
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [groups, setGroups] = useState<ElementGroup[]>([])
  const [template, setTemplate] = useState<LabelTemplate | null>(null)
  const [templateProperties, setTemplateProperties] = useState({
    width: 100,
    height: 50,
  })
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId) {
      const loadedTemplate = templateStorage.getTemplate(templateId)
      if (loadedTemplate) {
        setTemplate(loadedTemplate)
        setElements(loadedTemplate.elements.map(el => ({
          ...el,
          id: nanoid(),
          zIndex: elements.length,
        })))
        setTemplateProperties(loadedTemplate.dimensions)
      }
    }
  }, [templateId])

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: { type: string; content: string }, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset) {
        addElement(item.type, item.content, offset.x, offset.y)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const addElement = (type: string, content: string, x: number, y: number) => {
    const newElement: LabelElement = {
      id: nanoid(),
      type: type as 'barcode' | 'text' | 'image',
      content,
      position: { x, y },
      size: { width: 100, height: 30 },
      rotation: 0,
      style: {
        fontSize: 12,
        fontFamily: 'Arial',
        color: '#000000',
      },
      zIndex: elements.length,
    }
    setElements([...elements, newElement])
  }

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    setSelectedElements(selectedElements.filter(elId => elId !== id))
  }

  const handleSelectElement = (id: string, multiSelect: boolean = false) => {
    if (multiSelect) {
      setSelectedElements(prev => 
        prev.includes(id) 
          ? prev.filter(elId => elId !== id)
          : [...prev, id]
      )
    } else {
      setSelectedElements([id])
    }
  }

  const handleGroupElements = () => {
    if (selectedElements.length < 2) return

    const newGroup: ElementGroup = {
      id: nanoid(),
      elements: [...selectedElements]
    }
    setGroups([...groups, newGroup])
  }

  const handleUngroupElements = () => {
    const selectedGroup = groups.find(group => 
      group.elements.every(id => selectedElements.includes(id))
    )
    if (selectedGroup) {
      setGroups(groups.filter(g => g.id !== selectedGroup.id))
    }
  }

  const handleAlignElements = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedElements.length < 2) return

    const selectedElementsData = elements.filter(el => selectedElements.includes(el.id))
    const referenceElement = selectedElementsData[0]

    const updatedElements = elements.map(el => {
      if (!selectedElements.includes(el.id)) return el

      const updates: Partial<LabelElement> = {}
      if (alignment === 'left') updates.position = { ...el.position, x: referenceElement.position.x }
      if (alignment === 'center') updates.position = { ...el.position, x: referenceElement.position.x + (referenceElement.size.width - el.size.width) / 2 }
      if (alignment === 'right') updates.position = { ...el.position, x: referenceElement.position.x + referenceElement.size.width - el.size.width }
      if (alignment === 'top') updates.position = { ...el.position, y: referenceElement.position.y }
      if (alignment === 'middle') updates.position = { ...el.position, y: referenceElement.position.y + (referenceElement.size.height - el.size.height) / 2 }
      if (alignment === 'bottom') updates.position = { ...el.position, y: referenceElement.position.y + referenceElement.size.height - el.size.height }

      return { ...el, ...updates }
    })

    setElements(updatedElements)
  }

  const handleSaveTemplate = () => {
    if (!templateId) return

    const updatedTemplate: LabelTemplate = {
      id: templateId,
      name: template?.name || 'Untitled Template',
      dimensions: templateProperties,
      elements: elements.map(el => ({
        ...el,
        id: nanoid(),
        zIndex: elements.length,
      })),
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    templateStorage.saveTemplate(updatedTemplate)
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Toolbar */}
      <div className="col-span-12 flex items-center gap-2 p-2 border-b">
        <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
          <Grid className="h-4 w-4 mr-2" />
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
          <CopyCheck className="h-4 w-4 mr-2" />
          {snapToGrid ? 'Disable Snap' : 'Enable Snap'}
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" onClick={handleGroupElements}>
          <Group className="h-4 w-4 mr-2" />
          Group
        </Button>
        <Button variant="outline" size="sm" onClick={handleUngroupElements}>
          <Ungroup className="h-4 w-4 mr-2" />
          Ungroup
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('left')}>
          <AlignHorizontalJustifyStartIcon className="h-4 w-4 mr-2" />
          Align Left
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('center')}>
          <AlignHorizontalJustifyCenterIcon className="h-4 w-4 mr-2" />
          Align Center
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('right')}>
          <AlignHorizontalJustifyEndIcon className="h-4 w-4 mr-2" />
          Align Right
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('top')}>
          <AlignVerticalJustifyStartIcon className="h-4 w-4 mr-2" />
          Align Top
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('middle')}>
          <AlignVerticalJustifyCenterIcon className="h-4 w-4 mr-2" />
          Align Middle
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAlignElements('bottom')}>
          <AlignVerticalJustifyEndIcon className="h-4 w-4 mr-2" />
          Align Bottom
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>

      {/* Elements Panel */}
      <Card className="w-64 p-4">
        <h3 className="text-lg font-semibold mb-4">Elements</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addElement("text", "Text", 10, 10)}
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addElement("barcode", "Barcode", 10, 10)}
          >
            <Barcode className="h-4 w-4 mr-2" />
            Barcode
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addElement("image", "Image", 10, 10)}
          >
            <Image className="h-4 w-4 mr-2" />
            Image
          </Button>
        </div>
      </Card>

      {/* Design Canvas */}
      <Card
        ref={drop}
        className={`flex-1 relative ${
          isOver ? "border-2 border-dashed border-primary" : ""
        }`}
        style={{
          width: templateProperties.width,
          height: templateProperties.height,
        }}
      >
        {showGrid && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              opacity: 0.5,
            }}
          />
        )}
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={selectedElements.includes(element.id)}
            onSelect={handleSelectElement}
            onUpdate={updateElement}
            onDelete={deleteElement}
            previewMode={previewMode}
          />
        ))}
      </Card>

      {/* Properties Panel */}
      <Card className="w-64 p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        <div className="space-y-4">
          {/* Template Properties */}
          <div>
            <Label>Template Size</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={templateProperties.width}
                onChange={(e) =>
                  setTemplateProperties((prev) => ({
                    ...prev,
                    width: Number(e.target.value),
                  }))
                }
                placeholder="Width"
              />
              <Input
                type="number"
                value={templateProperties.height}
                onChange={(e) =>
                  setTemplateProperties((prev) => ({
                    ...prev,
                    height: Number(e.target.value),
                  }))
                }
                placeholder="Height"
              />
            </div>
          </div>

          {/* Selected Element Properties */}
          {selectedElements.length === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Position</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.position.x}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        position: { ...elements.find((e) => e.id === selectedElements[0])?.position, x: Number(e.target.value) }
                      })
                    }
                    placeholder="X"
                  />
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.position.y}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        position: { ...elements.find((e) => e.id === selectedElements[0])?.position, y: Number(e.target.value) }
                      })
                    }
                    placeholder="Y"
                  />
                </div>
              </div>

              <div>
                <Label>Size</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.size.width}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        size: { ...elements.find((e) => e.id === selectedElements[0])?.size, width: Number(e.target.value) }
                      })
                    }
                    placeholder="Width"
                  />
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.size.height}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        size: { ...elements.find((e) => e.id === selectedElements[0])?.size, height: Number(e.target.value) }
                      })
                    }
                    placeholder="Height"
                  />
                </div>
              </div>

              <div>
                <Label>Font</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.fontSize}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          fontSize: Number(e.target.value),
                        },
                      })
                    }
                    placeholder="Font Size"
                  />
                  <Select
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.fontFamily}
                    onValueChange={(value) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          fontFamily: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Font Family" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Colors</Label>
                <div className="space-y-2">
                  <Input
                    type="color"
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.color}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          color: e.target.value,
                        },
                      })
                    }
                  />
                  <Input
                    type="color"
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.backgroundColor}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          backgroundColor: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Border</Label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.borderWidth}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          borderWidth: Number(e.target.value),
                        },
                      })
                    }
                    placeholder="Border Width"
                  />
                  <Input
                    type="color"
                    value={elements.find((e) => e.id === selectedElements[0])?.style?.borderColor}
                    onChange={(e) =>
                      updateElement(selectedElements[0], {
                        style: {
                          ...elements.find((e) => e.id === selectedElements[0])?.style,
                          borderColor: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Multiple Selection Actions */}
          {selectedElements.length > 1 && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGroupElements}
              >
                <Group className="h-4 w-4 mr-2" />
                Group Elements
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUngroupElements}
              >
                <Ungroup className="h-4 w-4 mr-2" />
                Ungroup Elements
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("left")}
                >
                  <AlignHorizontalJustifyStartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("center")}
                >
                  <AlignHorizontalJustifyCenterIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("right")}
                >
                  <AlignHorizontalJustifyEndIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("top")}
                >
                  <AlignVerticalJustifyStartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("middle")}
                >
                  <AlignVerticalJustifyCenterIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleAlignElements("bottom")}
                >
                  <AlignVerticalJustifyEndIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button className="w-full" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </Card>
    </div>
  )
} 