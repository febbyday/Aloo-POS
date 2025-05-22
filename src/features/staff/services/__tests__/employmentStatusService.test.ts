/**
 * Employment Status Service Tests
 * 
 * Tests for the employment status service using the enhanced API client and endpoint registry.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { employmentStatusService } from '../employmentStatusService';
import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import { ApiError, ApiErrorType } from '@/lib/api/error-handler';

// Mock the enhanced API client
vi.mock('@/lib/api/enhanced-api-client', () => ({
  enhancedApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('EmploymentStatusService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllStatuses', () => {
    it('should return employment statuses when API call succeeds', async () => {
      // Arrange
      const mockStatuses = [
        { id: '1', name: 'Full-time', description: 'Full-time employee' },
        { id: '2', name: 'Part-time', description: 'Part-time employee' }
      ];
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockStatuses);
      
      // Act
      const result = await employmentStatusService.getAllStatuses();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'employment/STATUSES',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result).toEqual(mockStatuses);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Network error', {
        type: ApiErrorType.NETWORK,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(employmentStatusService.getAllStatuses()).rejects.toThrow(ApiError);
    });
  });
  
  describe('getStatusById', () => {
    it('should return employment status when API call succeeds', async () => {
      // Arrange
      const mockStatus = { id: '1', name: 'Full-time', description: 'Full-time employee' };
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockStatus);
      
      // Act
      const result = await employmentStatusService.getStatusById('1');
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'employment/STATUSES',
        { id: '1' },
        expect.objectContaining({ cache: 'default' })
      );
      expect(result).toEqual(mockStatus);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Not found', {
        type: ApiErrorType.NOT_FOUND,
        retryable: false
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(employmentStatusService.getStatusById('999')).rejects.toThrow(ApiError);
    });
  });
  
  describe('createStatus', () => {
    it('should create employment status when API call succeeds', async () => {
      // Arrange
      const newStatus = { name: 'Contract', description: 'Contract employee' };
      const mockResponse = { id: '3', ...newStatus };
      
      vi.mocked(enhancedApiClient.post).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await employmentStatusService.createStatus(newStatus);
      
      // Assert
      expect(enhancedApiClient.post).toHaveBeenCalledWith(
        'employment/STATUSES',
        newStatus
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const newStatus = { name: 'Contract', description: 'Contract employee' };
      const mockError = new ApiError('Validation error', {
        type: ApiErrorType.VALIDATION,
        retryable: false
      });
      
      vi.mocked(enhancedApiClient.post).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(employmentStatusService.createStatus(newStatus)).rejects.toThrow(ApiError);
    });
  });
});
