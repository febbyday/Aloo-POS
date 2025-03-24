/**
 * ProductsSettingsRefactored Component Tests
 * 
 * This file contains tests for the refactored Products Settings component
 * created in Phase 2 using our form system.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customRender, screen, waitFor, fireEvent, userEvent } from '@/test/utils';
import { ProductsSettingsPanelRefactored } from './ProductsSettingsRefactored';
import { useToast } from '@/components/ui/use-toast';

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

describe('ProductsSettingsRefactored Component', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });
  
  // Test that the component renders correctly
  it('renders all form sections correctly', () => {
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Check for the card title
    expect(screen.getByText('Product Settings')).toBeInTheDocument();
    
    // Check for all tab buttons
    expect(screen.getByRole('tab', { name: 'General' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pricing' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Display' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Images' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Import/Export' })).toBeInTheDocument();
    
    // Check for form fields in the General tab (which should be active by default)
    expect(screen.getByLabelText('Default Unit')).toBeInTheDocument();
    expect(screen.getByLabelText('Default Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Product Variants')).toBeInTheDocument();
  });
  
  // Test tab navigation
  it('switches content when tabs are clicked', async () => {
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Click on the Inventory tab
    await user.click(screen.getByRole('tab', { name: 'Inventory' }));
    
    // Check that Inventory fields are now visible
    expect(screen.getByLabelText('Track Inventory')).toBeInTheDocument();
    expect(screen.getByLabelText('Low Stock Threshold')).toBeInTheDocument();
    
    // Click on the Pricing tab
    await user.click(screen.getByRole('tab', { name: 'Pricing' }));
    
    // Check that Pricing fields are now visible
    expect(screen.getByLabelText('Default Price Calculation')).toBeInTheDocument();
    expect(screen.getByLabelText('Default Markup Percentage')).toBeInTheDocument();
  });
  
  // Test form validation
  it('shows validation errors for required fields', async () => {
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Clear a required field
    const defaultUnitInput = screen.getByLabelText('Default Unit');
    await user.clear(defaultUnitInput);
    
    // Trigger validation by clicking outside the input
    fireEvent.blur(defaultUnitInput);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });
  
  // Test form submission
  it('submits the form with correct values', async () => {
    const { toast } = useToast() as { toast: vi.Mock };
    
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Make some changes to the form
    await user.clear(screen.getByLabelText('Default Unit'));
    await user.type(screen.getByLabelText('Default Unit'), 'box');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: 'Save Settings' }));
    
    // Check that the toast was called
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Settings saved',
          description: 'Product settings have been updated successfully.',
        })
      );
    });
  });
  
  // Test toggle switches
  it('toggles switch values correctly', async () => {
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Find the switch and check initial state (should be on by default)
    const variantsSwitch = screen.getByLabelText('Enable Product Variants');
    expect(variantsSwitch).toBeChecked();
    
    // Click the switch to toggle it off
    await user.click(variantsSwitch);
    
    // Check that it's now off
    expect(variantsSwitch).not.toBeChecked();
    
    // Toggle it back on
    await user.click(variantsSwitch);
    
    // Check that it's on again
    expect(variantsSwitch).toBeChecked();
  });
  
  // Test select field
  it('changes select field values', async () => {
    customRender(<ProductsSettingsPanelRefactored />);
    
    // Click on the select to open the dropdown
    await user.click(screen.getByLabelText('Barcode Format'));
    
    // Click on a different option
    await user.click(screen.getByRole('option', { name: 'UPC' }));
    
    // Check that the selected value has changed
    expect(screen.getByText('UPC')).toBeInTheDocument();
  });
}); 