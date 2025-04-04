import React, { useState, useRef } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DocumentTypeSchema, 
  DocumentType,
  ALLOWED_FILE_TYPES, 
  MAX_FILE_SIZE, 
  CreateDocument,
  DocumentStatusSchema
} from '../types/document';
import { useStaffDocuments } from '../hooks';
import { FileWarning, Upload, Loader2, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

interface DocumentUploadProps {
  staffId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  staffId,
  onSuccess,
  onCancel
}) => {
  const { uploadDocument } = useStaffDocuments({ staffId, autoLoad: false });
  
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [notes, setNotes] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File format validation
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.all.includes(file.type)) {
      return {
        valid: false,
        message: 'File type not supported'
      };
    }
    
    return { valid: true };
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validation = validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.message || 'Invalid file');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    }
  };
  
  // Simulate upload progress
  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType || !fileName) {
      setError('Please fill in all required fields and select a file');
      return;
    }
    
    // Validate that documentType is a valid DocumentType value
    if (!Object.values(DocumentTypeSchema.enum).includes(documentType as any)) {
      setError('Invalid document type selected');
      return;
    }
    
    setIsUploading(true);
    setError('');
    const cleanup = simulateProgress();
    
    try {
      const documentData: Omit<CreateDocument, 'staffId'> & { file: File } = {
        name: fileName,
        type: documentType as DocumentType,
        file,
        notes: notes || null,
        expiresAt: expiryDate ? new Date(expiryDate) : null,
        status: "PENDING",
        fileUrl: '' // This will be set by the server, but we need to include it to satisfy TypeScript
      };
      
      const result = await uploadDocument(documentData);
      
      if (result) {
        setUploadProgress(100);
        setIsSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError('Failed to upload document');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
    } finally {
      cleanup();
      setIsUploading(false);
    }
  };
  
  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  // Reset form
  const handleCancel = () => {
    setFile(null);
    setFileName('');
    setDocumentType('');
    setNotes('');
    setExpiryDate('');
    setError('');
    setIsSuccess(false);
    if (onCancel) onCancel();
  };
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Supported file types: PDF, Word, Images (JPEG, PNG, GIF)
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* File selection */}
          <div className="space-y-2">
            <Label htmlFor="file">Document</Label>
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                className="hidden"
                accept={ALLOWED_FILE_TYPES.all.join(',')}
                onChange={handleFileChange}
                disabled={isUploading}
              />
              
              {!file ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Click to browse or drop files here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 justify-center">
                  <FileCheck className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[250px]">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Document name */}
          <div className="space-y-2">
            <Label htmlFor="name">Document Name*</Label>
            <Input
              id="name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter document name"
              required
              disabled={isUploading}
            />
          </div>
          
          {/* Document type */}
          <div className="space-y-2">
            <Label htmlFor="type">Document Type*</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
              disabled={isUploading}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(DocumentTypeSchema.enum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Expiry date */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              disabled={isUploading}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add additional notes about this document"
              rows={3}
              disabled={isUploading}
            />
          </div>
          
          {/* Error message */}
          {error && (
            <div className="flex items-center space-x-2 text-destructive">
              <FileWarning className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {/* Success message */}
          {isSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Document uploaded successfully!</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!file || !documentType || !fileName || isUploading || isSuccess}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : 'Upload Document'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 