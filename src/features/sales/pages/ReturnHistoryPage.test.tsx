import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReturnHistoryPage } from './ReturnHistoryPage';
import { vi } from 'vitest';

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('ReturnHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the return history page with header', () => {
    render(<ReturnHistoryPage />);
    
    expect(screen.getByText('Return History')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders the filters section', () => {
    render(<ReturnHistoryPage />);
    
    expect(screen.getByPlaceholderText('Search returns...')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders the returns table with correct columns', () => {
    render(<ReturnHistoryPage />);
    
    expect(screen.getByText('Return ID')).toBeInTheDocument();
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Total Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Processed')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays mock return data correctly', () => {
    render(<ReturnHistoryPage />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1x Blue T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
  });

  it('filters returns when search input changes', async () => {
    render(<ReturnHistoryPage />);
    
    const searchInput = screen.getByPlaceholderText('Search returns...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('John');
    });
  });

  it('opens action dropdown menu when clicking on more options', async () => {
    render(<ReturnHistoryPage />);
    
    const moreButton = screen.getAllByRole('button')[4]; // The more options button
    fireEvent.click(moreButton);
    
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('View Order')).toBeInTheDocument();
      expect(screen.getByText('Print Return Label')).toBeInTheDocument();
    });
  });

  it('clears filters when clicking clear filters button', async () => {
    render(<ReturnHistoryPage />);
    
    const searchInput = screen.getByPlaceholderText('Search returns...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('displays correct status badge variants', () => {
    render(<ReturnHistoryPage />);
    
    const completedBadge = screen.getByText('Completed');
    const pendingBadge = screen.getByText('Pending');
    
    expect(completedBadge.closest('[class*="badge"]')).toHaveClass('default');
    expect(pendingBadge.closest('[class*="badge"]')).toHaveClass('secondary');
  });

  it('displays correct condition badge variants', () => {
    render(<ReturnHistoryPage />);
    
    const newBadge = screen.getByText('new');
    const damagedBadge = screen.getByText('damaged');
    
    expect(newBadge.closest('[class*="badge"]')).toHaveClass('success');
    expect(damagedBadge.closest('[class*="badge"]')).toHaveClass('destructive');
  });

  it('formats dates correctly', () => {
    render(<ReturnHistoryPage />);
    
    expect(screen.getByText('Mar 1, 2024')).toBeInTheDocument(); // Created date
    expect(screen.getByText('Mar 2, 2024')).toBeInTheDocument(); // Processed date
  });
}); 