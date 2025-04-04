import React, { useState } from 'react';
import { FileMetadata } from '@/lib/services/fileStorage';
import { FileUpload } from './file-upload';
import { FileList } from './file-list';
import { cn } from '@/lib/utils';

interface FileUploadContainerProps {
  module: string;
  files: FileMetadata[];
  onUpload?: (file: FileMetadata) => void;
  onDelete?: (file: FileMetadata) => void;
  onError?: (error: string) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  showPreview?: boolean;
  emptyMessage?: string;
}

export function FileUploadContainer({
  module,
  files,
  onUpload,
  onDelete,
  onError,
  maxFileSize = 5 * 1024 * 1024,
  allowedTypes = ['image/*', 'application/pdf'],
  className,
  disabled = false,
  multiple = false,
  showPreview = true,
  emptyMessage = 'No files uploaded',
}: FileUploadContainerProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>(files);

  const handleUpload = (file: FileMetadata) => {
    setUploadedFiles((prev) => [...prev, file]);
    onUpload?.(file);
  };

  const handleDelete = (file: FileMetadata) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
    onDelete?.(file);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <FileUpload
        module={module}
        onSuccess={handleUpload}
        onError={onError}
        maxFileSize={maxFileSize}
        allowedTypes={allowedTypes}
        disabled={disabled}
        multiple={multiple}
        showPreview={showPreview}
      />
      <FileList
        files={uploadedFiles}
        onDelete={handleDelete}
        showDelete={!disabled}
        emptyMessage={emptyMessage}
      />
    </div>
  );
} 