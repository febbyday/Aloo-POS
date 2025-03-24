import * as React from "react";
import { cn } from "@/lib/utils";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fallback, alt, src, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const handleError = () => {
      setHasError(true);
    };

    if (hasError && fallback) {
      return <>{fallback}</>;
    }

    return (
      <img
        ref={ref}
        className={cn("object-cover", className)}
        alt={alt}
        src={src}
        onError={handleError}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export { Image }; 