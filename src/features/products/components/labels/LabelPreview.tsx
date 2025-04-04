import { useState } from 'react'
import { Eye, EyeOff, Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DraggableElement } from './DraggableElement'

interface LabelPreviewProps {
  elements: Array<{
    id: string
    type: string
    content: string
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    fontFamily: string
    color: string
    backgroundColor: string
    borderWidth: number
    borderColor: string
    rotation: number
    zIndex: number
  }>
  labelWidth: number
  labelHeight: number
  onPrint: () => void
  onDownload: () => void
}

export function LabelPreview({
  elements,
  labelWidth,
  labelHeight,
  onPrint,
  onDownload,
}: LabelPreviewProps) {
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Label Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGuides(!showGuides)}
          >
            {showGuides ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div
        className="relative mx-auto bg-white border rounded-lg overflow-hidden"
        style={{
          width: labelWidth,
          height: labelHeight,
        }}
      >
        {/* Grid */}
        {showGrid && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #f0f0f0 1px, transparent 1px),
                linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              opacity: 0.5,
            }}
          />
        )}

        {/* Guides */}
        {showGuides && (
          <>
            <div
              className="absolute top-0 bottom-0 left-1/2 border-l border-blue-500"
              style={{ transform: 'translateX(-50%)' }}
            />
            <div
              className="absolute left-0 right-0 top-1/2 border-t border-blue-500"
              style={{ transform: 'translateY(-50%)' }}
            />
          </>
        )}

        {/* Elements */}
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            {...element}
            previewMode={true}
          />
        ))}
      </div>

      {/* Dimensions */}
      <div className="mt-2 text-sm text-muted-foreground text-center">
        {labelWidth}mm × {labelHeight}mm
      </div>
    </Card>
  )
} 