// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { TemplateElement } from '../../services/templateStorage'

interface DraggableElementProps {
  element: TemplateElement
  isSelected?: boolean
  previewMode?: boolean
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<TemplateElement>) => void
  onDelete?: (id: string) => void
  icon?: LucideIcon
}

export function DraggableElement({
  element,
  isSelected = false,
  previewMode = false,
  onSelect,
  onUpdate,
  onDelete,
  icon: Icon
}: DraggableElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  const [{ isDragging: isOver }, drop] = useDrop(() => ({
    accept: 'element',
    drop: (item: { id: string; type: string; content: string }) => {
      if (item.id === element.id) {
        onUpdate?.(element.id, { position: element.position })
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isOver(),
    }),
  }))

  const [{ isDragging: isDraggingElement }, drag] = useDrag(() => ({
    type: 'element',
    item: { id: element.id, type: element.type, content: element.content },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const handleMouseDown = (e: React.MouseEvent) => {
    if (previewMode) return
    e.stopPropagation()
    onSelect?.(element.id)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    if (previewMode) return
    e.stopPropagation()
    setIsResizing(true)
    const startWidth = element.size.width
    const startHeight = element.size.height
    const initialX = element.position.x
    const initialY = element.position.y

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX = e.clientX - initialX
      const deltaY = e.clientY - initialY

      onUpdate?.(element.id, {
        size: {
          width: Math.max(20, startWidth + deltaX),
          height: Math.max(20, startHeight + deltaY),
        },
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleRotateStart = (e: React.MouseEvent) => {
    if (previewMode) return
    e.stopPropagation()
    setIsRotating(true)
    const startRotation = element.rotation
    const centerX = element.position.x + element.size.width / 2
    const centerY = element.position.y + element.size.height / 2

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRotating) return

      const deltaX = e.clientX - centerX
      const deltaY = e.clientY - centerY
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) - 90

      onUpdate?.(element.id, {
        rotation: Math.round(angle),
      })
    }

    const handleMouseUp = () => {
      setIsRotating(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  drag(drop(elementRef))

  return (
    <div
      ref={elementRef}
      className={cn(
        'absolute cursor-move',
        isDraggingElement && 'opacity-50',
        isOver && 'border-2 border-primary',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        fontSize: element.style?.fontSize || 14,
        fontFamily: element.style?.fontFamily || 'Arial',
        color: element.style?.color || '#000000',
        backgroundColor: element.style?.backgroundColor || 'transparent',
        border: `${element.style?.borderWidth || 0}px solid ${element.style?.borderColor || '#000000'}`,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: isDraggingElement || isOver ? 1000 : element.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {!previewMode && (
        <>
          {/* Resize handles */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-se-resize"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 bg-primary cursor-sw-resize"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 bg-primary cursor-ne-resize"
            onMouseDown={handleResizeStart}
          />
          <div
            className="absolute top-0 left-0 w-3 h-3 bg-primary cursor-nw-resize"
            onMouseDown={handleResizeStart}
          />

          {/* Rotate handle */}
          <div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary cursor-pointer"
            onMouseDown={handleRotateStart}
          />

          {/* Delete button */}
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-8 -right-8 h-4 w-4"
            onClick={() => onDelete?.(element.id)}
          >
            ×
          </Button>
        </>
      )}

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {Icon ? (
          <Icon className="h-6 w-6" />
        ) : (
          <span>{element.content}</span>
        )}
      </div>
    </div>
  )
}

// Add default export for the component
export default DraggableElement;
