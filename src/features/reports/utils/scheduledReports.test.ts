// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

import { describe, it, expect, beforeEach } from 'vitest';
import { addDays, addMonths, addYears, setHours, setMinutes, startOfDay } from 'date-fns';
import {
  calculateNextRun,
  validateScheduledReport,
  getScheduleDescription,
  createExecutionRecord,
  updateExecutionRecord,
  getExecutionStatusText,
  getUpcomingSchedule
} from './scheduledReports';
import type { ScheduledReport } from '../types/scheduledReport.types';

// Mock data
const mockReport: ScheduledReport = {
  id: 'report_1',
  name: 'Daily Sales Report',
  schedule: {
    frequency: 'daily',
    time: '09:00',
    timezone: 'America/New_York'
  },
  parameters: {
    type: 'sales',
    format: 'pdf',
    includeCharts: true,
    includeSummary: true,
    includeDetails: true
  },
  delivery: {
    method: 'email',
    recipients: ['test@example.com']
  },
  isActive: true,
  lastRun: null,
  nextRun: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user_1',
  updatedBy: 'user_1'
};

describe('Scheduled Reports Utils', () => {
  describe('calculateNextRun', () => {
    it('calculates next run for daily schedule', () => {
      const report = { ...mockReport };
      const nextRun = calculateNextRun(report);
      
      const today = new Date();
      const expectedTime = setMinutes(setHours(today, 9), 0);
      
      if (expectedTime < today) {
        expectedTime.setDate(expectedTime.getDate() + 1);
      }
      
      expect(nextRun.getHours()).toBe(9);
      expect(nextRun.getMinutes()).toBe(0);
    });

    it('calculates next run for weekly schedule', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'weekly',
          dayOfWeek: 1 // Monday
        }
      };
      
      const nextRun = calculateNextRun(report);
      expect(nextRun.getDay()).toBe(1); // Monday
    });

    it('calculates next run for monthly schedule', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'monthly',
          dayOfMonth: 15
        }
      };
      
      const nextRun = calculateNextRun(report);
      expect(nextRun.getDate()).toBe(15);
    });

    it('calculates next run for quarterly schedule', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'quarterly',
          dayOfMonth: 1
        }
      };
      
      const nextRun = calculateNextRun(report);
      expect([0, 3, 6, 9]).toContain(nextRun.getMonth());
    });

    it('calculates next run for yearly schedule', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'yearly',
          monthOfYear: 1,
          dayOfMonth: 1
        }
      };
      
      const nextRun = calculateNextRun(report);
      expect(nextRun.getMonth()).toBe(0); // January
      expect(nextRun.getDate()).toBe(1);
    });
  });

  describe('validateScheduledReport', () => {
    it('validates weekly schedule requirements', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'weekly'
        }
      };
      
      const errors = validateScheduledReport(report);
      expect(errors).toContain('Day of week is required for weekly schedules');
    });

    it('validates monthly schedule requirements', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'monthly'
        }
      };
      
      const errors = validateScheduledReport(report);
      expect(errors).toContain('Day of month is required for monthly and quarterly schedules');
    });

    it('validates yearly schedule requirements', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'yearly'
        }
      };
      
      const errors = validateScheduledReport(report);
      expect(errors).toContain('Month and day are required for yearly schedules');
    });

    it('validates email delivery requirements', () => {
      const report = {
        ...mockReport,
        delivery: {
          method: 'email',
          recipients: []
        }
      };
      
      const errors = validateScheduledReport(report);
      expect(errors).toContain('At least one email recipient is required');
    });

    it('validates webhook delivery requirements', () => {
      const report = {
        ...mockReport,
        delivery: {
          method: 'webhook',
          recipients: []
        }
      };
      
      const errors = validateScheduledReport(report);
      expect(errors).toContain('Webhook URL is required for webhook delivery');
    });
  });

  describe('getScheduleDescription', () => {
    it('formats daily schedule description', () => {
      const description = getScheduleDescription(mockReport);
      expect(description).toBe('Daily at 9:00 AM America/New_York');
    });

    it('formats weekly schedule description', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'weekly',
          dayOfWeek: 1
        }
      };
      
      const description = getScheduleDescription(report);
      expect(description).toBe('Every Monday at 9:00 AM America/New_York');
    });

    it('formats monthly schedule description', () => {
      const report = {
        ...mockReport,
        schedule: {
          ...mockReport.schedule,
          frequency: 'monthly',
          dayOfMonth: 15
        }
      };
      
      const description = getScheduleDescription(report);
      expect(description).toBe('Monthly on the 15th at 9:00 AM America/New_York');
    });
  });

  describe('execution record management', () => {
    it('creates execution record with correct initial state', () => {
      const execution = createExecutionRecord('report_1');
      
      expect(execution.id).toMatch(/^exec_/);
      expect(execution.reportId).toBe('report_1');
      expect(execution.status).toBe('pending');
      expect(execution.startTime).toBeInstanceOf(Date);
    });

    it('updates execution record with new status', () => {
      const execution = createExecutionRecord('report_1');
      const updated = updateExecutionRecord(execution, 'completed', {
        outputUrl: 'https://example.com/report.pdf'
      });
      
      expect(updated.status).toBe('completed');
      expect(updated.endTime).toBeInstanceOf(Date);
      expect(updated.outputUrl).toBe('https://example.com/report.pdf');
    });

    it('formats execution status text correctly', () => {
      expect(getExecutionStatusText('pending')).toBe('Pending');
      expect(getExecutionStatusText('running')).toBe('Running');
      expect(getExecutionStatusText('completed')).toBe('Completed');
      expect(getExecutionStatusText('failed')).toBe('Failed');
    });
  });

  describe('getUpcomingSchedule', () => {
    it('returns correct number of upcoming dates', () => {
      const dates = getUpcomingSchedule(mockReport, 3);
      expect(dates).toHaveLength(3);
    });

    it('returns dates in chronological order', () => {
      const dates = getUpcomingSchedule(mockReport, 3);
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThan(dates[i - 1]);
      }
    });
  });
}); 