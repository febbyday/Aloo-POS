/**
 * Shop Service Tests
 * 
 * Tests for the shop service using the enhanced API client and endpoint registry.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shopService } from '../shop-service';
import { enhancedApiClient } from '../../enhanced-api-client';
import { ApiError, ApiErrorType } from '../../error-handler';
import { SHOP_STATUS } from '../../../../../shared/schemas/shopSchema';

// Mock the enhanced API client
vi.mock('../../enhanced-api-client', () => ({
  enhancedApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('ShopService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getShopById', () => {
    it('should return shop details when API call succeeds', async () => {
      // Arrange
      const mockShop = {
        id: 'shop1',
        name: 'Test Shop',
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        status: SHOP_STATUS.ACTIVE,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };
      
      vi.mocked(enhancedApiClient.get).mockResolvedValueOnce(mockShop);
      
      // Act
      const result = await shopService.getShopById('shop1');
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'shops/DETAIL',
        { id: 'shop1' },
        expect.objectContaining({ 
          params: { include: '' },
          cache: 'default' 
        })
      );
      expect(result).toEqual(mockShop);
    });
    
    it('should return fallback shop when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Network error', {
        type: ApiErrorType.NETWORK,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.get).mockRejectedValueOnce(mockError);
      
      // Act
      const result = await shopService.getShopById('shop1');
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'shops/DETAIL',
        { id: 'shop1' },
        expect.objectContaining({ 
          params: { include: '' },
          cache: 'default' 
        })
      );
      expect(result).toHaveProperty('id', 'shop1');
      expect(result).toHaveProperty('name', 'Unknown Shop');
      expect(result).toHaveProperty('status', SHOP_STATUS.INACTIVE);
    });
    
    it('should include inventory and staff when requested', async () => {
      // Arrange
      const mockShop = {
        id: 'shop1',
        name: 'Test Shop',
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        },
        status: SHOP_STATUS.ACTIVE,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      };
      
      const mockInventory = [
        { id: 'inv1', productId: 'prod1', quantity: 10, shopId: 'shop1' }
      ];
      
      const mockStaff = [
        { id: 'staff1', staffId: 'user1', role: 'Manager', shopId: 'shop1' }
      ];
      
      vi.mocked(enhancedApiClient.get)
        .mockResolvedValueOnce(mockShop)
        .mockResolvedValueOnce(mockInventory)
        .mockResolvedValueOnce(mockStaff);
      
      // Act
      const result = await shopService.getShopById('shop1', true, true);
      
      // Assert
      expect(enhancedApiClient.get).toHaveBeenCalledWith(
        'shops/DETAIL',
        { id: 'shop1' },
        expect.objectContaining({ 
          params: { include: 'inventory,staff' },
          cache: 'default' 
        })
      );
      expect(result).toEqual({
        ...mockShop,
        inventory: mockInventory,
        staffAssignments: mockStaff
      });
    });
  });
  
  describe('updateShopStatus', () => {
    it('should update shop status when API call succeeds', async () => {
      // Arrange
      const mockShop = {
        id: 'shop1',
        name: 'Test Shop',
        status: SHOP_STATUS.INACTIVE
      };
      
      vi.mocked(enhancedApiClient.patch).mockResolvedValueOnce(mockShop);
      
      // Act
      const result = await shopService.updateShopStatus('shop1', SHOP_STATUS.INACTIVE);
      
      // Assert
      expect(enhancedApiClient.patch).toHaveBeenCalledWith(
        'shops/DETAIL',
        { status: SHOP_STATUS.INACTIVE },
        { id: 'shop1' }
      );
      expect(result).toEqual(mockShop);
    });
    
    it('should throw an error when API call fails', async () => {
      // Arrange
      const mockError = new ApiError('Server error', {
        type: ApiErrorType.SERVER,
        retryable: true
      });
      
      vi.mocked(enhancedApiClient.patch).mockRejectedValueOnce(mockError);
      
      // Act & Assert
      await expect(shopService.updateShopStatus('shop1', SHOP_STATUS.INACTIVE))
        .rejects.toThrow(ApiError);
    });
  });
});
