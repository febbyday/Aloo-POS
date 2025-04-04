/**
 * Staff Document Types
 * 
 * This file defines types for staff-related documents and file uploads.
 */

import { z } from 'zod';

// Document types enumeration
export const DocumentTypeSchema = z.enum([
  "ID_CARD",
  "PASSPORT",
  "DRIVERS_LICENSE",
  "RESUME",
  "CONTRACT",
  "CERTIFICATE",
  "PERFORMANCE_REVIEW",
  "TRAINING_RECORD",
  "TAX_DOCUMENT",
  "OTHER"
]);

export type DocumentType = z.infer<typeof DocumentTypeSchema>;

// Document status enumeration
export const DocumentStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "EXPIRED"
]);

export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

// Document schema
export const StaffDocumentSchema = z.object({
  id: z.string().cuid(),
  staffId: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: DocumentTypeSchema,
  status: DocumentStatusSchema.default("PENDING"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().int().positive("File size must be positive"),
  fileType: z.string(),
  uploadedAt: z.date(),
  expiresAt: z.date().nullable(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StaffDocument = z.infer<typeof StaffDocumentSchema>;

// Schema for creating a new document
export const CreateDocumentSchema = StaffDocumentSchema.omit({
  id: true,
  fileSize: true,
  fileType: true,
  uploadedAt: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  file: z.instanceof(File, { message: "File is required" }),
});

export type CreateDocument = z.infer<typeof CreateDocumentSchema>;

// Schema for updating a document
export const UpdateDocumentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  type: DocumentTypeSchema.optional(),
  status: DocumentStatusSchema.optional(),
  expiresAt: z.date().nullable().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").nullable().optional(),
});

export type UpdateDocument = z.infer<typeof UpdateDocumentSchema>;

// Allowed file types configuration
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Maximum file size (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 