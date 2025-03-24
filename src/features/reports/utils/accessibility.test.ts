// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { describe, it, expect, vi } from 'vitest';
import {
  getAriaLabels,
  getAriaDescriptions,
  getStatusAnnouncement,
  getExportAnnouncement,
  handleReportKeyboardNavigation,
  handleActionsKeyboardNavigation,
  getSortAttributes,
  getReportItemAttributes,
  getActionButtonAttributes,
  getFormFieldAttributes,
  getDialogAttributes,
  getProgressAttributes
} from './accessibility';

describe('Accessibility Utils', () => {
  describe('getAriaLabels', () => {
    it('returns correct ARIA labels', () => {
      const labels = getAriaLabels();
      expect(labels.reportTypeSelect).toBe('Select report type');
      expect(labels.reportFormatSelect).toBe('Select report format');
      expect(labels.scheduleFrequencySelect).toBe('Select schedule frequency');
      expect(labels.deliveryMethodSelect).toBe('Select delivery method');
    });
  });

  describe('getAriaDescriptions', () => {
    it('returns correct ARIA descriptions', () => {
      const descriptions = getAriaDescriptions();
      expect(descriptions.reportTypeDescription).toBe('Choose the type of report to generate');
      expect(descriptions.reportFormatDescription).toBe('Choose the format for the exported report');
    });
  });

  describe('getStatusAnnouncement', () => {
    it('formats status announcement correctly', () => {
      const announcement = getStatusAnnouncement('completed', 'sales');
      expect(announcement).toBe('Sales Report is Completed');
    });
  });

  describe('getExportAnnouncement', () => {
    it('formats export announcement correctly', () => {
      const announcement = getExportAnnouncement('sales', 'pdf');
      expect(announcement).toBe('Sales Report has been exported as PDF');
    });
  });

  describe('handleReportKeyboardNavigation', () => {
    it('calls action on Enter key', () => {
      const action = vi.fn();
      const event = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as unknown as React.KeyboardEvent<HTMLElement>;

      handleReportKeyboardNavigation(event, action);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(action).toHaveBeenCalled();
    });

    it('calls action on Space key', () => {
      const action = vi.fn();
      const event = {
        key: ' ',
        preventDefault: vi.fn()
      } as unknown as React.KeyboardEvent<HTMLElement>;

      handleReportKeyboardNavigation(event, action);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(action).toHaveBeenCalled();
    });
  });

  describe('handleActionsKeyboardNavigation', () => {
    it('calls action on Enter key', () => {
      const action = vi.fn();
      const close = vi.fn();
      const event = {
        key: 'Enter',
        preventDefault: vi.fn()
      } as unknown as React.KeyboardEvent<HTMLElement>;

      handleActionsKeyboardNavigation(event, action, close);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(action).toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
    });

    it('calls close on Escape key', () => {
      const action = vi.fn();
      const close = vi.fn();
      const event = {
        key: 'Escape',
        preventDefault: vi.fn()
      } as unknown as React.KeyboardEvent<HTMLElement>;

      handleActionsKeyboardNavigation(event, action, close);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(close).toHaveBeenCalled();
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('getSortAttributes', () => {
    it('returns correct sort attributes for active column', () => {
      const attrs = getSortAttributes('name', { column: 'name', direction: 'asc' });
      expect(attrs.role).toBe('columnheader');
      expect(attrs['aria-sort']).toBe('ascending');
      expect(attrs.tabIndex).toBe(0);
    });

    it('returns correct sort attributes for inactive column', () => {
      const attrs = getSortAttributes('name', { column: 'date', direction: 'asc' });
      expect(attrs.role).toBe('columnheader');
      expect(attrs['aria-sort']).toBe('none');
      expect(attrs.tabIndex).toBe(0);
    });
  });

  describe('getReportItemAttributes', () => {
    it('returns correct attributes for selected item', () => {
      const attrs = getReportItemAttributes(0, true, 10);
      expect(attrs.role).toBe('listitem');
      expect(attrs['aria-selected']).toBe(true);
      expect(attrs['aria-posinset']).toBe(1);
      expect(attrs['aria-setsize']).toBe(10);
      expect(attrs.tabIndex).toBe(0);
    });

    it('returns correct attributes for unselected item', () => {
      const attrs = getReportItemAttributes(0, false, 10);
      expect(attrs['aria-selected']).toBe(false);
      expect(attrs.tabIndex).toBe(-1);
    });
  });

  describe('getActionButtonAttributes', () => {
    it('returns correct attributes for enabled button', () => {
      const attrs = getActionButtonAttributes('export');
      expect(attrs.role).toBe('button');
      expect(attrs['aria-disabled']).toBe(false);
      expect(attrs.tabIndex).toBe(0);
    });

    it('returns correct attributes for disabled button', () => {
      const attrs = getActionButtonAttributes('export', true);
      expect(attrs['aria-disabled']).toBe(true);
      expect(attrs.tabIndex).toBe(-1);
    });
  });

  describe('getFormFieldAttributes', () => {
    it('returns correct attributes for field with error', () => {
      const attrs = getFormFieldAttributes('name', 'Name', 'Enter your name', 'Name is required');
      expect(attrs.id).toBe('name');
      expect(attrs['aria-label']).toBe('Name');
      expect(attrs['aria-describedby']).toBe('name-description');
      expect(attrs['aria-invalid']).toBe(true);
      expect(attrs['aria-errormessage']).toBe('name-error');
    });

    it('returns correct attributes for field without error', () => {
      const attrs = getFormFieldAttributes('name', 'Name', 'Enter your name');
      expect(attrs['aria-invalid']).toBeUndefined();
      expect(attrs['aria-errormessage']).toBeUndefined();
    });
  });

  describe('getDialogAttributes', () => {
    it('returns correct dialog attributes', () => {
      const attrs = getDialogAttributes('Export Report');
      expect(attrs.role).toBe('dialog');
      expect(attrs['aria-modal']).toBe(true);
      expect(attrs['aria-labelledby']).toBe('export-report-title');
    });
  });

  describe('getProgressAttributes', () => {
    it('returns correct progress attributes', () => {
      const attrs = getProgressAttributes(50, 100);
      expect(attrs.role).toBe('progressbar');
      expect(attrs['aria-valuemin']).toBe(0);
      expect(attrs['aria-valuemax']).toBe(100);
      expect(attrs['aria-valuenow']).toBe(50);
      expect(attrs['aria-valuetext']).toBe('50% complete');
    });
  });
}); 