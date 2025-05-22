import React from 'react';
import { FileMetadata } from '@/lib/services/fileStorage';
import { FilePreview } from './file-preview';
import { cn } from '@/lib/utils/cn';

interface FileListProps {
  files: FileMetadata[];
  onDelete?: (file: FileMetadata) => void;
  className?: string;
  showDelete?: boolean;
  emptyMessage?: string;
}

export function FileList({
  files,
  onDelete,
  className,
  showDelete = true,
  emptyMessage = 'No files uploaded',
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onDelete={onDelete ? () => onDelete(file) : undefined}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
} 