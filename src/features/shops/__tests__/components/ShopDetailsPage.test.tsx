/**
 * Shop Details Page Tests
 *
 * Tests for the ShopDetailsPage component, focusing on address display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ShopDetailsPage } from '../../pages/ShopDetailsPage';
import { SHOP_STATUS, SHOP_TYPE } from '../../types';

// Create mock context values
const defaultMockShop = {
  id: 'shop-1',
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  inventoryCount: 100,
  staffCount: 5,
};

const mockFetchShop = vi.fn();
const mockUpdateShop = vi.fn();
const mockDeleteShop = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ shopId: 'shop-1' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the RealShopContext
vi.mock('../../context/RealShopContext', () => ({
  useRealShopContext: vi.fn().mockReturnValue({
    shop: defaultMockShop,
    isLoading: false,
    error: null,
    fetchShop: mockFetchShop,
    updateShop: mockUpdateShop,
    deleteShop: mockDeleteShop,
  }),
}));

// Import the context after mocking
import { useRealShopContext } from '../../context/RealShopContext';

describe('ShopDetailsPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset to default mock for each test
    vi.mocked(useRealShopContext).mockReturnValue({
      shop: defaultMockShop,
      isLoading: false,
      error: null,
      fetchShop: mockFetchShop,
      updateShop: mockUpdateShop,
      deleteShop: mockDeleteShop,
    });
  });

  it('should display the shop address correctly', async () => {
    // Arrange & Act
    render(<ShopDetailsPage />);

    // Assert - Wait for the shop data to load
    await waitFor(() => {
      // Look for text content that contains the address parts
      const addressElements = screen.getAllByText(/123 Test Street/i);
      expect(addressElements.length).toBeGreaterThan(0);

      const cityElements = screen.getAllByText(/Test City/i);
      expect(cityElements.length).toBeGreaterThan(0);

      const countryElements = screen.getAllByText(/Test Country/i);
      expect(countryElements.length).toBeGreaterThan(0);
    });
  });

  it('should display shop without street2 correctly', async () => {
    // Arrange - Update the mock to return a shop without street2
    vi.mocked(useRealShopContext).mockReturnValue({
      shop: {
        ...defaultMockShop,
        address: {
          ...defaultMockShop.address,
          street2: '', // Empty street2
        },
      },
      isLoading: false,
      error: null,
      fetchShop: mockFetchShop,
      updateShop: mockUpdateShop,
      deleteShop: mockDeleteShop,
    });

    // Act
    render(<ShopDetailsPage />);

    // Assert
    await waitFor(() => {
      const streetElements = screen.getAllByText(/123 Test Street/i);
      expect(streetElements.length).toBeGreaterThan(0);

      const cityElements = screen.getAllByText(/Test City/i);
      expect(cityElements.length).toBeGreaterThan(0);
    });
  });

  it('should handle missing address gracefully', async () => {
    // Arrange - Update the mock to return a shop without address
    vi.mocked(useRealShopContext).mockReturnValue({
      shop: {
        ...defaultMockShop,
        address: undefined, // No address field
      },
      isLoading: false,
      error: null,
      fetchShop: mockFetchShop,
      updateShop: mockUpdateShop,
      deleteShop: mockDeleteShop,
    });

    // Act
    render(<ShopDetailsPage />);

    // Assert
    await waitFor(() => {
      const noAddressElements = screen.getAllByText(/No address specified/i);
      expect(noAddressElements.length).toBeGreaterThan(0);
    });
  });
});
