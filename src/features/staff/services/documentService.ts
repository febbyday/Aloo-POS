/**
 * Staff Document Service
 * Handles document operations for staff members with file upload capabilities
 */

import { getApiEndpoint } from '@/lib/api/config';
import { apiClient } from '@/lib/api/api-client';
import { 
  StaffDocument,
  CreateDocument,
  UpdateDocument,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} from '../types/document';

// API URL for staff document data
const API_BASE_URL = getApiEndpoint('staff-documents');

// Mock data for documents
const mockDocuments: StaffDocument[] = [
  {
    id: 'doc1',
    staffId: '1',
    name: 'Employee Contract',
    type: 'CONTRACT',
    status: 'APPROVED',
    fileUrl: 'https://example.com/documents/contract-1.pdf',
    fileSize: 1024 * 1024, // 1MB
    fileType: 'application/pdf',
    uploadedAt: new Date('2023-01-15'),
    expiresAt: new Date('2025-01-15'),
    notes: 'Standard employee contract',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: 'doc2',
    staffId: '1',
    name: 'ID Card',
    type: 'ID_CARD',
    status: 'APPROVED',
    fileUrl: 'https://example.com/documents/id-1.jpg',
    fileSize: 500 * 1024, // 500KB
    fileType: 'image/jpeg',
    uploadedAt: new Date('2023-01-15'),
    expiresAt: new Date('2027-01-15'),
    notes: 'National ID card',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
];

// Configure whether to use mock data by default
let useMockData = true; // Set to true since the backend is not ready

/**
 * Validates a file based on type and size restrictions
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.all.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported'
    };
  }

  return { valid: true };
};

/**
 * Staff Document Service
 * Provides methods to interact with staff documents
 */
export const documentService = {
  /**
   * Returns whether the service is currently using mock data
   */
  isUsingMockData(): boolean {
    return useMockData;
  },

  /**
   * Fetches all documents for a staff member
   * @param staffId Staff member ID
   * @returns Promise with array of documents
   */
  async fetchAll(staffId: string): Promise<StaffDocument[]> {
    if (useMockData) {
      return Promise.resolve(mockDocuments.filter(doc => doc.staffId === staffId));
    }

    try {
      const response = await apiClient.get<StaffDocument[]>(`${API_BASE_URL}?staffId=${staffId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch documents');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      useMockData = true;
      return Promise.resolve(mockDocuments.filter(doc => doc.staffId === staffId));
    }
  },

  /**
   * Gets a single document by ID
   * @param documentId Document ID
   * @returns Promise with the document details
   */
  async fetchById(documentId: string): Promise<StaffDocument> {
    if (useMockData) {
      const document = mockDocuments.find(d => d.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      return Promise.resolve(document);
    }

    try {
      const response = await apiClient.get<StaffDocument>(`${API_BASE_URL}/${documentId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch document');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      useMockData = true;
      const document = mockDocuments.find(d => d.id === documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      return Promise.resolve(document);
    }
  },

  /**
   * Uploads a new document for a staff member
   * @param data Document data including file
   * @returns Promise with the created document
   */
  async upload(data: CreateDocument): Promise<StaffDocument> {
    // Validate file
    const validation = validateFile(data.file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (useMockData) {
      // Create mock document
      const newDocument: StaffDocument = {
        id: `doc${mockDocuments.length + 1}`,
        staffId: data.staffId,
        name: data.name,
        type: data.type,
        status: data.status || 'PENDING',
        fileUrl: URL.createObjectURL(data.file),
        fileSize: data.file.size,
        fileType: data.file.type,
        uploadedAt: new Date(),
        expiresAt: data.expiresAt || null,
        notes: data.notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDocuments.push(newDocument);
      return Promise.resolve(newDocument);
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('staffId', data.staffId);
      formData.append('name', data.name);
      formData.append('type', data.type);
      if (data.status) formData.append('status', data.status);
      if (data.expiresAt) formData.append('expiresAt', data.expiresAt.toISOString());
      if (data.notes) formData.append('notes', data.notes);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  /**
   * Updates a document's metadata
   * @param documentId Document ID
   * @param data Update data
   * @returns Promise with the updated document
   */
  async update(documentId: string, data: UpdateDocument): Promise<StaffDocument> {
    if (useMockData) {
      const index = mockDocuments.findIndex(d => d.id === documentId);
      if (index === -1) {
        throw new Error('Document not found');
      }

      // Get the current document
      const currentDoc = mockDocuments[index];
      if (!currentDoc) {
        throw new Error('Document not found');
      }

      // Update the mock document
      const updatedDocument: StaffDocument = {
        id: currentDoc.id,
        staffId: currentDoc.staffId,
        name: data.name || currentDoc.name,
        type: data.type || currentDoc.type,
        status: data.status || currentDoc.status,
        fileUrl: currentDoc.fileUrl,
        fileSize: currentDoc.fileSize,
        fileType: currentDoc.fileType,
        uploadedAt: currentDoc.uploadedAt,
        expiresAt: data.expiresAt !== undefined ? data.expiresAt : currentDoc.expiresAt,
        notes: data.notes !== undefined ? data.notes : currentDoc.notes,
        createdAt: currentDoc.createdAt,
        updatedAt: new Date(),
      };

      mockDocuments[index] = updatedDocument;
      return Promise.resolve(updatedDocument);
    }

    try {
      const response = await apiClient.patch<StaffDocument>(`${API_BASE_URL}/${documentId}`, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update document');
      }
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  /**
   * Deletes a document
   * @param documentId Document ID
   * @returns Promise indicating success
   */
  async delete(documentId: string): Promise<void> {
    if (useMockData) {
      const index = mockDocuments.findIndex(d => d.id === documentId);
      if (index === -1) {
        throw new Error('Document not found');
      }

      mockDocuments.splice(index, 1);
      return Promise.resolve();
    }

    try {
      const response = await apiClient.delete<void>(`${API_BASE_URL}/${documentId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Downloads a document
   * @param documentId Document ID
   * @returns Promise with the document data as a blob
   */
  async download(documentId: string): Promise<Blob> {
    if (useMockData) {
      // For mock data, generate a placeholder PDF
      const placeholderText = 'This is a mock document for testing purposes.';
      return new Blob([placeholderText], { type: 'text/plain' });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${documentId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },
}; 