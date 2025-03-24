import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadTemplate } from '../utils/importUtils';

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileImport: (file: File) => void;
}

export function ImportExportDialog({ open, onOpenChange, onFileImport }: ImportExportDialogProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileImport(acceptedFiles[0]);
    }
  }, [onFileImport]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Products</DialogTitle>
        </DialogHeader>

        <div {...getRootProps()} className="border-2 border-dashed p-6 text-center cursor-pointer">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag & drop files here, or click to select files</p>
          )}
        </div>

        <div className="mt-4 text-sm">
          <h4 className="font-semibold">Import Rules:</h4>
          <ul className="list-disc pl-5">
            <li>File must be in Excel format (.xlsx or .xls).</li>
            <li>Ensure required fields (name, sku, category) are filled.</li>
            <li>Numeric fields must contain valid numbers.</li>
            <li>Status fields must be either "active" or "inactive".</li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => downloadTemplate()}>Download Example File</Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 