import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductImageGalleryProps {
  images?: string[];
  className?: string;
}

export function ProductImageGallery({ images = [], className }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomDialogOpen, setZoomDialogOpen] = useState(false);

  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentIndex] : '/placeholder-product.png';

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative rounded-md border overflow-hidden bg-background h-[300px] flex items-center justify-center">
        {hasImages ? (
          <>
            <img
              src={currentImage}
              alt={`Product image ${currentIndex + 1}`}
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
                    src={currentImage}
                    alt={`Product image ${currentIndex + 1} (zoomed)`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <span className="text-sm">No images available</span>
          </div>
        )}

        {hasImages && images.length > 1 && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {hasImages && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "h-16 w-16 rounded-md border overflow-hidden flex-shrink-0",
                currentIndex === index && "ring-2 ring-primary"
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`Product thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
