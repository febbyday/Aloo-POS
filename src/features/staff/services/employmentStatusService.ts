import { type EmploymentStatus } from "../types/employmentStatus"
import { enhancedApiClient } from "@/lib/api/enhanced-api-client"
import { EMPLOYMENT_ENDPOINTS } from "@/lib/api/endpoint-registry"
import { ApiError, ApiErrorType, createErrorHandler } from "@/lib/api/error-handler"

// Create a module-specific error handler
const employmentErrorHandler = createErrorHandler('employment');

// Define retry configuration for employment endpoints
const EMPLOYMENT_RETRY_CONFIG = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 2,
  shouldRetry: (error: ApiError) => {
    // Only retry network or server errors, not validation or auth errors
    return [ApiErrorType.NETWORK, ApiErrorType.SERVER, ApiErrorType.TIMEOUT].includes(error.type);
  }
};

class EmploymentStatusService {
  async getAllStatuses(): Promise<EmploymentStatus[]> {
    const [result, error] = await employmentErrorHandler.safeCall(
      async () => {
        return await employmentErrorHandler.withRetry(
          () => enhancedApiClient.get<EmploymentStatus[]>(
            'employment/STATUSES',
            undefined,
            { cache: 'default' }
          ),
          EMPLOYMENT_RETRY_CONFIG
        );
      },
      'Error fetching employment statuses'
    );

    if (error) {
      console.error("Error fetching employment statuses:", error);
      throw error;
    }

    return result || [];
  }

  async getStatusById(id: string | number): Promise<EmploymentStatus | undefined> {
    const [result, error] = await employmentErrorHandler.safeCall(
      async () => {
        return await employmentErrorHandler.withRetry(
          () => enhancedApiClient.get<EmploymentStatus>(
            'employment/STATUSES',
            { id: id.toString() },
            { cache: 'default' }
          ),
          EMPLOYMENT_RETRY_CONFIG
        );
      },
      `Error fetching employment status ${id}`
    );

    if (error) {
      console.error(`Error fetching employment status ${id}:`, error);
      throw error;
    }

    return result;
  }

  async createStatus(status: Omit<EmploymentStatus, "id">): Promise<EmploymentStatus> {
    const [result, error] = await employmentErrorHandler.safeCall(
      () => enhancedApiClient.post<EmploymentStatus>(
        'employment/STATUSES',
        status
      ),
      'Error creating employment status'
    );

    if (error) {
      console.error("Error creating employment status:", error);
      throw error;
    }

    return result as EmploymentStatus;
  }

  async updateStatus(id: string | number, status: Partial<EmploymentStatus>): Promise<EmploymentStatus> {
    const [result, error] = await employmentErrorHandler.safeCall(
      () => enhancedApiClient.patch<EmploymentStatus>(
        'employment/STATUSES',
        status,
        { id: id.toString() }
      ),
      `Error updating employment status ${id}`
    );

    if (error) {
      console.error(`Error updating employment status ${id}:`, error);
      throw error;
    }

    return result as EmploymentStatus;
  }

  async deleteStatus(id: string | number): Promise<void> {
    const [_, error] = await employmentErrorHandler.safeCall(
      () => enhancedApiClient.delete(
        'employment/STATUSES',
        { id: id.toString() }
      ),
      `Error deleting employment status ${id}`
    );

    if (error) {
      console.error(`Error deleting employment status ${id}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const employmentStatusService = new EmploymentStatusService()
