# Module Connection Guide - Reports

## Pre-Connection Analysis
- [ ] Verify module exists in both frontend (`src/features/reports`) and backend (`backend/src/reports`)
- [ ] Check module dependencies in `docs/feature-module-boundaries.md`
- [ ] Review module-specific settings in `components.json`
- [ ] Verify API endpoints in `src/lib/api/config.ts`

## Core Components

### 1. Report Types
```typescript
export const ReportTypes = {
  SALES: 'sales',
  INVENTORY: 'inventory',
  FINANCIAL: 'financial',
  STAFF: 'staff',
  CUSTOM: 'custom'
} as const;

export const ReportFormats = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
} as const;
```

### 2. Scheduled Reports
```typescript
interface ScheduleConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  time: string;
  timezone: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
}

interface DeliveryConfig {
  method: 'email' | 'slack' | 'webhook' | 'ftp';
  recipients?: string[];
  webhookUrl?: string;
  ftpConfig?: {
    host: string;
    username: string;
    password: string;
    path: string;
  };
}
```

## Implementation Steps

### 1. Database Schema
- [ ] Create report-related models:
```prisma
model Report {
  id          String   @id @default(cuid())
  name        String
  type        String
  parameters  Json
  format      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String
  schedule    Schedule?
  executions  ReportExecution[]
}

model Schedule {
  id          String   @id @default(cuid())
  reportId    String   @unique
  frequency   String
  time        String
  timezone    String
  dayOfWeek   Int?
  dayOfMonth  Int?
  monthOfYear Int?
  isActive    Boolean  @default(true)
  lastRun     DateTime?
  nextRun     DateTime
  report      Report   @relation(fields: [reportId], references: [id])
}

model ReportExecution {
  id          String   @id @default(cuid())
  reportId    String
  status      String
  startTime   DateTime
  endTime     DateTime?
  outputUrl   String?
  error       String?
  report      Report   @relation(fields: [reportId], references: [id])
}
```

### 2. API Layer
- [ ] Implement report endpoints:
```typescript
// Report Routes
router.get('/reports', getReports);
router.post('/reports', createReport);
router.get('/reports/:id', getReportById);
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

// Schedule Routes
router.post('/reports/:id/schedule', scheduleReport);
router.put('/reports/:id/schedule', updateSchedule);
router.delete('/reports/:id/schedule', deleteSchedule);

// Execution Routes
router.get('/reports/:id/executions', getReportExecutions);
router.post('/reports/:id/execute', executeReport);
```

### 3. Service Layer
- [ ] Implement report services:
```typescript
class ReportService {
  async generateReport(parameters: ReportParameters): Promise<ReportResult>;
  async scheduleReport(config: ScheduleConfig): Promise<void>;
  async executeScheduledReport(reportId: string): Promise<void>;
  async updateExecutionStatus(execution: ReportExecution, status: ExecutionStatus): Promise<void>;
}
```

### 4. Scheduling System
- [ ] Implement scheduling utilities:
```typescript
export function calculateNextRun(schedule: ScheduleConfig): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  let baseDate = utcToZonedTime(now, schedule.timezone);
  
  baseDate.setHours(hours, minutes, 0, 0);
  
  if (isAfter(now, baseDate)) {
    baseDate = addDays(baseDate, 1);
  }

  switch (schedule.frequency) {
    case 'daily':
      return zonedTimeToUtc(baseDate, schedule.timezone);
    case 'weekly':
      // Weekly logic
    case 'monthly':
      // Monthly logic
    case 'yearly':
      // Yearly logic
  }
}
```

### 5. Frontend Components
- [ ] Create report components:
```typescript
// Report List
const ReportList: React.FC = () => {
  const reports = useReports();
  return (
    <DataTable
      columns={reportColumns}
      data={reports}
      onRowClick={handleReportClick}
    />
  );
};

// Report Builder
const ReportBuilder: React.FC = () => {
  const form = useForm<ReportConfig>({
    resolver: zodResolver(ReportConfigSchema)
  });
  
  return (
    <Form {...form}>
      <ReportTypeSelect />
      <ParametersForm />
      <FormatSelect />
      <ScheduleConfig />
    </Form>
  );
};
```

### 6. State Management
- [ ] Implement report context:
```typescript
export type ReportAction = 
  | { type: 'generate_report'; config: ReportConfig; result: ReportResult }
  | { type: 'update_report_config'; reportId: string; before: Partial<ReportConfig>; after: Partial<ReportConfig> }
  | { type: 'delete_report'; report: ReportResult }
  | { type: 'save_report_template'; config: ReportConfig; name: string }
  | { type: 'schedule_report'; config: ReportConfig; schedule: ScheduleConfig }
  | { type: 'cancel_schedule'; scheduleId: string }
  | { type: 'export_report'; report: ReportResult; format: ReportFormat };
```

### 7. Report Generation
- [ ] Implement report generators:
```typescript
interface ReportGenerator {
  generate(parameters: ReportParameters): Promise<ReportResult>;
  format(result: ReportResult, format: ReportFormat): Promise<Buffer>;
}

class SalesReportGenerator implements ReportGenerator {
  // Implementation
}

class InventoryReportGenerator implements ReportGenerator {
  // Implementation
}
```

### 8. Report Delivery
- [ ] Implement delivery methods:
```typescript
interface DeliveryMethod {
  send(report: ReportResult, config: DeliveryConfig): Promise<void>;
}

class EmailDelivery implements DeliveryMethod {
  // Implementation
}

class SlackDelivery implements DeliveryMethod {
  // Implementation
}
```

## Testing Strategy
1. Unit Tests:
   - Report generation logic
   - Scheduling calculations
   - Parameter validation
   - Format conversion

2. Integration Tests:
   - API endpoints
   - Database operations
   - Scheduled execution
   - Delivery methods

3. E2E Tests:
   - Report creation flow
   - Scheduling flow
   - Execution flow
   - Delivery flow

## Monitoring & Error Handling
1. Report Generation Metrics:
   - Generation time
   - Success rate
   - Error distribution
   - Resource usage

2. Schedule Execution Metrics:
   - Execution success rate
   - Timing accuracy
   - Delivery success rate

3. Error Handling:
```typescript
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
```

## Security Considerations
1. Access Control:
   - Report-level permissions
   - Schedule management permissions
   - Data access restrictions

2. Data Protection:
   - Sensitive data filtering
   - Secure delivery methods
   - Audit logging

## Performance Optimization
1. Report Generation:
   - Caching strategies
   - Parallel processing
   - Resource limits

2. Scheduled Execution:
   - Load balancing
   - Queue management
   - Resource scheduling

## Deployment Checklist
- [ ] Database migrations
- [ ] Scheduler setup
- [ ] Queue system configuration
- [ ] Storage configuration
- [ ] Delivery method setup
- [ ] Monitoring setup
- [ ] Backup configuration

## Documentation Requirements
1. API Documentation
2. Component Usage
3. Report Types
4. Schedule Configuration
5. Delivery Methods
6. Troubleshooting Guide

