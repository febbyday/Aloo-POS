import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { documentService } from '../services/documentService';
import { 
  StaffDocument, 
  CreateDocument, 
  UpdateDocument,
  DocumentType
} from '../types/document';

interface UseStaffDocumentsProps {
  staffId: string;
  autoLoad?: boolean;
}

/**
 * Hook for managing staff documents
 * 
 * @param staffId The ID of the staff member
 * @param autoLoad Whether to load documents automatically on mount
 */
export function useStaffDocuments({ staffId, autoLoad = true }: UseStaffDocumentsProps) {
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all documents for the staff member
   */
  const fetchDocuments = useCallback(async () => {
    if (!staffId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await documentService.fetchAll(staffId);
      setDocuments(data);
      
      if (documentService.isUsingMockData()) {
        toast({
          title: 'Using Mock Data',
          description: 'The backend service is not available. Using mock data instead.',
          variant: 'default',
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch documents');
      setError(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  /**
   * Upload a new document
   */
  const uploadDocument = useCallback(async (data: Omit<CreateDocument, 'staffId'> & { file: File }) => {
    if (!staffId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const documentData: CreateDocument = {
        ...data,
        staffId,
      };
      
      const newDocument = await documentService.upload(documentData);
      setDocuments(prev => [...prev, newDocument]);
      
      toast({
        title: 'Document Uploaded',
        description: 'Document was successfully uploaded.',
      });
      
      return newDocument;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upload document');
      setError(error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  /**
   * Update an existing document
   */
  const updateDocument = useCallback(async (documentId: string, data: UpdateDocument) => {
    if (!staffId) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedDocument = await documentService.update(documentId, data);
      setDocuments(prev => 
        prev.map(doc => doc.id === documentId ? updatedDocument : doc)
      );
      
      toast({
        title: 'Document Updated',
        description: 'Document was successfully updated.',
      });
      
      return updatedDocument;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update document');
      setError(error);
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  /**
   * Delete a document
   */
  const deleteDocument = useCallback(async (documentId: string) => {
    if (!staffId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      await documentService.delete(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // If the deleted document was selected, clear selection
      if (selectedDocumentId === documentId) {
        setSelectedDocumentId(null);
      }
      
      toast({
        title: 'Document Deleted',
        description: 'Document was successfully deleted.',
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete document');
      setError(error);
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [staffId, selectedDocumentId, toast]);

  /**
   * Download a document
   */
  const downloadDocument = useCallback(async (documentId: string, filename?: string) => {
    if (!staffId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const blob = await documentService.download(documentId);
      
      // Create a link to download the blob
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Your document download has started.',
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download document');
      setError(error);
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [staffId, toast]);

  /**
   * Get documents filtered by type
   */
  const getDocumentsByType = useCallback((type: DocumentType) => {
    return documents.filter(doc => doc.type === type);
  }, [documents]);

  /**
   * Select a document by ID
   */
  const selectDocument = useCallback((documentId: string | null) => {
    setSelectedDocumentId(documentId);
  }, []);

  /**
   * Get the currently selected document
   */
  const getSelectedDocument = useCallback(() => {
    if (!selectedDocumentId) return null;
    return documents.find(doc => doc.id === selectedDocumentId) || null;
  }, [documents, selectedDocumentId]);

  // Load documents on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && staffId) {
      fetchDocuments();
    }
  }, [autoLoad, fetchDocuments, staffId]);

  return {
    documents,
    loading,
    error,
    selectedDocumentId,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getDocumentsByType,
    selectDocument,
    getSelectedDocument,
  };
} 