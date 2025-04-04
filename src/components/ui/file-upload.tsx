import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { FileMetadata } from '@/lib/services/fileStorage';

interface FileUploadProps {
  module: string;
  onSuccess?: ((file: FileMetadata) => void) | undefined;
  onError?: ((error: string) => void) | undefined;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
}

export function FileUpload({
  module,
  onSuccess,
  onError,
  maxFileSize = 5 * 1024 * 1024,
  allowedTypes = ['image/*', 'application/pdf'],
  className,
  disabled = false,
  multiple = false,
  showPreview = true,
}: FileUploadProps) {
  const { uploadFile, isUploading, error, progress } = useFileUpload({
    module,
    onSuccess,
    onError,
    maxFileSize,
    allowedTypes,
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    },
    [uploadFile, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple,
    disabled: disabled || isUploading,
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'cursor-wait'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
              <Progress value={progress} className="w-full max-w-xs" />
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Drop the files here'
                  : 'Drag & drop files here, or click to select files'}
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxFileSize / 1024 / 1024}MB
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
} 