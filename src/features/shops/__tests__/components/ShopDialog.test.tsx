/**
 * Shop Dialog Tests
 * 
 * Tests for the ShopDialog component, focusing on address handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customRender, screen, userEvent, waitFor } from '@/test/utils';
import { ShopDialog } from '../../components/ShopDialog';
import { SHOP_STATUS, SHOP_TYPE } from '../../types';

// Mock the RealShopContext
vi.mock('../../context/RealShopContext', () => ({
  useRealShopContext: () => ({
    createShop: vi.fn().mockResolvedValue({
      id: 'new-shop-id',
      name: 'Test Shop',
      code: 'TEST01',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'Test Country',
      },
    }),
    updateShop: vi.fn().mockImplementation((id, data) => 
      Promise.resolve({
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      })
    ),
    isLoading: false,
    error: null,
  }),
}));

// Mock the staff hook
vi.mock('@/features/staff/hooks/useStaff', () => ({
  useStaff: () => ({
    items: [],
    loading: false,
  }),
}));

describe('ShopDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Create Mode', () => {
    it('should render address fields correctly', async () => {
      // Arrange & Act
      customRender(
        <ShopDialog
          open={true}
          mode="create"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Assert
      expect(screen.getByLabelText(/Street Address\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Street Address 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State\/Province\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Postal Code\*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country\*/i)).toBeInTheDocument();
    });

    it('should allow entering address information', async () => {
      // Arrange
      customRender(
        <ShopDialog
          open={true}
          mode="create"
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act - Fill in required fields to get to the address section
      await user.type(screen.getByLabelText(/Shop Name\*/i), 'Test Shop');
      await user.type(screen.getByLabelText(/Shop Code\*/i), 'TEST01');
      
      // Fill in address fields
      await user.type(screen.getByLabelText(/Street Address\*/i), '123 Test Street');
      await user.type(screen.getByLabelText(/Street Address 2/i), 'Suite 100');
      await user.type(screen.getByLabelText(/City\*/i), 'Test City');
      await user.type(screen.getByLabelText(/State\/Province\*/i), 'TS');
      await user.type(screen.getByLabelText(/Postal Code\*/i), '12345');
      await user.clear(screen.getByLabelText(/Country\*/i));
      await user.type(screen.getByLabelText(/Country\*/i), 'Test Country');

      // Assert
      expect(screen.getByLabelText(/Street Address\*/i)).toHaveValue('123 Test Street');
      expect(screen.getByLabelText(/Street Address 2/i)).toHaveValue('Suite 100');
      expect(screen.getByLabelText(/City\*/i)).toHaveValue('Test City');
      expect(screen.getByLabelText(/State\/Province\*/i)).toHaveValue('TS');
      expect(screen.getByLabelText(/Postal Code\*/i)).toHaveValue('12345');
      expect(screen.getByLabelText(/Country\*/i)).toHaveValue('Test Country');
    });
  });

  describe('Edit Mode', () => {
    const mockShop = {
      id: 'shop-1',
      name: 'Existing Shop',
      code: 'EXIST01',
      description: 'Existing shop description',
      address: {
        street: '456 Existing Street',
        street2: 'Floor 2',
        city: 'Existing City',
        state: 'ES',
        postalCode: '54321',
        country: 'Existing Country',
      },
      phone: '987-654-3210',
      email: 'existing@example.com',
      status: SHOP_STATUS.ACTIVE,
      type: SHOP_TYPE.RETAIL,
      isHeadOffice: false,
      timezone: 'UTC',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should populate address fields with existing shop data', async () => {
      // Arrange & Act
      customRender(
        <ShopDialog
          open={true}
          mode="edit"
          shop={mockShop}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByLabelText(/Street Address\*/i)).toHaveValue(mockShop.address.street);
        expect(screen.getByLabelText(/Street Address 2/i)).toHaveValue(mockShop.address.street2);
        expect(screen.getByLabelText(/City\*/i)).toHaveValue(mockShop.address.city);
        expect(screen.getByLabelText(/State\/Province\*/i)).toHaveValue(mockShop.address.state);
        expect(screen.getByLabelText(/Postal Code\*/i)).toHaveValue(mockShop.address.postalCode);
        expect(screen.getByLabelText(/Country\*/i)).toHaveValue(mockShop.address.country);
      });
    });

    it('should allow updating address information', async () => {
      // Arrange
      customRender(
        <ShopDialog
          open={true}
          mode="edit"
          shop={mockShop}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Act - Update address fields
      const streetField = screen.getByLabelText(/Street Address\*/i);
      await user.clear(streetField);
      await user.type(streetField, '789 Updated Street');

      const cityField = screen.getByLabelText(/City\*/i);
      await user.clear(cityField);
      await user.type(cityField, 'Updated City');

      // Assert
      expect(streetField).toHaveValue('789 Updated Street');
      expect(cityField).toHaveValue('Updated City');
    });
  });
});
