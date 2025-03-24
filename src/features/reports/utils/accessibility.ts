// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { KeyboardEvent } from 'react';
import type { ReportType, ReportFormat, ReportExecutionStatus } from '../types/scheduledReport.types';

/**
 * Gets ARIA labels for report elements
 */
export const getAriaLabels = () => ({
  reportTypeSelect: 'Select report type',
  reportFormatSelect: 'Select report format',
  scheduleFrequencySelect: 'Select schedule frequency',
  deliveryMethodSelect: 'Select delivery method',
  exportButton: 'Export report',
  scheduleButton: 'Schedule report',
  deleteButton: 'Delete report',
  retryButton: 'Retry',
  reportErrorButton: 'Report error'
});

/**
 * Gets ARIA descriptions for report elements
 */
export const getAriaDescriptions = () => ({
  reportTypeDescription: 'Choose the type of report to generate',
  reportFormatDescription: 'Choose the format for the exported report',
  scheduleDescription: 'Set up a schedule for automatic report generation',
  deliveryDescription: 'Choose how to receive the generated report'
});

/**
 * Gets ARIA live region text for report status updates
 */
export function getStatusAnnouncement(
  status: ReportExecutionStatus,
  reportType: ReportType
): string {
  const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  return `${reportName} is ${statusText}`;
}

/**
 * Gets ARIA live region text for export completion
 */
export function getExportAnnouncement(
  reportType: ReportType,
  format: ReportFormat
): string {
  const reportName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
  const formatText = format.toUpperCase();
  return `${reportName} has been exported as ${formatText}`;
}

/**
 * Keyboard navigation handler for report list items
 */
export function handleReportKeyboardNavigation(
  event: KeyboardEvent<HTMLElement>,
  onAction: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onAction();
  }
}

/**
 * Keyboard navigation handler for report actions menu
 */
export function handleActionsKeyboardNavigation(
  event: KeyboardEvent<HTMLElement>,
  onAction: () => void,
  onClose?: () => void
): void {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onAction();
      break;
    case 'Escape':
      event.preventDefault();
      onClose?.();
      break;
    case 'Tab':
      if (event.shiftKey) {
        // Handle shift+tab navigation
        event.preventDefault();
        // Focus previous element
      }
      break;
  }
}

/**
 * Gets ARIA sort attributes for sortable table headers
 */
export function getSortAttributes(column: string, currentSort: { column: string; direction: 'asc' | 'desc' }) {
  return {
    role: 'columnheader',
    'aria-sort': column === currentSort.column
      ? currentSort.direction === 'asc' ? 'ascending' : 'descending'
      : 'none',
    tabIndex: 0,
    onClick: () => {/* Sort handler */},
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        // Sort handler
      }
    }
  };
}

/**
 * Gets ARIA attributes for report items in a list
 */
export function getReportItemAttributes(index: number, isSelected: boolean, total: number) {
  return {
    role: 'listitem',
    'aria-selected': isSelected,
    'aria-posinset': index + 1,
    'aria-setsize': total,
    tabIndex: isSelected ? 0 : -1
  };
}

/**
 * Gets ARIA attributes for report action buttons
 */
export function getActionButtonAttributes(action: string, disabled: boolean = false) {
  return {
    role: 'button',
    'aria-disabled': disabled,
    tabIndex: disabled ? -1 : 0
  };
}

/**
 * Gets ARIA attributes for form fields
 */
export function getFormFieldAttributes(
  fieldId: string,
  label: string,
  description?: string,
  error?: string
) {
  return {
    id: fieldId,
    'aria-label': label,
    'aria-describedby': description ? `${fieldId}-description` : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-errormessage': error ? `${fieldId}-error` : undefined
  };
}

/**
 * Gets ARIA attributes for modal dialogs
 */
export function getDialogAttributes(title: string) {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': `${title.toLowerCase().replace(/\s+/g, '-')}-title`
  };
}

/**
 * Gets ARIA attributes for progress indicators
 */
export function getProgressAttributes(value: number, max: number) {
  return {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-valuetext': `${Math.round((value / max) * 100)}% complete`
  };
} 