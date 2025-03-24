// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useDrag } from 'react-dnd'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface DraggableElementProps {
  id: string
  type: 'barcode' | 'text' | 'image'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  zIndex?: number
  isSelected: boolean
  snapToGrid: boolean
  gridSize: number
  onSelect: (event: React.MouseEvent) => void
  onResize: (size: { width: number; height: number }) => void
  onRotate: (rotation: number) => void
}

export function DraggableElement({
  id,
  type,
  content,
  position,
  size,
  rotation,
  zIndex = 0,
  isSelected,
  snapToGrid,
  gridSize,
  onSelect,
  onResize,
  onRotate
}: DraggableElementProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const initialMousePos = useRef({ x: 0, y: 0 })
  const initialSize = useRef(size)
  const initialRotation = useRef(rotation)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: { id, type, position },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [id, position])

  const handleMouseDown = (e: React.MouseEvent, action: 'resize' | 'rotate') => {
    if (action === 'resize') {
      setIsResizing(true)
      initialMousePos.current = { x: e.clientX, y: e.clientY }
      initialSize.current = size
    } else {
      setIsRotating(true)
      initialMousePos.current = { x: e.clientX, y: e.clientY }
      initialRotation.current = rotation
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - initialMousePos.current.x
      const deltaY = e.clientY - initialMousePos.current.y
      
      let newWidth = Math.max(50, initialSize.current.width + deltaX)
      let newHeight = Math.max(50, initialSize.current.height + deltaY)
      
      if (snapToGrid) {
        newWidth = Math.round(newWidth / gridSize) * gridSize
        newHeight = Math.round(newHeight / gridSize) * gridSize
      }
      
      onResize({ width: newWidth, height: newHeight })
    } else if (isRotating) {
      const element = elementRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const angle = Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) * 180 / Math.PI

      // Snap to 15-degree increments
      const snappedAngle = Math.round(angle / 15) * 15
      onRotate(snappedAngle)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    setIsRotating(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={(node) => {
        drag(node)
        if (elementRef.current) elementRef.current = node
      }}
      className={cn(
        'absolute cursor-move',
        isSelected && 'outline outline-2 outline-blue-500',
        isDragging && 'opacity-50'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        zIndex
      }}
      onClick={onSelect}
    >
      {/* Element Content */}
      <div className="w-full h-full flex items-center justify-center">
        {type === 'text' && (
          <span>{content}</span>
        )}
        {type === 'barcode' && (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            Barcode
          </div>
        )}
        {type === 'image' && (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            Image
          </div>
        )}
      </div>

      {/* Resize and Rotate Handles */}
      {isSelected && (
        <>
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-blue-500 cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, 'resize')
            }}
          />
          
          {/* Rotate handle */}
          <div
            className="absolute -top-6 left-1/2 w-4 h-4 bg-white border-2 border-blue-500 cursor-pointer rounded-full"
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, 'rotate')
            }}
          />
        </>
      )}
    </div>
  )
}

// Add default export for the component
export default DraggableElement;
