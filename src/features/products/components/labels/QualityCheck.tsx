import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface QualityCheckProps {
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
  onFix: (issue: string) => void
}

interface QualityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  elementId?: string
}

export function QualityCheck({
  elements,
  labelWidth,
  labelHeight,
  onFix,
}: QualityCheckProps) {
  const issues: QualityIssue[] = []

  // Check for overlapping elements
  elements.forEach((element1, i) => {
    elements.slice(i + 1).forEach((element2) => {
      if (
        element1.x < element2.x + element2.width &&
        element1.x + element1.width > element2.x &&
        element1.y < element2.y + element2.height &&
        element1.y + element1.height > element2.y
      ) {
        issues.push({
          id: `overlap-${element1.id}-${element2.id}`,
          type: 'error',
          message: `Elements "${element1.content}" and "${element2.content}" are overlapping`,
          elementId: element1.id,
        })
      }
    })
  })

  // Check for elements outside label bounds
  elements.forEach((element) => {
    if (
      element.x < 0 ||
      element.y < 0 ||
      element.x + element.width > labelWidth ||
      element.y + element.height > labelHeight
    ) {
      issues.push({
        id: `bounds-${element.id}`,
        type: 'error',
        message: `Element "${element.content}" is outside label bounds`,
        elementId: element.id,
      })
    }
  })

  // Check for minimum element sizes
  elements.forEach((element) => {
    if (element.width < 10 || element.height < 10) {
      issues.push({
        id: `size-${element.id}`,
        type: 'warning',
        message: `Element "${element.content}" is very small and might be hard to read`,
        elementId: element.id,
      })
    }
  })

  // Check for text contrast
  elements.forEach((element) => {
    if (element.type === 'text') {
      const textColor = element.color
      const bgColor = element.backgroundColor
      // Simple contrast check (can be improved with a proper color contrast algorithm)
      if (textColor === bgColor) {
        issues.push({
          id: `contrast-${element.id}`,
          type: 'warning',
          message: `Text "${element.content}" might be hard to read due to poor contrast`,
          elementId: element.id,
        })
      }
    }
  })

  // Check for barcode readability
  elements.forEach((element) => {
    if (element.type === 'barcode') {
      if (element.width < 50 || element.height < 20) {
        issues.push({
          id: `barcode-${element.id}`,
          type: 'error',
          message: `Barcode "${element.content}" is too small to be scanned`,
          elementId: element.id,
        })
      }
    }
  })

  const handleFix = (issue: QualityIssue) => {
    onFix(issue.message)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quality Check</h3>
      <ScrollArea className="h-[300px] rounded-md border p-4">
        {issues.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <CheckCircle className="h-8 w-8 mr-2" />
            No issues found
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Alert
                key={issue.id}
                variant={
                  issue.type === 'error'
                    ? 'destructive'
                    : issue.type === 'warning'
                    ? 'warning'
                    : 'default'
                }
              >
                {issue.type === 'error' ? (
                  <XCircle className="h-4 w-4" />
                ) : issue.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {issue.type === 'error'
                    ? 'Error'
                    : issue.type === 'warning'
                    ? 'Warning'
                    : 'Info'}
                </AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>{issue.message}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFix(issue)}
                  >
                    Fix
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 