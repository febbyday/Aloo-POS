/**
 * Loyalty Service Tests
 * 
 * Tests for the loyalty service using the enhanced API client and endpoint registry.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loyaltyService } from '../loyalty-service';
import { enhancedApiClient } from '../../enhanced-api-client';
import { ApiError, ApiErrorType } from '../../error-handler';

// Mock the enhanced API client
vi.mock('../../enhanced-api-client', () => ({
  enhancedApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('LoyaltyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getSettings', () => {
    it('should return loyalty settings when API call succeeds', async () => {
      // Arrange
      const mockSettings = {
        pointsPerDollar: 2,
        pointValueInCents: 1,
        minimumRedemption: 100,
        expiryPeriodInDays: 365,
        welcomeBonus: 100,
        referralBonus: 50,
        birthdayBonus: 200,
        isEnabled: true,
        termsAndConditions: "Test terms and conditions"
      };
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockSettings);
      
      // Act
      const result = await loyaltyService.getSettings();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'loyalty/SETTINGS',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result).toEqual(mockSettings);
    });
    
    it('should return fallback settings when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Network error', {
        type: ApiErrorType.NETWORK,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act
      const result = await loyaltyService.getSettings();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'loyalty/SETTINGS',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result).toEqual(expect.objectContaining({
        pointsPerDollar: 1,
        isEnabled: true
      }));
    });
  });
  
  describe('getTiers', () => {
    it('should return loyalty tiers when API call succeeds', async () => {
      // Arrange
      const mockTiers = [
        {
          id: 'bronze',
          name: 'Bronze',
          minimumPoints: 0,
          benefits: { discount: 0 }
        },
        {
          id: 'silver',
          name: 'Silver',
          minimumPoints: 1000,
          benefits: { discount: 5 }
        }
      ];
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockTiers);
      
      // Act
      const result = await loyaltyService.getTiers();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'loyalty/TIERS',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result.data).toEqual(mockTiers);
    });
    
    it('should return fallback tiers when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Server error', {
        type: ApiErrorType.SERVER,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act
      const result = await loyaltyService.getTiers();
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'loyalty/TIERS',
        undefined,
        expect.objectContaining({ cache: 'default' })
      );
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('name');
    });
  });
  
  describe('createTier', () => {
    it('should create a loyalty tier when API call succeeds', async () => {
      // Arrange
      const mockTier = {
        name: 'Platinum',
        minimumPoints: 10000,
        benefits: { discount: 15 }
      };
      
      const mockResponse = {
        id: 'platinum',
        ...mockTier
      };
      
      vi.mocked(enhancedApiClient.post).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await loyaltyService.createTier(mockTier);
      
      // Assert
      expect(enhancedApiClient.post).toHaveBeenCalledWith(
        'loyalty/TIERS',
        mockTier
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockTier = {
        name: 'Platinum',
        minimumPoints: 10000,
        benefits: { discount: 15 }
      };
      
      const mockError = new ApiError('Validation error', {
        type: ApiErrorType.VALIDATION,
        retryable: false
      });
      
      vi.mocked(enhancedApiClient.post).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(loyaltyService.createTier(mockTier)).rejects.toThrow(ApiError);
    });
  });
  
  describe('updateSettings', () => {
    it('should update loyalty settings when API call succeeds', async () => {
      // Arrange
      const mockSettings = {
        pointsPerDollar: 3,
        isEnabled: true
      };
      
      const mockResponse = {
        pointsPerDollar: 3,
        pointValueInCents: 1,
        minimumRedemption: 100,
        expiryPeriodInDays: 365,
        welcomeBonus: 100,
        referralBonus: 50,
        birthdayBonus: 200,
        isEnabled: true,
        termsAndConditions: "Test terms and conditions"
      };
      
      vi.mocked(enhancedApiClient.put).mockResolvedValueOnce(mockResponse);
      
      // Act
      const result = await loyaltyService.updateSettings(mockSettings);
      
      // Assert
      expect(enhancedApiClient.put).toHaveBeenCalledWith(
        'loyalty/UPDATE_SETTINGS',
        mockSettings
      );
      expect(result).toEqual(mockResponse);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockSettings = {
        pointsPerDollar: 3,
        isEnabled: true
      };
      
      const mockError = new ApiError('Server error', {
        type: ApiErrorType.SERVER,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.put).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(loyaltyService.updateSettings(mockSettings)).rejects.toThrow(ApiError);
    });
  });
});
