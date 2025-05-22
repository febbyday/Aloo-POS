import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RefundManagementPage } from './RefundManagementPage';
import { vi } from 'vitest';

// Mock the toast component
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('RefundManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the refund management page with header', () => {
    render(<RefundManagementPage />);
    
    expect(screen.getByText('Refund Management')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('New Refund')).toBeInTheDocument();
  });

  it('renders the filters section', () => {
    render(<RefundManagementPage />);
    
    expect(screen.getByPlaceholderText('Search refunds...')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders the refunds table with correct columns', () => {
    render(<RefundManagementPage />);
    
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Order ID')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Reason')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays mock refund data correctly', () => {
    render(<RefundManagementPage />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('Item damaged during shipping')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('filters refunds when search input changes', async () => {
    render(<RefundManagementPage />);
    
    const searchInput = screen.getByPlaceholderText('Search refunds...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('John');
    });
  });

  it('opens action dropdown menu when clicking on more options', async () => {
    render(<RefundManagementPage />);
    
    const moreButton = screen.getAllByRole('button')[4]; // The more options button
    fireEvent.click(moreButton);
    
    await waitFor(() => {
      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('Reject')).toBeInTheDocument();
      expect(screen.getByText('Mark as Completed')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('View Order')).toBeInTheDocument();
    });
  });

  it('clears filters when clicking clear filters button', async () => {
    render(<RefundManagementPage />);
    
    const searchInput = screen.getByPlaceholderText('Search refunds...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('');
    });
  });

  it('displays correct status badge variants', () => {
    render(<RefundManagementPage />);
    
    const pendingBadge = screen.getByText('Pending');
    const approvedBadge = screen.getByText('Approved');
    
    expect(pendingBadge.closest('[class*="badge"]')).toHaveClass('secondary');
    expect(approvedBadge.closest('[class*="badge"]')).toHaveClass('success');
  });

  it('displays correct refund type badges', () => {
    render(<RefundManagementPage />);
    
    const fullBadge = screen.getByText('Full');
    const partialBadge = screen.getByText('Partial');
    
    expect(fullBadge.closest('[class*="badge"]')).toHaveClass('outline');
    expect(partialBadge.closest('[class*="badge"]')).toHaveClass('outline');
  });
}); 