/**
 * Shops Page Tests
 *
 * Tests for the ShopsPage component, focusing on address display in shop cards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ShopsPage } from '../../pages/ShopsPage';
import { SHOP_STATUS, SHOP_TYPE, Shop } from '../../types';

// Create test shop data
const testShops = [
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
    status: SHOP_STATUS.ACTIVE,
    type: SHOP_TYPE.RETAIL,
    isHeadOffice: false,
    timezone: 'America/New_York',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastSync: '2023-01-01T00:00:00Z',
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
    status: SHOP_STATUS.INACTIVE,
    type: SHOP_TYPE.WAREHOUSE,
    isHeadOffice: false,
    timezone: 'America/Chicago',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastSync: '2023-01-01T00:00:00Z',
  },
] as Shop[];

const mockFetchShops = vi.fn();
const mockDeleteShop = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

// Mock the RealShopContext
vi.mock('../../context/RealShopContext', () => ({
  useRealShopContext: vi.fn().mockReturnValue({
    shops: testShops,
    isLoading: false,
    error: null,
    fetchShops: mockFetchShops,
    deleteShop: mockDeleteShop,
  }),
}));

// Import the context after mocking
import { useRealShopContext } from '../../context/RealShopContext';

describe('ShopsPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset to default mock for each test
    vi.mocked(useRealShopContext).mockReturnValue({
      shops: testShops,
      isLoading: false,
      error: null,
      fetchShops: mockFetchShops,
      deleteShop: mockDeleteShop,
    });
  });

  it('should display shop addresses correctly in shop cards', async () => {
    // Arrange & Act
    render(<ShopsPage />);

    // Assert
    await waitFor(() => {
      // First shop address - use regex to match partial text
      const firstShopAddressElements = screen.getAllByText(/123 Test Street/i);
      expect(firstShopAddressElements.length).toBeGreaterThan(0);

      // Second shop address
      const secondShopAddressElements = screen.getAllByText(/456 Another Street/i);
      expect(secondShopAddressElements.length).toBeGreaterThan(0);
    });
  });

  it('should display shop contact information correctly', async () => {
    // Arrange & Act
    render(<ShopsPage />);

    // Assert
    await waitFor(() => {
      // First shop contact info
      expect(screen.getByText('123-456-7890')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();

      // Second shop contact info
      expect(screen.getByText('987-654-3210')).toBeInTheDocument();
      expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    });
  });

  it('should display shop status correctly', async () => {
    // Arrange & Act
    render(<ShopsPage />);

    // Assert
    await waitFor(() => {
      // First shop status (Active) - case sensitive
      expect(screen.getByText('Active')).toBeInTheDocument();

      // Second shop status (Inactive) - case sensitive
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });
});
