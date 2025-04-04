/**
 * Shop Service Tests
 *
 * Tests for the shop service, focusing on address handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shopService } from '../../services/shopService';
import { shopRepository } from '../../repositories/shopRepository';
import { ZodError } from 'zod';

// Mock the shop repository
vi.mock('../../repositories/shopRepository', () => ({
  shopRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the validators
vi.mock('../../validators/shopValidators', () => ({
  validateShopAddress: vi.fn(),
  validateOperatingHours: vi.fn(),
  validateShopSettings: vi.fn(),
}));

// Mock the enhanced shop service
vi.mock('../../services/enhancedShopService', () => ({
  enhancedShopService: {
    createShop: vi.fn(),
    updateShop: vi.fn(),
  },
}));

describe('ShopService', () => {
  const { validateShopAddress } = require('../../validators/shopValidators');

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('createShop', () => {
    it('should create a shop with a structured address', async () => {
      // Arrange
      const mockShopData = {
        name: 'Test Shop',
        code: 'TEST01',
        description: 'Test shop description',
        address: {
          street: '123 Test Street',
          street2: 'Suite 100',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country',
        },
        phone: '123-456-7890',
        email: 'test@example.com',
        status: 'ACTIVE',
        type: 'RETAIL',
      };

      const mockCreatedShop = {
        id: 'shop-1',
        ...mockShopData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(shopRepository.create).mockResolvedValue(mockCreatedShop);

      // Act
      const result = await shopService.createShop(mockShopData);

      // Assert
      expect(validateShopAddress).toHaveBeenCalledWith(mockShopData.address);
      expect(shopRepository.create).toHaveBeenCalledWith(mockShopData);
      expect(result).toEqual(mockCreatedShop);
    });

    it('should throw an error if address validation fails', async () => {
      // Arrange
      const mockShopData = {
        name: 'Test Shop',
        code: 'TEST01',
        description: 'Test shop description',
        address: {
          // Invalid address
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        status: 'ACTIVE',
        type: 'RETAIL',
      };

      // Mock validation error
      const mockZodError = new ZodError([
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Street is required',
          path: ['street'],
        },
      ]);

      vi.mocked(validateShopAddress).mockImplementation(() => {
        throw mockZodError;
      });

      // Act & Assert
      await expect(shopService.createShop(mockShopData)).rejects.toThrow('Validation error');
    });
  });

  describe('updateShop', () => {
    it('should update a shop with a structured address', async () => {
      // Arrange
      const shopId = 'shop-1';
      const mockShopData = {
        address: {
          street: '456 Updated Street',
          street2: 'Floor 2',
          city: 'Updated City',
          state: 'US',
          postalCode: '54321',
          country: 'Updated Country',
        },
      };

      const mockUpdatedShop = {
        id: shopId,
        name: 'Test Shop',
        code: 'TEST01',
        ...mockShopData,
        updatedAt: new Date().toISOString(),
      };

      // Mock findById to return a shop (to avoid 'Shop not found' error)
      vi.mocked(shopRepository.findById).mockResolvedValue({
        id: shopId,
        name: 'Test Shop',
        code: 'TEST01',
      });

      vi.mocked(shopRepository.update).mockResolvedValue(mockUpdatedShop);

      // Act
      const result = await shopService.updateShop(shopId, mockShopData);

      // Assert
      expect(validateShopAddress).toHaveBeenCalledWith(mockShopData.address);
      expect(shopRepository.update).toHaveBeenCalledWith(shopId, mockShopData);
      expect(result).toEqual(mockUpdatedShop);
    });
  });
});
