import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedShopsTable } from './EnhancedShopsTable';
import { Shop } from '../types/shops.types';

// Mock the useStaff hook
jest.mock('@/features/staff/hooks/useStaff', () => ({
  useStaff: () => ({
    items: [],
    loading: false,
    error: null,
  }),
}));

// Sample shop data for testing
const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Downtown Store',
    code: 'DT001',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    phone: '555-1234',
    email: 'downtown@example.com',
    status: 'active',
    type: 'retail',
    lastSync: new Date('2023-01-15'),
    isHeadOffice: true,
    timezone: 'America/New_York',
    salesLastMonth: 45000,
    staffMembers: [
      { id: '101', name: 'John Doe', position: 'Manager', email: 'john@example.com' },
      { id: '102', name: 'Jane Smith', position: 'Assistant', email: 'jane@example.com' },
    ],
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Uptown Outlet',
    code: 'UT002',
    address: {
      street: '456 Broadway',
      city: 'Chicago',
      state: 'IL',
      postalCode: '60601',
      country: 'USA',
    },
    phone: '555-5678',
    email: 'uptown@example.com',
    status: 'inactive',
    type: 'outlet',
    lastSync: new Date('2023-01-10'),
    isHeadOffice: false,
    timezone: 'America/Chicago',
    salesLastMonth: 32000,
    staffMembers: [],
    createdAt: new Date('2022-02-01'),
    updatedAt: new Date('2023-01-05'),
  },
];

describe('EnhancedShopsTable', () => {
  test('renders table with shop data', () => {
    render(<EnhancedShopsTable shops={mockShops} />);
    
    // Check if shop names are rendered
    expect(screen.getByText('Downtown Store')).toBeInTheDocument();
    expect(screen.getByText('Uptown Outlet')).toBeInTheDocument();
    
    // Check if statuses are rendered
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
    
    // Check if sales data is rendered
    expect(screen.getByText('$45,000')).toBeInTheDocument();
    expect(screen.getByText('$32,000')).toBeInTheDocument();
  });
  
  test('handles row selection', async () => {
    const handleRowSelectionChange = jest.fn();
    
    render(
      <EnhancedShopsTable 
        shops={mockShops} 
        onRowSelectionChange={handleRowSelectionChange} 
      />
    );
    
    // Find and click the checkbox for the first row
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First row checkbox (index 0 is the "select all" checkbox)
    
    // Check if selection callback was called with the correct data
    await waitFor(() => {
      expect(handleRowSelectionChange).toHaveBeenCalledWith([mockShops[0]]);
    });
  });
  
  test('handles row click', () => {
    const handleRowClick = jest.fn();
    
    render(
      <EnhancedShopsTable 
        shops={mockShops} 
        onRowClick={handleRowClick} 
      />
    );
    
    // Find and click the first row
    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[1]); // First data row (index 0 is header)
    
    // Check if click callback was called with the correct data
    expect(handleRowClick).toHaveBeenCalledWith(mockShops[0]);
  });
  
  test('handles row double click', () => {
    const handleRowDoubleClick = jest.fn();
    
    render(
      <EnhancedShopsTable 
        shops={mockShops} 
        onRowDoubleClick={handleRowDoubleClick} 
      />
    );
    
    // Find and double click the first row
    const rows = screen.getAllByRole('row');
    fireEvent.doubleClick(rows[1]); // First data row (index 0 is header)
    
    // Check if double click callback was called with the correct data
    expect(handleRowDoubleClick).toHaveBeenCalledWith(mockShops[0]);
  });
  
  test('handles settings click', () => {
    const handleSettingsClick = jest.fn();
    
    render(
      <EnhancedShopsTable 
        shops={mockShops} 
        onSettingsClick={handleSettingsClick} 
      />
    );
    
    // Find and click the settings button for the first row
    const settingsButtons = screen.getAllByText('Settings');
    fireEvent.click(settingsButtons[0]);
    
    // Check if settings callback was called with the correct data
    expect(handleSettingsClick).toHaveBeenCalledWith(mockShops[0]);
  });
  
  test('displays loading state', () => {
    render(
      <EnhancedShopsTable 
        shops={[]} 
        isLoading={true} 
      />
    );
    
    expect(screen.getByText('Loading shops...')).toBeInTheDocument();
  });
  
  test('displays empty state', () => {
    render(
      <EnhancedShopsTable 
        shops={[]} 
        isLoading={false} 
      />
    );
    
    expect(screen.getByText('No shops found')).toBeInTheDocument();
  });
  
  test('enables search functionality', () => {
    render(<EnhancedShopsTable shops={mockShops} />);
    
    // Find search input
    const searchInput = screen.getByPlaceholderText('Search shops...');
    
    // Search for "Downtown"
    fireEvent.change(searchInput, { target: { value: 'Downtown' } });
    
    // Check if only Downtown Store is displayed
    expect(screen.getByText('Downtown Store')).toBeInTheDocument();
    expect(screen.queryByText('Uptown Outlet')).not.toBeInTheDocument();
  });
});
