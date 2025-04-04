// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductImageProps {
  image?: string;
  className?: string;
}

export function ProductImage({ image, className }: ProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);

  const hasImage = !!image;
  const displayImage = hasImage ? image : '/placeholder-product.png';

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative rounded-md border overflow-hidden bg-background h-[300px] flex items-center justify-center">
        {hasImage ? (
          <>
            <img
              src={displayImage}
              alt="Product image"
              className={cn(
                "transition-transform duration-200 object-contain h-full w-full",
                isZoomed && "cursor-zoom-out scale-150"
              )}
              onClick={toggleZoom}
            />
            <Dialog open={zoomDialogOpen} onOpenChange={setZoomDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomDialogOpen(true);
                  }}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] flex items-center justify-center p-0">
                <DialogTitle className="sr-only">Product Image Zoom View</DialogTitle>
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={displayImage}
                    alt="Product image (zoomed)"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>
    </div>
  );
}
