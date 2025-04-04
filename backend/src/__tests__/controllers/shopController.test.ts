/**
 * Shop Controller Tests
 *
 * Tests for the shop controller, focusing on address handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { ShopController } from '../../controllers/shopController';
import { shopService } from '../../services/shopService';

// Mock the shop service
vi.mock('../../services/shopService', () => ({
  shopService: {
    getAllShops: vi.fn(),
    getShopById: vi.fn(),
    createShop: vi.fn(),
    updateShop: vi.fn(),
    deleteShop: vi.fn(),
  },
}));

// Mock the response utilities
vi.mock('../../utils/errorHandling', () => ({
  sendSuccessResponse: vi.fn(),
  sendErrorResponse: vi.fn(),
}));

// Mock the mappers
vi.mock('../../types/mappers/shopMappers', () => ({
  mapShopDtoToShop: vi.fn(data => data),
  mapShopToShopInput: vi.fn(data => data),
}));

// Mock the DTOs
vi.mock('../../types/dto/shopDto', () => ({
  transformShopToDto: vi.fn(data => data),
}));

// Mock the validators
vi.mock('../../validators/shopValidators', () => ({
  validateShopAddress: vi.fn(),
}));

describe('ShopController', () => {
  let shopController: ShopController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const { sendSuccessResponse, sendErrorResponse } = require('../../utils/errorHandling');
  const { validateShopAddress } = require('../../validators/shopValidators');

  beforeEach(() => {
    vi.resetAllMocks();
    shopController = new ShopController();
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
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

      mockRequest.body = mockShopData;
      vi.mocked(shopService.createShop).mockResolvedValue(mockCreatedShop);

      // Act
      await shopController.createShop(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(shopService.createShop).toHaveBeenCalledWith(mockShopData);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: 'shop-1',
          name: 'Test Shop',
          address: {
            street: '123 Test Street',
            street2: 'Suite 100',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Test Country',
          },
        }),
        'Shop created successfully',
        201
      );
    });

    it('should validate the address structure', async () => {
      // Arrange
      const mockShopData = {
        name: 'Test Shop',
        code: 'TEST01',
        description: 'Test shop description',
        address: {
          // Missing required fields
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        status: 'ACTIVE',
        type: 'RETAIL',
      };

      mockRequest.body = mockShopData;

      // Mock validation error
      validateShopAddress.mockImplementation(() => {
        throw new Error('Invalid address');
      });

      // Act
      await shopController.createShop(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(validateShopAddress).toHaveBeenCalledWith(mockShopData.address);
      expect(sendErrorResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.stringContaining('Invalid address'),
        400
      );
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

      mockRequest.params = { id: shopId };
      mockRequest.body = mockShopData;
      vi.mocked(shopService.getShopById).mockResolvedValue({ id: shopId, name: 'Test Shop', code: 'TEST01' });
      vi.mocked(shopService.updateShop).mockResolvedValue(mockUpdatedShop);

      // Act
      await shopController.updateShop(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(shopService.updateShop).toHaveBeenCalledWith(shopId, mockShopData);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: shopId,
          address: {
            street: '456 Updated Street',
            street2: 'Floor 2',
            city: 'Updated City',
            state: 'US',
            postalCode: '54321',
            country: 'Updated Country',
          },
        }),
        'Shop updated successfully'
      );
    });
  });

  describe('getShopById', () => {
    it('should return a shop with a structured address', async () => {
      // Arrange
      const shopId = 'shop-1';
      const mockShop = {
        id: shopId,
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
        status: 'ACTIVE',
        type: 'RETAIL',
      };

      mockRequest.params = { id: shopId };
      vi.mocked(shopService.getShopById).mockResolvedValue(mockShop);

      // Act
      await shopController.getShopById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(shopService.getShopById).toHaveBeenCalledWith(shopId);
      expect(sendSuccessResponse).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: shopId,
          address: {
            street: '123 Test Street',
            street2: 'Suite 100',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Test Country',
          },
        })
      );
    });
  });
});
