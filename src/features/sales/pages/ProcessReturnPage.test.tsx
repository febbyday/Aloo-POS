import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProcessReturnPage } from './ProcessReturnPage';
import { vi } from 'vitest';

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('ProcessReturnPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the process return page with header', () => {
    render(<ProcessReturnPage />);
    
    expect(screen.getByText('Process Return')).toBeInTheDocument();
    expect(screen.getByText('Print Label')).toBeInTheDocument();
    expect(screen.getByText('Process Return')).toBeInTheDocument();
  });

  it('renders the order search section', () => {
    render(<ProcessReturnPage />);
    
    expect(screen.getByLabelText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Customer')).toBeInTheDocument();
    expect(screen.getByLabelText('Order Date')).toBeInTheDocument();
  });

  it('renders the order items table', () => {
    render(<ProcessReturnPage />);
    
    expect(screen.getByText('Order Items')).toBeInTheDocument();
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Returnable')).toBeInTheDocument();
  });

  it('displays mock order data correctly', () => {
    render(<ProcessReturnPage />);
    
    expect(screen.getByText('Blue T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('Black Jeans')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$59.99')).toBeInTheDocument();
  });

  it('allows adding items to return list', async () => {
    render(<ProcessReturnPage />);
    
    const addButtons = screen.getAllByText('Add to Return');
    fireEvent.click(addButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Return Items')).toBeInTheDocument();
    });
  });

  it('prevents adding duplicate items to return list', async () => {
    render(<ProcessReturnPage />);
    
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });
  });

  it('allows removing items from return list', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Find and click the remove button
    const removeButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /trash/i })).not.toBeInTheDocument();
    });
  });

  it('updates return quantity correctly', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Find and update the quantity input
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '2' } });
    
    await waitFor(() => {
      expect(quantityInput).toHaveValue(2);
    });
  });

  it('updates condition correctly', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Open condition select and choose 'Used'
    const conditionSelect = screen.getByRole('combobox');
    fireEvent.click(conditionSelect);
    fireEvent.click(screen.getByText('Used'));
    
    await waitFor(() => {
      expect(screen.getByText('Used')).toBeInTheDocument();
    });
  });

  it('updates return reason correctly', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Find and update the reason input
    const reasonInput = screen.getByPlaceholderText('Enter return reason...');
    fireEvent.change(reasonInput, { target: { value: 'Wrong size' } });
    
    await waitFor(() => {
      expect(reasonInput).toHaveValue('Wrong size');
    });
  });

  it('calculates total refund amount correctly', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Update quantity to 2
    const quantityInput = screen.getByRole('spinbutton');
    fireEvent.change(quantityInput, { target: { value: '2' } });
    
    await waitFor(() => {
      expect(screen.getByText('Total Refund: $59.98')).toBeInTheDocument();
    });
  });

  it('validates return items before processing', async () => {
    render(<ProcessReturnPage />);
    
    // Add an item first
    const addButton = screen.getAllByText('Add to Return')[0];
    fireEvent.click(addButton);
    
    // Try to process without entering a reason
    const processButton = screen.getByText('Process Return');
    fireEvent.click(processButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid Return Items')).toBeInTheDocument();
    });
  });

  it('updates notes correctly', () => {
    render(<ProcessReturnPage />);
    
    const notesTextarea = screen.getByPlaceholderText('Add any additional notes about the return...');
    fireEvent.change(notesTextarea, { target: { value: 'Customer was very polite' } });
    
    expect(notesTextarea).toHaveValue('Customer was very polite');
  });

  it('updates refund method correctly', async () => {
    render(<ProcessReturnPage />);
    
    // Open refund method select and choose 'Store Credit'
    const refundMethodSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(refundMethodSelect);
    fireEvent.click(screen.getByText('Store Credit'));
    
    await waitFor(() => {
      expect(screen.getByText('Store Credit')).toBeInTheDocument();
    });
  });
}); 