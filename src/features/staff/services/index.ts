/**
 * Staff Services
 *
 * This module exports all services for the staff feature.
 */

// Export all services here
export { staffService } from './staffService';
export { documentService } from './documentService';
// Import roleService from users module
export { roleService } from '@/features/users/services';
export { employmentTypeService } from './employmentTypeService';
export { employmentStatusService } from './employmentStatusService';
export { performanceService } from './performanceService';
export { roleTemplateService } from '@/features/users/services';
export { attendanceService } from './attendanceService';
