/**
 * Repair Routes
 * 
 * This file defines all routes for the Repairs module.
 */

import { getIconByName } from './routeUtils';

// Base routes
export const REPAIRS_ROUTES = {
  ROOT: 'repairs',
  DASHBOARD: '',
  TICKETS: 'tickets',
  TICKET_DETAILS: 'tickets/:id',
  NEW_TICKET: 'tickets/new',
  EDIT_TICKET: 'tickets/:id/edit',
  DIAGNOSIS: 'diagnosis',
  PARTS: 'parts',
  CHARGES: 'charges',
  STATUS: 'status',
  TECHNICIANS: 'technicians',
  REPORTS: 'reports',
  CONNECTION: 'connection',
};

// Full paths constructed by joining routes
export const REPAIRS_FULL_ROUTES = {
  ROOT: `/${REPAIRS_ROUTES.ROOT}`,
  DASHBOARD: `/${REPAIRS_ROUTES.ROOT}${REPAIRS_ROUTES.DASHBOARD ? `/${REPAIRS_ROUTES.DASHBOARD}` : ''}`,
  TICKETS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.TICKETS}`,
  TICKET_DETAILS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.TICKET_DETAILS}`,
  NEW_TICKET: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.NEW_TICKET}`,
  EDIT_TICKET: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.EDIT_TICKET}`,
  DIAGNOSIS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.DIAGNOSIS}`,
  PARTS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.PARTS}`,
  CHARGES: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.CHARGES}`,
  STATUS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.STATUS}`,
  TECHNICIANS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.TECHNICIANS}`,
  REPORTS: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.REPORTS}`,
  CONNECTION: `/${REPAIRS_ROUTES.ROOT}/${REPAIRS_ROUTES.CONNECTION}`,
};

// Dynamic route generation helpers
export const getRepairTicketRoute = (ticketId: string) => 
  REPAIRS_FULL_ROUTES.TICKET_DETAILS.replace(':id', ticketId);

export const getRepairTicketEditRoute = (ticketId: string) => 
  REPAIRS_FULL_ROUTES.EDIT_TICKET.replace(':id', ticketId);

// Route configuration with metadata
export const REPAIRS_ROUTE_CONFIG = {
  ROOT: {
    path: REPAIRS_ROUTES.ROOT,
    label: 'Repairs',
    icon: getIconByName('Tool'),
    description: 'Manage repair tickets and services',
    showInNav: true,
    order: 5,
  },
  DASHBOARD: {
    path: REPAIRS_ROUTES.DASHBOARD,
    label: 'Repair Dashboard',
    icon: getIconByName('LayoutDashboard'),
    description: 'Overview of repair operations',
    showInNav: true,
    order: 1,
  },
  TICKETS: {
    path: REPAIRS_ROUTES.TICKETS,
    label: 'Repair Tickets',
    icon: getIconByName('Clipboard'),
    description: 'Manage repair tickets',
    showInNav: true,
    order: 2,
  },
  TICKET_DETAILS: {
    path: REPAIRS_ROUTES.TICKET_DETAILS,
    label: 'Ticket Details',
    icon: getIconByName('Info'),
    description: 'View repair ticket details',
    showInNav: false,
  },
  NEW_TICKET: {
    path: REPAIRS_ROUTES.NEW_TICKET,
    label: 'New Repair Ticket',
    icon: getIconByName('PlusCircle'),
    description: 'Create a new repair ticket',
    showInNav: true,
    order: 3,
  },
  EDIT_TICKET: {
    path: REPAIRS_ROUTES.EDIT_TICKET,
    label: 'Edit Repair Ticket',
    icon: getIconByName('Edit'),
    description: 'Edit repair ticket details',
    showInNav: false,
  },
  DIAGNOSIS: {
    path: REPAIRS_ROUTES.DIAGNOSIS,
    label: 'Diagnosis Reports',
    icon: getIconByName('Stethoscope'),
    description: 'View and manage diagnosis reports',
    showInNav: true,
    order: 4,
  },
  PARTS: {
    path: REPAIRS_ROUTES.PARTS,
    label: 'Repair Parts',
    icon: getIconByName('Wrench'),
    description: 'Manage repair parts and inventory',
    showInNav: true,
    order: 5,
  },
  CHARGES: {
    path: REPAIRS_ROUTES.CHARGES,
    label: 'Service Charges',
    icon: getIconByName('DollarSign'),
    description: 'Manage repair service charges',
    showInNav: true,
    order: 6,
  },
  STATUS: {
    path: REPAIRS_ROUTES.STATUS,
    label: 'Repair Status',
    icon: getIconByName('Activity'),
    description: 'View and update repair status',
    showInNav: true,
    order: 7,
  },
  TECHNICIANS: {
    path: REPAIRS_ROUTES.TECHNICIANS,
    label: 'Technicians',
    icon: getIconByName('UserCog'),
    description: 'Manage repair technicians',
    showInNav: true,
    order: 8,
  },
  REPORTS: {
    path: REPAIRS_ROUTES.REPORTS,
    label: 'Repair Reports',
    icon: getIconByName('FileText'),
    description: 'Generate repair reports',
    showInNav: true,
    order: 9,
  },
  CONNECTION: {
    path: REPAIRS_ROUTES.CONNECTION,
    label: 'Repair Connection',
    icon: getIconByName('Link'),
    description: 'Connect to external repair systems',
    showInNav: true,
    order: 10,
  },
}; 