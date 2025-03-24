// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

interface BarcodePreviewProps {
  code: string
  format: 'CODE128' | 'CODE39' | 'QR' | 'EAN13' | 'UPCA'
  width?: number
  height?: number
  fontSize?: number
  margin?: number
  background?: string
  lineColor?: string
  onGenerated?: (dataUrl: string) => void
}

export function BarcodePreview({
  code,
  format,
  width = 2,
  height = 100,
  fontSize = 20,
  margin = 10,
  background = '#ffffff',
  lineColor = '#000000',
  onGenerated
}: BarcodePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const generateBarcode = async () => {
      if (!canvasRef.current) return

      try {
        if (format === 'QR') {
          await QRCode.toCanvas(canvasRef.current, code, {
            width: height,
            margin: 1,
            color: {
              dark: lineColor,
              light: background
            }
          })
        } else {
          JsBarcode(canvasRef.current, code, {
            format,
            width,
            height,
            fontSize,
            margin,
            background,
            lineColor,
            valid: () => true
          })
        }

        onGenerated?.(canvasRef.current.toDataURL())
      } catch (error) {
        console.error('Error generating barcode:', error)
      }
    }

    generateBarcode()
  }, [code, format, width, height, fontSize, margin, background, lineColor])

  return (
    <canvas 
      ref={canvasRef}
      className="max-w-full h-auto"
    />
  )
}

// Add default export for the component
export default BarcodePreview;
