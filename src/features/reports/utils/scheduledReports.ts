import { format, addDays, addWeeks, addMonths, addYears, parseISO, isAfter } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import type {
  ScheduledReport,
  ScheduleFrequency,
  ReportExecutionResult,
  ReportExecutionStatus
} from '../types/scheduledReport.types';
import { generateId } from '@/lib/utils/id-utils';

/**
 * Calculates the next run time for a scheduled report
 */
export function calculateNextRun(report: ScheduledReport): Date {
  const now = new Date();
  const [hours, minutes] = report.schedule.time.split(':').map(Number);
  let baseDate = utcToZonedTime(now, report.schedule.timezone);
  
  // Set the time component
  baseDate.setHours(hours, minutes, 0, 0);
  
  // If the calculated time is in the past, start from tomorrow
  if (isAfter(now, baseDate)) {
    baseDate = addDays(baseDate, 1);
  }

  // Calculate next run based on frequency
  switch (report.schedule.frequency) {
    case 'daily':
      return zonedTimeToUtc(baseDate, report.schedule.timezone);

    case 'weekly': {
      const targetDay = report.schedule.dayOfWeek || 0;
      const currentDay = baseDate.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7;
      return zonedTimeToUtc(addDays(baseDate, daysToAdd), report.schedule.timezone);
    }

    case 'monthly': {
      const targetDay = report.schedule.dayOfMonth || 1;
      let nextRun = new Date(baseDate);
      nextRun.setDate(targetDay);
      if (isAfter(now, nextRun)) {
        nextRun = addMonths(nextRun, 1);
      }
      return zonedTimeToUtc(nextRun, report.schedule.timezone);
    }

    case 'quarterly': {
      const targetMonth = Math.floor(baseDate.getMonth() / 3) * 3;
      const targetDay = report.schedule.dayOfMonth || 1;
      let nextRun = new Date(baseDate);
      nextRun.setMonth(targetMonth);
      nextRun.setDate(targetDay);
      if (isAfter(now, nextRun)) {
        nextRun = addMonths(nextRun, 3);
      }
      return zonedTimeToUtc(nextRun, report.schedule.timezone);
    }

    case 'yearly': {
      const targetMonth = report.schedule.monthOfYear ? report.schedule.monthOfYear - 1 : 0;
      const targetDay = report.schedule.dayOfMonth || 1;
      let nextRun = new Date(baseDate);
      nextRun.setMonth(targetMonth);
      nextRun.setDate(targetDay);
      if (isAfter(now, nextRun)) {
        nextRun = addYears(nextRun, 1);
      }
      return zonedTimeToUtc(nextRun, report.schedule.timezone);
    }

    default:
      throw new Error(`Unsupported frequency: ${report.schedule.frequency}`);
  }
}

/**
 * Validates a scheduled report configuration
 */
export function validateScheduledReport(report: ScheduledReport): string[] {
  const errors: string[] = [];

  // Validate schedule configuration
  if (report.schedule.frequency === 'weekly' && report.schedule.dayOfWeek === undefined) {
    errors.push('Day of week is required for weekly schedules');
  }

  if ((report.schedule.frequency === 'monthly' || report.schedule.frequency === 'quarterly') && 
      report.schedule.dayOfMonth === undefined) {
    errors.push('Day of month is required for monthly and quarterly schedules');
  }

  if (report.schedule.frequency === 'yearly' && 
      (report.schedule.monthOfYear === undefined || report.schedule.dayOfMonth === undefined)) {
    errors.push('Month and day are required for yearly schedules');
  }

  // Validate delivery configuration
  if (report.delivery.method === 'email' && 
      (!report.delivery.recipients || report.delivery.recipients.length === 0)) {
    errors.push('At least one email recipient is required');
  }

  if (report.delivery.method === 'webhook' && !report.delivery.webhookUrl) {
    errors.push('Webhook URL is required for webhook delivery');
  }

  if (report.delivery.method === 'ftp' && !report.delivery.ftpConfig) {
    errors.push('FTP configuration is required for FTP delivery');
  }

  return errors;
}

/**
 * Gets the human-readable schedule description
 */
export function getScheduleDescription(report: ScheduledReport): string {
  const time = format(parseISO(`2000-01-01T${report.schedule.time}`), 'h:mm a');
  const timezone = report.schedule.timezone;

  switch (report.schedule.frequency) {
    case 'daily':
      return `Daily at ${time} ${timezone}`;

    case 'weekly': {
      const day = format(new Date(2000, 0, report.schedule.dayOfWeek! + 2), 'EEEE');
      return `Every ${day} at ${time} ${timezone}`;
    }

    case 'monthly': {
      const day = format(new Date(2000, 0, report.schedule.dayOfMonth!), 'do');
      return `Monthly on the ${day} at ${time} ${timezone}`;
    }

    case 'quarterly': {
      const day = format(new Date(2000, 0, report.schedule.dayOfMonth!), 'do');
      return `Quarterly on the ${day} at ${time} ${timezone}`;
    }

    case 'yearly': {
      const month = format(new Date(2000, report.schedule.monthOfYear! - 1, 1), 'MMMM');
      const day = format(new Date(2000, 0, report.schedule.dayOfMonth!), 'do');
      return `Yearly on ${month} ${day} at ${time} ${timezone}`;
    }

    default:
      return 'Invalid schedule';
  }
}

/**
 * Creates a new execution record for a scheduled report
 */
export function createExecutionRecord(reportId: string): ReportExecutionResult {
  return {
    id: generateId('exec_'),
    reportId,
    status: 'pending',
    startTime: new Date()
  };
}

/**
 * Updates an execution record with new status and details
 */
export function updateExecutionRecord(
  execution: ReportExecutionResult,
  status: ReportExecutionStatus,
  details?: Partial<ReportExecutionResult>
): ReportExecutionResult {
  return {
    ...execution,
    ...details,
    status,
    endTime: status === 'running' ? undefined : new Date()
  };
}

/**
 * Gets the display text for an execution status
 */
export function getExecutionStatusText(status: ReportExecutionStatus): string {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

/**
 * Gets the next few scheduled run times
 */
export function getUpcomingSchedule(report: ScheduledReport, count: number = 5): Date[] {
  const dates: Date[] = [];
  let lastDate = report.nextRun;

  for (let i = 0; i < count; i++) {
    dates.push(lastDate);
    const nextReport = { ...report, nextRun: lastDate };
    lastDate = calculateNextRun(nextReport);
  }

  return dates;
} 