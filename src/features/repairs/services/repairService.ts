import { enhancedApiClient } from '@/lib/api/enhanced-api-client';
import {
  RepairTicket,
  CreateRepairInput,
  UpdateRepairInput,
  DiagnosisReport,
  CreateDiagnosisInput,
  RepairPart,
  AddPartInput,
  ServiceCharge,
  AddServiceChargeInput,
  StatusUpdate,
  UpdateStatusInput,
  REPAIR_STATUS,
  REPAIR_PRIORITY,
  DEVICE_TYPE
} from '../types';

// Mock data for development purposes
const MOCK_REPAIRS: RepairTicket[] = [
  {
    id: '1',
    ticketNumber: 'REP-001',
    customerId: 'cust1',
    customerName: 'John Doe',
    deviceType: DEVICE_TYPE.LAPTOP,
    brand: 'Dell',
    model: 'XPS 15',
    serialNumber: 'XPS15-12345',
    description: 'Dell XPS 15 laptop',
    problemDescription: 'Will not power on, battery may be dead',
    status: REPAIR_STATUS.DIAGNOSED,
    priority: REPAIR_PRIORITY.MEDIUM,
    assignedToId: 'tech1',
    assignedToName: 'Alex Technician',
    estimatedCompletionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'staff1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerContact: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '555-123-4567',
    notes: 'Customer mentioned the laptop was exposed to water briefly.',
    depositAmount: 50,
    isWarranty: false,
    isInsurance: false,
    isUnderContract: false,
    diagnosis: [
      {
        id: 'diag1',
        repairId: '1',
        findings: 'Water damage to the motherboard. Battery connection corroded.',
        recommendation: 'Replace motherboard and battery. Clean internal components.',
        technicianId: 'tech1',
        technicianName: 'Alex Technician',
        estimatedCompletionTime: '2 days',
        estimatedCost: 350,
        createdAt: new Date().toISOString()
      }
    ],
    parts: [
      {
        id: 'part1',
        repairId: '1',
        productId: 'prod123',
        productName: 'Laptop Motherboard - Dell XPS 15',
        quantity: 1,
        unitCost: 250,
        totalCost: 250,
        isOrdered: true,
        isReceived: false,
        isInstalled: false,
        notes: 'Ordered from supplier',
        orderedAt: new Date().toISOString()
      },
      {
        id: 'part2',
        repairId: '1',
        productId: 'prod456',
        productName: 'Laptop Battery - Dell XPS 15',
        quantity: 1,
        unitCost: 80,
        totalCost: 80,
        isOrdered: true,
        isReceived: true,
        isInstalled: false,
        notes: 'In stock',
        orderedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        receivedAt: new Date().toISOString()
      }
    ],
    charges: [
      {
        id: 'charge1',
        repairId: '1',
        description: 'Diagnostic Fee',
        amount: 45,
        category: 'SERVICE',
        isBillable: true,
        isTaxable: true,
        taxRate: 8.25,
        totalWithTax: 48.71,
        createdAt: new Date().toISOString(),
        technicianId: 'tech1'
      }
    ],
    statusHistory: [
      {
        id: 'status1',
        repairId: '1',
        status: REPAIR_STATUS.PENDING,
        notes: 'Repair ticket created',
        updatedById: 'staff1',
        updatedByName: 'Staff Member',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'status2',
        repairId: '1',
        status: REPAIR_STATUS.DIAGNOSED,
        notes: 'Diagnosis completed, waiting for parts',
        updatedById: 'tech1',
        updatedByName: 'Alex Technician',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    ticketNumber: 'REP-002',
    customerId: 'cust2',
    customerName: 'Jane Smith',
    deviceType: DEVICE_TYPE.PHONE,
    brand: 'Apple',
    model: 'iPhone 14',
    serialNumber: 'IPHONE14-67890',
    description: 'iPhone 14 with cracked screen',
    problemDescription: 'Screen is cracked, touch not responsive in corner',
    status: REPAIR_STATUS.IN_PROGRESS,
    priority: REPAIR_PRIORITY.HIGH,
    assignedToId: 'tech2',
    assignedToName: 'Sam Technician',
    estimatedCompletionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdById: 'staff2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerContact: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    customerPhone: '555-987-6543',
    notes: 'Customer needs phone back ASAP for work',
    depositAmount: 100,
    isWarranty: false,
    isInsurance: false,
    isUnderContract: false,
    diagnosis: [
      {
        id: 'diag2',
        repairId: '2',
        findings: 'Screen is cracked, touch digitizer damaged',
        recommendation: 'Replace screen assembly',
        technicianId: 'tech2',
        technicianName: 'Sam Technician',
        estimatedCompletionTime: '1 day',
        estimatedCost: 220,
        createdAt: new Date().toISOString()
      }
    ],
    parts: [
      {
        id: 'part3',
        repairId: '2',
        productId: 'prod789',
        productName: 'iPhone 14 Screen Assembly',
        quantity: 1,
        unitCost: 150,
        totalCost: 150,
        isOrdered: true,
        isReceived: true,
        isInstalled: false,
        notes: 'In stock',
        orderedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        receivedAt: new Date().toISOString()
      }
    ],
    charges: [
      {
        id: 'charge2',
        repairId: '2',
        description: 'Screen Replacement',
        amount: 150,
        category: 'PARTS',
        isBillable: true,
        isTaxable: true,
        taxRate: 8.25,
        totalWithTax: 162.38,
        createdAt: new Date().toISOString(),
        technicianId: 'tech2'
      },
      {
        id: 'charge3',
        repairId: '2',
        description: 'Labor',
        amount: 70,
        category: 'LABOR',
        isBillable: true,
        isTaxable: true,
        taxRate: 8.25,
        totalWithTax: 75.78,
        createdAt: new Date().toISOString(),
        technicianId: 'tech2'
      }
    ],
    statusHistory: [
      {
        id: 'status3',
        repairId: '2',
        status: REPAIR_STATUS.PENDING,
        notes: 'Repair ticket created',
        updatedById: 'staff2',
        updatedByName: 'Staff Member',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'status4',
        repairId: '2',
        status: REPAIR_STATUS.DIAGNOSED,
        notes: 'Diagnosis completed',
        updatedById: 'tech2',
        updatedByName: 'Sam Technician',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'status5',
        repairId: '2',
        status: REPAIR_STATUS.IN_PROGRESS,
        notes: 'Parts received, beginning repair',
        updatedById: 'tech2',
        updatedByName: 'Sam Technician',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// Mock technicians data
const MOCK_TECHNICIANS = [
  { id: 'tech1', name: 'Alex Technician', specialties: ['LAPTOP', 'COMPUTER'] },
  { id: 'tech2', name: 'Sam Technician', specialties: ['PHONE', 'TABLET'] },
  { id: 'tech3', name: 'Chris Technician', specialties: ['PRINTER', 'COMPUTER'] }
];

/**
 * Repair Service for managing repair tickets and related entities
 */
export const repairService = {
  /**
   * Fetch all repair tickets
   */
  async fetchAll(): Promise<RepairTicket[]> {
    try {
      console.log('Fetching all repairs using enhanced API client');

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.get('repairs/LIST');
        return response;
      } catch (apiError) {
        console.warn('API call failed, falling back to mock data:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fall back to mock data
        return MOCK_REPAIRS;
      }
    } catch (error) {
      console.error('Error fetching repair tickets:', error);
      throw new Error('Failed to fetch repair tickets');
    }
  },

  /**
   * Fetch a single repair ticket by ID
   */
  async fetchById(id: string): Promise<RepairTicket> {
    try {
      console.log(`Fetching repair ticket ${id} using enhanced API client`);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.get('repairs/DETAIL', { id });
        return response;
      } catch (apiError) {
        console.warn(`API call failed for repair ${id}, falling back to mock data:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const repair = MOCK_REPAIRS.find(repair => repair.id === id);

        if (!repair) {
          throw new Error(`Repair ticket with ID ${id} not found`);
        }

        return repair;
      }
    } catch (error) {
      console.error(`Error fetching repair ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new repair ticket
   */
  async createRepair(repairData: CreateRepairInput): Promise<RepairTicket> {
    try {
      console.log('Creating new repair ticket using enhanced API client');
      console.log('Repair data:', repairData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.post('repairs/CREATE', repairData);
        return response;
      } catch (apiError) {
        console.warn('API call failed, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 700));

        // Generate a new repair with ID and timestamps
        const newRepair: RepairTicket = {
          ...repairData,
          id: `repair-${Date.now()}`,
          ticketNumber: `REP-${String(MOCK_REPAIRS.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          statusHistory: [
            {
              id: `status-${Date.now()}`,
              repairId: `repair-${Date.now()}`,
              status: REPAIR_STATUS.PENDING,
              notes: 'Repair ticket created',
              updatedById: repairData.createdById,
              createdAt: new Date().toISOString()
            }
          ]
        };

        return newRepair;
      }
    } catch (error) {
      console.error('Error creating repair ticket:', error);
      throw new Error('Failed to create repair ticket');
    }
  },

  /**
   * Update an existing repair ticket
   */
  async updateRepair(id: string, repairData: UpdateRepairInput): Promise<RepairTicket> {
    try {
      console.log(`Updating repair ticket ${id} using enhanced API client`);
      console.log('Update data:', repairData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.patch('repairs/UPDATE', repairData, { id });
        return response;
      } catch (apiError) {
        console.warn(`API call failed for updating repair ${id}, falling back to mock implementation:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const repairIndex = MOCK_REPAIRS.findIndex(repair => repair.id === id);

        if (repairIndex === -1) {
          throw new Error(`Repair ticket with ID ${id} not found`);
        }

        // Create updated repair
        // We already checked that repairIndex !== -1, so this repair exists
        const currentRepair = MOCK_REPAIRS[repairIndex]!;
        const updatedRepair = {
          ...currentRepair,
          ...repairData,
          id, // Ensure ID doesn't change
          updatedAt: new Date().toISOString(),
          // Ensure required fields are present
          customerId: repairData.customerId || currentRepair.customerId,
          deviceType: repairData.deviceType || currentRepair.deviceType,
          status: repairData.status || currentRepair.status,
          description: repairData.description || currentRepair.description,
          problemDescription: repairData.problemDescription || currentRepair.problemDescription,
          priority: repairData.priority || currentRepair.priority,
          isWarranty: repairData.isWarranty !== undefined ? repairData.isWarranty : currentRepair.isWarranty,
          isInsurance: repairData.isInsurance !== undefined ? repairData.isInsurance : currentRepair.isInsurance,
          isUnderContract: repairData.isUnderContract !== undefined ? repairData.isUnderContract : currentRepair.isUnderContract
        } as RepairTicket;

        return updatedRepair;
      }
    } catch (error) {
      console.error(`Error updating repair ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a diagnosis report to a repair ticket
   */
  async addDiagnosis(diagnosisData: CreateDiagnosisInput): Promise<DiagnosisReport> {
    try {
      console.log('Adding diagnosis report using enhanced API client');
      console.log('Diagnosis data:', diagnosisData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.post('repairs/ADD_DIAGNOSIS', diagnosisData, { id: diagnosisData.repairId });
        return response;
      } catch (apiError) {
        console.warn('API call failed for adding diagnosis, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate new diagnosis with ID and timestamps
        const newDiagnosis: DiagnosisReport = {
          ...diagnosisData,
          id: `diag-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return newDiagnosis;
      }
    } catch (error) {
      console.error('Error adding diagnosis report:', error);
      throw new Error('Failed to add diagnosis report');
    }
  },

  /**
   * Add a part to a repair ticket
   */
  async addPart(partData: AddPartInput): Promise<RepairPart> {
    try {
      console.log('Adding repair part using enhanced API client');
      console.log('Part data:', partData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.post('repairs/ADD_PART', partData, { id: partData.repairId });
        return response;
      } catch (apiError) {
        console.warn('API call failed for adding part, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));

        // Calculate total cost if not provided
        const totalCost = partData.totalCost || (partData.quantity * partData.unitCost);

        // Generate new part with ID
        const newPart: RepairPart = {
          ...partData,
          id: `part-${Date.now()}`,
          totalCost,
          orderedAt: partData.isOrdered ? new Date().toISOString() : undefined,
          receivedAt: partData.isReceived ? new Date().toISOString() : undefined
        };

        return newPart;
      }
    } catch (error) {
      console.error('Error adding repair part:', error);
      throw new Error('Failed to add repair part');
    }
  },

  /**
   * Update a part's status
   */
  async updatePartStatus(partId: string, isOrdered: boolean, isReceived: boolean, isInstalled: boolean): Promise<RepairPart> {
    try {
      console.log(`Updating part status for part ${partId} using enhanced API client`);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.patch('repairs/UPDATE_PART',
          { isOrdered, isReceived, isInstalled },
          { id: partId }
        );
        return response;
      } catch (apiError) {
        console.warn(`API call failed for updating part ${partId}, falling back to mock implementation:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // In a real application, this would make an API call
        // For now, simulate an updated part
        const updatedPart: RepairPart = {
          id: partId,
          repairId: 'repair-1', // Placeholder
          productId: 'product-1', // Placeholder
          quantity: 1, // Placeholder
          unitCost: 100, // Placeholder
          totalCost: 100, // Placeholder
          isOrdered,
          isReceived,
          isInstalled,
          orderedAt: isOrdered ? new Date().toISOString() : undefined,
          receivedAt: isReceived ? new Date().toISOString() : undefined
        };

        return updatedPart;
      }
    } catch (error) {
      console.error(`Error updating part status for part ${partId}:`, error);
      throw error;
    }
  },

  /**
   * Add a service charge to a repair ticket
   */
  async addServiceCharge(chargeData: AddServiceChargeInput): Promise<ServiceCharge> {
    try {
      console.log('Adding service charge using enhanced API client');
      console.log('Charge data:', chargeData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.post('repairs/ADD_CHARGE', chargeData, { id: chargeData.repairId });
        return response;
      } catch (apiError) {
        console.warn('API call failed for adding service charge, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));

        // Calculate total with tax if applicable
        let totalWithTax = chargeData.amount;
        if (chargeData.isTaxable && chargeData.taxRate) {
          totalWithTax = chargeData.amount * (1 + (chargeData.taxRate / 100));
        }

        // Generate new service charge with ID and timestamps
        const newCharge: ServiceCharge = {
          ...chargeData,
          id: `charge-${Date.now()}`,
          totalWithTax,
          createdAt: new Date().toISOString()
        };

        return newCharge;
      }
    } catch (error) {
      console.error('Error adding service charge:', error);
      throw new Error('Failed to add service charge');
    }
  },

  /**
   * Update a repair ticket's status
   */
  async updateStatus(statusData: UpdateStatusInput): Promise<StatusUpdate> {
    try {
      console.log('Updating repair status using enhanced API client');
      console.log('Status data:', statusData);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.patch('repairs/UPDATE_STATUS', statusData, { id: statusData.repairId });
        return response;
      } catch (apiError) {
        console.warn('API call failed for updating status, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));

        // Generate new status update with ID and timestamps
        const newStatus: StatusUpdate = {
          ...statusData,
          id: `status-${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        return newStatus;
      }
    } catch (error) {
      console.error('Error updating repair status:', error);
      throw new Error('Failed to update repair status');
    }
  },

  /**
   * Fetch repair tickets by customer ID
   */
  async fetchByCustomerId(customerId: string): Promise<RepairTicket[]> {
    try {
      console.log(`Fetching repairs for customer ${customerId} using enhanced API client`);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.get('repairs/LIST', undefined, {
          params: { customerId }
        });
        return response;
      } catch (apiError) {
        console.warn(`API call failed for customer ${customerId}, falling back to mock implementation:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filter mock repairs by customer ID
        const repairs = MOCK_REPAIRS.filter(repair => repair.customerId === customerId);

        return repairs;
      }
    } catch (error) {
      console.error(`Error fetching repairs for customer ${customerId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch repair tickets assigned to a technician
   */
  async fetchByTechnicianId(technicianId: string): Promise<RepairTicket[]> {
    try {
      console.log(`Fetching repairs assigned to technician ${technicianId} using enhanced API client`);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.get('repairs/LIST', undefined, {
          params: { technicianId }
        });
        return response;
      } catch (apiError) {
        console.warn(`API call failed for technician ${technicianId}, falling back to mock implementation:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Filter mock repairs by technician ID
        const repairs = MOCK_REPAIRS.filter(repair => repair.assignedToId === technicianId);

        return repairs;
      }
    } catch (error) {
      console.error(`Error fetching repairs for technician ${technicianId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch available technicians
   */
  async fetchTechnicians(): Promise<any[]> {
    try {
      console.log('Fetching technicians using enhanced API client');

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.get('repairs/TECHNICIANS');
        return response;
      } catch (apiError) {
        console.warn('API call failed for fetching technicians, falling back to mock implementation:', apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return MOCK_TECHNICIANS;
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      throw new Error('Failed to fetch technicians');
    }
  },

  /**
   * Generate a repair report
   */
  async generateReport(repairId: string): Promise<Blob> {
    try {
      console.log(`Generating report for repair ${repairId} using enhanced API client`);

      // Try to use the enhanced API client
      try {
        const response = await enhancedApiClient.post('repairs/GENERATE_REPORT',
          { format: 'pdf' },
          { id: repairId }
        );
        return response;
      } catch (apiError) {
        console.warn(`API call failed for generating report for repair ${repairId}, falling back to mock implementation:`, apiError);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real application, this would make an API call that returns a PDF or similar
        // For now, return an empty blob
        return new Blob(['Repair report placeholder'], { type: 'application/pdf' });
      }
    } catch (error) {
      console.error(`Error generating report for repair ${repairId}:`, error);
      throw error;
    }
  }
};