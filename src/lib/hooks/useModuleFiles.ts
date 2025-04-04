import { useState, useCallback } from 'react';
import { FileMetadata } from '../services/fileStorage';
import { useFileUpload } from './useFileUpload';

interface UseModuleFilesOptions {
  module: string;
  initialFiles?: FileMetadata[];
  maxFileSize?: number;
  allowedTypes?: string[];
  onFilesChange?: (files: FileMetadata[]) => void;
}

export function useModuleFiles({
  module,
  initialFiles = [],
  maxFileSize = 5 * 1024 * 1024,
  allowedTypes = ['image/*', 'application/pdf'],
  onFilesChange,
}: UseModuleFilesOptions) {
  const [files, setFiles] = useState<FileMetadata[]>(initialFiles);

  const { uploadFile, isUploading, error, progress } = useFileUpload({
    module,
    maxFileSize,
    allowedTypes,
    onSuccess: (file) => {
      setFiles((prev) => {
        const newFiles = [...prev, file];
        onFilesChange?.(newFiles);
        return newFiles;
      });
    },
  });

  const deleteFile = useCallback(
    async (file: FileMetadata) => {
      try {
        const response = await fetch(`/api/files/${module}/${file.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete file');
        }

        setFiles((prev) => {
          const newFiles = prev.filter((f) => f.id !== file.id);
          onFilesChange?.(newFiles);
          return newFiles;
        });
      } catch (error) {
        console.error('Delete file error:', error);
        throw error;
      }
    },
    [module, onFilesChange]
  );

  const updateFiles = useCallback(
    (newFiles: FileMetadata[]) => {
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [onFilesChange]
  );

  return {
    files,
    uploadFile,
    deleteFile,
    updateFiles,
    isUploading,
    error,
    progress,
  };
} 