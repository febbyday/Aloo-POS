import { useState, useEffect, useCallback } from 'react';
import { repairService } from '../services/repairService';
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
  REPAIR_STATUS
} from '../types';

interface UseRepairReturnType {
  // State
  repairs: RepairTicket[];
  selectedRepair: RepairTicket | null;
  technicians: any[];
  isLoading: boolean;
  error: Error | null;
  
  // Repair ticket actions
  fetchRepairs: () => Promise<void>;
  fetchRepairById: (id: string) => Promise<void>;
  createRepair: (repair: CreateRepairInput) => Promise<RepairTicket>;
  updateRepair: (id: string, repair: UpdateRepairInput) => Promise<RepairTicket>;
  
  // Customer view
  fetchRepairsByCustomer: (customerId: string) => Promise<void>;
  
  // Technician view
  fetchRepairsByTechnician: (technicianId: string) => Promise<void>;
  fetchTechnicians: () => Promise<void>;
  
  // Diagnosis actions
  addDiagnosis: (diagnosis: CreateDiagnosisInput) => Promise<DiagnosisReport>;
  
  // Parts actions
  addPart: (part: AddPartInput) => Promise<RepairPart>;
  updatePartStatus: (
    partId: string,
    isOrdered: boolean,
    isReceived: boolean,
    isInstalled: boolean
  ) => Promise<RepairPart>;
  
  // Service charge actions
  addServiceCharge: (charge: AddServiceChargeInput) => Promise<ServiceCharge>;
  
  // Status actions
  updateStatus: (status: UpdateStatusInput) => Promise<StatusUpdate>;
  
  // Report actions
  generateReport: (repairId: string) => Promise<Blob>;
}

export function useRepairs(): UseRepairReturnType {
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<RepairTicket | null>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch all repair tickets
  const fetchRepairs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.fetchAll();
      setRepairs(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repairs'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch a single repair ticket by ID
  const fetchRepairById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.fetchById(id);
      setSelectedRepair(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch repair with ID ${id}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Create a new repair ticket
  const createRepair = useCallback(async (repairData: CreateRepairInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.createRepair(repairData);
      setRepairs(prevRepairs => [...prevRepairs, result]);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create repair');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update an existing repair ticket
  const updateRepair = useCallback(async (id: string, repairData: UpdateRepairInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.updateRepair(id, repairData);
      
      // Update repair in the list
      setRepairs(prevRepairs => 
        prevRepairs.map(repair => repair.id === id ? result : repair)
      );
      
      // Update selectedRepair if it's the one being edited
      if (selectedRepair && selectedRepair.id === id) {
        setSelectedRepair(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update repair with ID ${id}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Fetch repairs by customer ID
  const fetchRepairsByCustomer = useCallback(async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.fetchByCustomerId(customerId);
      setRepairs(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch repairs for customer ${customerId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch repairs by technician ID
  const fetchRepairsByTechnician = useCallback(async (technicianId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.fetchByTechnicianId(technicianId);
      setRepairs(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch repairs for technician ${technicianId}`));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch technicians
  const fetchTechnicians = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.fetchTechnicians();
      setTechnicians(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch technicians'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Add diagnosis to a repair
  const addDiagnosis = useCallback(async (diagnosisData: CreateDiagnosisInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.addDiagnosis(diagnosisData);
      
      // Update the selected repair if it's the one being modified
      if (selectedRepair && selectedRepair.id === diagnosisData.repairId) {
        const updatedDiagnoses = selectedRepair.diagnosis 
          ? [...selectedRepair.diagnosis, result] 
          : [result];
        
        setSelectedRepair({
          ...selectedRepair,
          diagnosis: updatedDiagnoses
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add diagnosis');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Add part to a repair
  const addPart = useCallback(async (partData: AddPartInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.addPart(partData);
      
      // Update the selected repair if it's the one being modified
      if (selectedRepair && selectedRepair.id === partData.repairId) {
        const updatedParts = selectedRepair.parts 
          ? [...selectedRepair.parts, result] 
          : [result];
        
        setSelectedRepair({
          ...selectedRepair,
          parts: updatedParts
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add part');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Update part status
  const updatePartStatus = useCallback(async (
    partId: string,
    isOrdered: boolean,
    isReceived: boolean,
    isInstalled: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.updatePartStatus(partId, isOrdered, isReceived, isInstalled);
      
      // Update the selected repair if it contains the part being modified
      if (selectedRepair && selectedRepair.parts) {
        const partIndex = selectedRepair.parts.findIndex(part => part.id === partId);
        
        if (partIndex !== -1) {
          const updatedParts = [...selectedRepair.parts];
          updatedParts[partIndex] = result;
          
          setSelectedRepair({
            ...selectedRepair,
            parts: updatedParts
          });
        }
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to update part status for part ${partId}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Add service charge to a repair
  const addServiceCharge = useCallback(async (chargeData: AddServiceChargeInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.addServiceCharge(chargeData);
      
      // Update the selected repair if it's the one being modified
      if (selectedRepair && selectedRepair.id === chargeData.repairId) {
        const updatedCharges = selectedRepair.charges 
          ? [...selectedRepair.charges, result] 
          : [result];
        
        setSelectedRepair({
          ...selectedRepair,
          charges: updatedCharges
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add service charge');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Update repair status
  const updateStatus = useCallback(async (statusData: UpdateStatusInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.updateStatus(statusData);
      
      // Update the selected repair if it's the one being modified
      if (selectedRepair && selectedRepair.id === statusData.repairId) {
        const updatedStatusHistory = selectedRepair.statusHistory 
          ? [...selectedRepair.statusHistory, result] 
          : [result];
        
        setSelectedRepair({
          ...selectedRepair,
          status: statusData.status,
          statusHistory: updatedStatusHistory
        });
        
        // Also update the repair in the repairs list
        setRepairs(prevRepairs => 
          prevRepairs.map(repair => 
            repair.id === statusData.repairId 
              ? { ...repair, status: statusData.status } 
              : repair
          )
        );
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update repair status');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [selectedRepair]);
  
  // Generate a repair report
  const generateReport = useCallback(async (repairId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await repairService.generateReport(repairId);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to generate report for repair ${repairId}`);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch repairs on initial load
  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);
  
  return {
    // State
    repairs,
    selectedRepair,
    technicians,
    isLoading,
    error,
    
    // Repair ticket actions
    fetchRepairs,
    fetchRepairById,
    createRepair,
    updateRepair,
    
    // Customer view
    fetchRepairsByCustomer,
    
    // Technician view
    fetchRepairsByTechnician,
    fetchTechnicians,
    
    // Diagnosis actions
    addDiagnosis,
    
    // Parts actions
    addPart,
    updatePartStatus,
    
    // Service charge actions
    addServiceCharge,
    
    // Status actions
    updateStatus,
    
    // Report actions
    generateReport
  };
} 