import React from 'react';
import { FileMetadata } from '@/lib/services/fileStorage';
import { Image, File, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface FilePreviewProps {
  file: FileMetadata;
  onDelete?: (() => void) | undefined;
  className?: string;
  showDelete?: boolean;
}

export function FilePreview({
  file,
  onDelete,
  className,
  showDelete = true,
}: FilePreviewProps) {
  const isImage = file.mimetype.startsWith('image/');
  const isPDF = file.mimetype === 'application/pdf';
  const isText = file.mimetype.startsWith('text/') || file.mimetype.includes('document');

  const getFileIcon = () => {
    if (isImage) return <Image className="h-8 w-8" />;
    if (isPDF) return <File className="h-8 w-8" />;
    if (isText) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 rounded-lg border p-4',
        className
      )}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8"
          onClick={onDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 