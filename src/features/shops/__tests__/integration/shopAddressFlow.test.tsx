/**
 * Shop Address Flow Integration Tests
 *
 * Tests the full flow of creating, viewing, and updating a shop with the new address structure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShopDetailsPage } from '../../pages/ShopDetailsPage';

// Create mock shop data
const mockShop = {
  id: 'new-shop-id',
  name: 'Integration Test Shop',
  code: 'INT01',
  description: 'Integration test shop description',
  address: {
    street: '123 Integration Street',
    street2: 'Suite 100',
    city: 'Integration City',
    state: 'IC',
    postalCode: '12345',
    country: 'Integration Country',
  },
  phone: '123-456-7890',
  email: 'integration@example.com',
  status: 'ACTIVE',
  type: 'RETAIL',
  isHeadOffice: false,
  timezone: 'UTC',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  inventoryCount: 0,
  staffCount: 0,
};

const mockCreateShop = vi.fn().mockResolvedValue(mockShop);
const mockUpdateShop = vi.fn();
const mockFetchShop = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ shopId: 'new-shop-id' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock the RealShopContext
vi.mock('../../context/RealShopContext', () => ({
  useRealShopContext: vi.fn().mockReturnValue({
    shop: mockShop,
    createShop: mockCreateShop,
    updateShop: mockUpdateShop,
    fetchShop: mockFetchShop,
    isLoading: false,
    error: null,
  }),
}));

// Import the context after mocking
import { useRealShopContext } from '../../context/RealShopContext';

describe('Shop Address Flow Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset to default mock for each test
    vi.mocked(useRealShopContext).mockReturnValue({
      shop: mockShop,
      createShop: mockCreateShop,
      updateShop: mockUpdateShop,
      fetchShop: mockFetchShop,
      isLoading: false,
      error: null,
    });
  });

  describe('Viewing a shop with address', () => {
    it('should display the shop address correctly', async () => {
      // Arrange & Act
      render(<ShopDetailsPage />);

      // Assert
      await waitFor(() => {
        // Look for text content that contains the address parts
        const streetElements = screen.getAllByText(/123 Integration Street/i);
        expect(streetElements.length).toBeGreaterThan(0);

        const cityElements = screen.getAllByText(/Integration City/i);
        expect(cityElements.length).toBeGreaterThan(0);

        const countryElements = screen.getAllByText(/Integration Country/i);
        expect(countryElements.length).toBeGreaterThan(0);
      });
    });
  });
});
