import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedDataTable } from './enhanced-data-table';
import { Edit, Trash, Eye } from 'lucide-react';

// Mock data for testing
interface TestItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

const testData: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

// Test columns
const testColumns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    enableSorting: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    enableSorting: true,
  },
];

describe('EnhancedDataTable', () => {
  test('renders table with data', () => {
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
      />
    );
    
    // Check if data is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });
  
  test('handles row selection', async () => {
    const handleSelectionChange = jest.fn();
    
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
        enableRowSelection={true}
        onRowSelectionChange={handleSelectionChange}
      />
    );
    
    // Find and click the checkbox for the first row
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // First row checkbox (index 0 is the "select all" checkbox)
    
    // Check if selection callback was called with the correct data
    await waitFor(() => {
      expect(handleSelectionChange).toHaveBeenCalledWith([testData[0]]);
    });
  });
  
  test('handles search functionality', () => {
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
        enableSearch={true}
      />
    );
    
    // Find search input
    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Search for "Jane"
    fireEvent.change(searchInput, { target: { value: 'Jane' } });
    
    // Check if only Jane is displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });
  
  test('handles sorting', async () => {
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
        enableSorting={true}
      />
    );
    
    // Find and click the name column header to sort
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    // Check if sorted correctly (alphabetically)
    const rows = screen.getAllByRole('row');
    const firstRowCells = rows[1].querySelectorAll('td'); // First data row (index 0 is header)
    
    // In alphabetical order, Bob should be first
    expect(firstRowCells[0].textContent).toContain('Bob Johnson');
  });
  
  test('handles pagination', () => {
    // Create more test data to test pagination
    const manyItems = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Person ${i + 1}`,
      email: `person${i + 1}@example.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
    }));
    
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={manyItems}
        enablePagination={true}
        defaultPageSize={10}
      />
    );
    
    // Check if only first 10 items are displayed
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.getByText('Person 10')).toBeInTheDocument();
    expect(screen.queryByText('Person 11')).not.toBeInTheDocument();
    
    // Click next page button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    // Check if next page items are displayed
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument();
    expect(screen.getByText('Person 11')).toBeInTheDocument();
  });
  
  test('handles row actions', () => {
    const handleView = jest.fn();
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();
    
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
        actions={[
          {
            label: 'View',
            icon: Eye,
            onClick: handleView,
          },
          {
            label: 'Edit',
            icon: Edit,
            onClick: handleEdit,
          },
          {
            label: 'Delete',
            icon: Trash,
            onClick: handleDelete,
            variant: 'destructive',
          },
        ]}
      />
    );
    
    // Find and click action buttons for the first row
    const viewButtons = screen.getAllByText('View');
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    fireEvent.click(viewButtons[0]);
    expect(handleView).toHaveBeenCalledWith(testData[0]);
    
    fireEvent.click(editButtons[0]);
    expect(handleEdit).toHaveBeenCalledWith(testData[0]);
    
    fireEvent.click(deleteButtons[0]);
    expect(handleDelete).toHaveBeenCalledWith(testData[0]);
  });
  
  test('displays loading state', () => {
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={[]}
        isLoading={true}
        loadingMessage="Loading test data..."
      />
    );
    
    expect(screen.getByText('Loading test data...')).toBeInTheDocument();
  });
  
  test('displays empty state', () => {
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={[]}
        emptyMessage="No test data available"
      />
    );
    
    expect(screen.getByText('No test data available')).toBeInTheDocument();
  });
  
  test('handles conditional actions', () => {
    const handleActivate = jest.fn();
    const handleDeactivate = jest.fn();
    
    render(
      <EnhancedDataTable
        columns={testColumns}
        data={testData}
        actions={[
          {
            label: 'Activate',
            onClick: handleActivate,
            condition: (item) => item.status === 'inactive',
          },
          {
            label: 'Deactivate',
            onClick: handleDeactivate,
            condition: (item) => item.status === 'active',
          },
        ]}
      />
    );
    
    // Check if actions are conditionally rendered
    const activateButtons = screen.getAllByText('Activate');
    const deactivateButtons = screen.getAllByText('Deactivate');
    
    // Should be 1 activate button (for Jane who is inactive)
    expect(activateButtons.length).toBe(1);
    
    // Should be 2 deactivate buttons (for John and Bob who are active)
    expect(deactivateButtons.length).toBe(2);
  });
});
