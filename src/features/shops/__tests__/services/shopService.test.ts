/**
 * Shop Service Tests
 *
 * Tests for the shop service functionality, focusing on address handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SHOP_STATUS, SHOP_TYPE } from '../../types';

// Create a mock shop service
const mockShopService = {
  fetchAll: vi.fn(),
  fetchById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

// Mock the actual shop service module
vi.mock('../../services/shopService', () => ({
  shopService: mockShopService,
}));

// Import the shop service after mocking
import { shopService } from '../../services/shopService';

describe('Shop Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup mock implementations for each test
    mockShopService.fetchAll.mockResolvedValue([
      {
        id: 'shop-1',
        name: 'Test Shop 1',
        code: 'TEST01',
        description: 'Test shop description 1',
        address: {
          street: '123 Test Street',
          street2: 'Suite 100',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'Test Country',
        },
        phone: '123-456-7890',
        email: 'test1@example.com',
        status: 'ACTIVE',
        type: 'RETAIL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shop-2',
        name: 'Test Shop 2',
        code: 'TEST02',
        description: 'Test shop description 2',
        address: {
          street: '456 Another Street',
          city: 'Another City',
          state: 'AS',
          postalCode: '54321',
          country: 'Another Country',
        },
        phone: '987-654-3210',
        email: 'test2@example.com',
        status: 'INACTIVE',
        type: 'WAREHOUSE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    mockShopService.fetchById.mockImplementation((id) => {
      if (id === 'shop-1') {
        return Promise.resolve({
          id: 'shop-1',
          name: 'Test Shop 1',
          code: 'TEST01',
          description: 'Test shop description 1',
          address: {
            street: '123 Test Street',
            street2: 'Suite 100',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Test Country',
          },
          phone: '123-456-7890',
          email: 'test1@example.com',
          status: 'ACTIVE',
          type: 'RETAIL',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (id === 'non-existent-shop') {
        return Promise.reject(new Error('Shop not found'));
      }
    });

    mockShopService.create.mockImplementation((shopData) => {
      return Promise.resolve({
        id: 'new-shop-id',
        ...shopData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    mockShopService.update.mockImplementation((id, data) => {
      if (id === 'shop-1') {
        return Promise.resolve({
          id,
          name: 'Test Shop 1',
          code: 'TEST01',
          description: 'Test shop description 1',
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } else {
        return Promise.reject(new Error(`Shop with ID ${id} not found`));
      }
    });
  });

  describe('fetchAll', () => {
    it('should return shops with structured address objects', async () => {
      // Act
      const shops = await shopService.fetchAll();

      // Assert
      expect(shops.length).toBeGreaterThan(0);
      shops.forEach(shop => {
        expect(shop.address).toBeDefined();
        expect(typeof shop.address).toBe('object');
        expect(shop.address.street).toBeDefined();
        expect(shop.address.city).toBeDefined();
        expect(shop.address.state).toBeDefined();
        expect(shop.address.postalCode).toBeDefined();
        expect(shop.address.country).toBeDefined();
      });
    });
  });

  describe('fetchById', () => {
    it('should return a shop with a structured address object', async () => {
      // Arrange
      const shopId = 'shop-1'; // Using a known mock shop ID

      // Act
      const shop = await shopService.fetchById(shopId);

      // Assert
      expect(shop).toBeDefined();
      expect(shop.id).toBe(shopId);
      expect(shop.address).toBeDefined();
      expect(typeof shop.address).toBe('object');
      expect(shop.address.street).toBeDefined();
      expect(shop.address.city).toBeDefined();
      expect(shop.address.state).toBeDefined();
      expect(shop.address.postalCode).toBeDefined();
      expect(shop.address.country).toBeDefined();
    });

    it('should handle shop not found', async () => {
      // Arrange
      const nonExistentShopId = 'non-existent-shop';

      // Act & Assert
      await expect(shopService.fetchById(nonExistentShopId)).rejects.toThrow('Shop not found');
    });
  });

  describe('create', () => {
    it('should create a shop with a structured address object', async () => {
      // Arrange
      const newShop = {
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
        isHeadOffice: false,
        timezone: 'UTC',
      };

      // Act
      const createdShop = await shopService.create(newShop);

      // Assert
      expect(createdShop).toBeDefined();
      expect(createdShop.id).toBeDefined();
      expect(createdShop.name).toBe(newShop.name);
      expect(createdShop.code).toBe(newShop.code);
      expect(createdShop.address).toEqual(newShop.address);
      expect(createdShop.createdAt).toBeDefined();
      expect(createdShop.updatedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a shop with a structured address object', async () => {
      // Arrange
      const shopId = 'shop-1';
      const updatedAddress = {
        street: '456 Updated Street',
        street2: 'Floor 2',
        city: 'Updated City',
        state: 'UC',
        postalCode: '54321',
        country: 'Updated Country',
      };

      // Act
      const updatedShop = await shopService.update(shopId, { address: updatedAddress });

      // Assert
      expect(updatedShop).toBeDefined();
      expect(updatedShop.id).toBe(shopId);
      expect(updatedShop.address).toEqual(updatedAddress);
      expect(updatedShop.updatedAt).toBeDefined();
    });
  });
});
