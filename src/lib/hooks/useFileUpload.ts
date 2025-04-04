import { useState } from 'react';
import { FileMetadata } from '../services/fileStorage';

interface UseFileUploadOptions {
  module: string;
  onSuccess?: ((file: FileMetadata) => void) | undefined;
  onError?: ((error: string) => void) | undefined;
  maxFileSize?: number;
  allowedTypes?: string[];
}

interface UseFileUploadResult {
  uploadFile: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export function useFileUpload({
  module,
  onSuccess,
  onError,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/*', 'application/pdf'],
}: UseFileUploadOptions): UseFileUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        // Validate file size
        if (file.size > maxFileSize) {
          throw new Error(`File size exceeds ${maxFileSize / 1024 / 1024}MB limit`);
        }

        // Validate file type
        if (!allowedTypes.some(type => file.type.match(type))) {
          throw new Error('File type not allowed');
        }

        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('module', module);

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const fileData: FileMetadata = JSON.parse(xhr.responseText);
            onSuccess?.(fileData);
            resolve();
          } else {
            const errorData = JSON.parse(xhr.responseText);
            const errorMessage = errorData.error || 'Upload failed';
            setError(errorMessage);
            onError?.(errorMessage);
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener('error', () => {
          const errorMessage = 'Upload failed';
          setError(errorMessage);
          onError?.(errorMessage);
          reject(new Error(errorMessage));
        });

        xhr.open('POST', '/api/files/upload');
        xhr.send(formData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onError?.(errorMessage);
        reject(new Error(errorMessage));
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    });
  };

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
} 